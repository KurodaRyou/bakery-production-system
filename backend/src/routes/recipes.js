const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getTimezone, parseVersionNumber, compareVersions, generateVersionNumber } = require('../config/versioning');
const { encrypt, decrypt } = require('../config/crypto');

async function deleteMaterialIfOrphaned(connection, materialId) {
    if (!materialId) return;
    const [refs] = await connection.query(`
        SELECT 1 FROM ingredients WHERE material_id = ? UNION ALL
        SELECT 1 FROM dough_recipes WHERE material_id = ? UNION ALL
        SELECT 1 FROM preparation_recipes WHERE material_id = ? UNION ALL
        SELECT 1 FROM dough_recipe_ingredients_current WHERE material_id = ? UNION ALL
        SELECT 1 FROM preparation_ingredients_current WHERE material_id = ?
    `, [materialId, materialId, materialId, materialId, materialId]);
    if (refs.length === 0) {
        await connection.query('DELETE FROM materials WHERE id = ?', [materialId]);
    }
}

// GET /api/recipes
router.get('/', requireAuth, async (req, res) => {
    try {
        const [recipes] = await pool.query(`
            SELECT r.id, r.name, r.author, r.material_id, r.current_version, r.loss_rate,
                   r.created_at, r.updated_at, r.timezone, m.name as material_name, m.type as material_type
            FROM dough_recipes r
            LEFT JOIN materials m ON r.material_id = m.id
            ORDER BY r.id DESC
        `);
        res.json(recipes);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// GET /api/recipes/:id
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的配方ID' });
        }
        const [recipes] = await pool.query(`
            SELECT r.id, r.name, r.author, r.material_id, r.current_version, r.loss_rate,
                   r.created_at, r.updated_at, r.timezone, 
                   m.name as material_name, m.type as material_type
            FROM dough_recipes r
            LEFT JOIN materials m ON r.material_id = m.id
            WHERE r.id = ?
        `, [id]);
        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        const [ingredients] = await pool.query(`
            SELECT ric.id, ric.material_id, ric.stage, ric.percentage, ric.note, ric.unit,
                   m.name as material_name, m.type as material_type
            FROM dough_recipe_ingredients_current ric
            LEFT JOIN materials m ON ric.material_id = m.id
            WHERE ric.recipe_id = ? AND ric.version = ?
            ORDER BY ric.stage, ric.id
        `, [id, recipes[0].current_version]);
        
        const [versionInfo] = await pool.query(
            'SELECT expected_temp FROM dough_recipe_versions WHERE recipe_id = ? AND version_number = ?',
            [id, recipes[0].current_version]
        );

        let result = { ...recipes[0], ingredients, expected_temp: versionInfo[0]?.expected_temp || null };
        
        if (!req.session.canViewRecipes) {
            result = {
                ...recipes[0],
                ingredients: ingredients.map(ing => ({
                    ...ing,
                    material_name: '******',
                    note: '******'
                })),
                expected_temp: versionInfo[0]?.expected_temp || null
            };
        }
        
        res.json(result);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// POST /api/recipes
router.post('/', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can create recipes' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { name, type, author, ingredients, expected_temp } = req.body;

        if (!type || !['dough', 'preparation'].includes(type)) {
            return res.status(400).json({ error: 'type must be dough or preparation' });
        }

        // 检查是否已存在同名 materials
        const [existingMaterials] = await connection.query(
            'SELECT id FROM materials WHERE name = ? AND type = ?',
            [name, type]
        );

        let materialId;
        if (existingMaterials.length > 0) {
            materialId = existingMaterials[0].id;
        } else {
            const [materialResult] = await connection.query(
                'INSERT INTO materials (name, type) VALUES (?, ?)',
                [name, type]
            );
            materialId = materialResult.insertId;
        }

        const versionNumber = await generateVersionNumber(connection, null);

        let relatedId = null;
        if (type === 'dough') {
            const [existingDoughs] = await connection.query(
                'SELECT id FROM doughs WHERE material_id = ?',
                [materialId]
            );
            if (existingDoughs.length > 0) {
                relatedId = existingDoughs[0].id;
            } else {
                const [doughResult] = await connection.query(
                    'INSERT INTO doughs (name, material_id) VALUES (?, ?)',
                    [name, materialId]
                );
                relatedId = doughResult.insertId;
            }
        } else if (type === 'preparation') {
            const [existingPreps] = await connection.query(
                'SELECT id FROM preparation_recipes WHERE material_id = ?',
                [materialId]
            );
            if (existingPreps.length > 0) {
                relatedId = existingPreps[0].id;
            } else {
                const [prepResult] = await connection.query(
                    'INSERT INTO preparation_recipes (name, material_id, author) VALUES (?, ?, ?)',
                    [name, materialId, author || null]
                );
                relatedId = prepResult.insertId;
            }
        }

        const [result] = await connection.query(
            'INSERT INTO dough_recipes (name, material_id, author, current_version, loss_rate) VALUES (?, ?, ?, ?, ?)',
            [name, materialId, author || null, versionNumber, req.body.loss_rate || 1]
        );
        const recipeId = result.insertId;

        await connection.query(
            'INSERT INTO dough_recipe_versions (recipe_id, version_number, expected_temp, timezone) VALUES (?, ?, ?, ?)',
            [recipeId, versionNumber, expected_temp || null, getTimezone()]
        );

        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                await connection.query(
                    'INSERT INTO dough_recipe_ingredients_current (recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [recipeId, versionNumber, ing.material_id, ing.stage || 'base', ing.percentage || null, ing.note || null, ing.unit || null]
                );
            }
        }
        await connection.commit();
        res.json({ success: true, id: recipeId, material_id: materialId, related_id: relatedId, version: versionNumber });
    } catch (error) {
        await connection.rollback();
        console.error('DB error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

// PUT /api/recipes/:id
router.put('/:id', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can update recipes' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { name, material_id, author, ingredients, expected_temp, loss_rate, description } = req.body;

        const forbidden = ['id', 'created_at', 'updated_at', 'current_version'];
        for (const key of Object.keys(req.body)) {
            if (forbidden.includes(key)) {
                return res.status(400).json({ error: `字段 ${key} 不可修改` });
            }
        }

        const [recipeRows] = await connection.query(
            'SELECT current_version FROM dough_recipes WHERE id = ?',
            [id]
        );
        if (recipeRows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        const currentVersion = recipeRows[0].current_version;
        const newVersion = await generateVersionNumber(connection, id);

        const [versionResult] = await connection.query(
            'INSERT INTO dough_recipe_versions (recipe_id, version_number, expected_temp, timezone) VALUES (?, ?, ?, ?)',
            [id, newVersion, expected_temp || null, getTimezone()]
        );
        const versionId = versionResult.insertId;

        const [currentIngredients] = await connection.query(
            'SELECT material_id, stage, percentage, note, unit FROM dough_recipe_ingredients_current WHERE recipe_id = ? AND version = ?',
            [id, currentVersion]
        );
        for (const ing of currentIngredients) {
            await connection.query(
                'INSERT INTO dough_recipe_ingredients_archive (version_id, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [versionId, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit, null]
            );
        }

        await connection.query(
            'UPDATE dough_recipes SET name = ?, author = ?, current_version = ?, loss_rate = ? WHERE id = ?',
            [name, author || null, newVersion, loss_rate || 1, id]
        );

        await connection.query('DELETE FROM dough_recipe_ingredients_current WHERE recipe_id = ? AND version = ?', [id, currentVersion]);

        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                await connection.query(
                    'INSERT INTO dough_recipe_ingredients_current (recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id, newVersion, ing.material_id, ing.stage || 'base', ing.percentage || null, ing.note || null, ing.unit || null]
                );
            }
        }
        
        await connection.commit();
        res.json({ success: true, version: newVersion });
    } catch (error) {
        await connection.rollback();
        console.error('DB error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

// DELETE /api/recipes/:id
router.delete('/:id', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can delete recipes' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的配方ID' });
        }

        const [recipe] = await connection.query('SELECT material_id FROM dough_recipes WHERE id = ?', [id]);
        const materialId = recipe.length > 0 ? recipe[0].material_id : null;

        const [versions] = await connection.query(
            'SELECT id FROM dough_recipe_versions WHERE recipe_id = ?',
            [id]
        );
        for (const v of versions) {
            await connection.query('DELETE FROM dough_recipe_ingredients_archive WHERE version_id = ?', [v.id]);
        }
        await connection.query('DELETE FROM dough_recipe_versions WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM dough_recipe_ingredients_current WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM dough_recipes WHERE id = ?', [id]);
        await deleteMaterialIfOrphaned(connection, materialId);

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error('DB error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

// GET /api/recipes/:id/versions
router.get('/:id/versions', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的配方ID' });
        }
        const [versions] = await pool.query(
            'SELECT id, recipe_id, version_number, expected_temp, created_at, timezone FROM dough_recipe_versions WHERE recipe_id = ?',
            [id]
        );
        versions.sort((a, b) => compareVersions(b.version_number, a.version_number));
        res.json(versions);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// GET /api/recipes/:id/versions/:versionNumber
router.get('/:id/versions/:versionNumber', requireAuth, async (req, res) => {
    try {
        const { id, versionNumber } = req.params;
        if (isNaN(parseInt(id)) || !versionNumber) {
            return res.status(400).json({ error: '无效的ID或版本号' });
        }
        const [versions] = await pool.query(
            'SELECT * FROM dough_recipe_versions WHERE recipe_id = ? AND version_number = ?',
            [id, versionNumber]
        );
        if (versions.length === 0) {
            return res.status(404).json({ error: 'Version not found' });
        }
        const [ingredients] = await pool.query(`
            SELECT a.stage, a.material_id, a.percentage, a.note, a.unit, a.loss_rate,
                   m.name as material_name, m.type as material_type
            FROM dough_recipe_ingredients_archive a
            LEFT JOIN materials m ON a.material_id = m.id
            WHERE a.version_id = ? ORDER BY a.stage, a.id
        `, [versions[0].id]);

        let result = { ...versions[0], ingredients };
        
        if (!req.session.canViewRecipes) {
            result = {
                ...versions[0],
                ingredients: ingredients.map(ing => ({
                    ...ing,
                    material_name: '******',
                    note: '******'
                }))
            };
        }

        res.json(result);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// POST /api/recipes/:id/restore/:versionNumber
router.post('/:id/restore/:versionNumber', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can restore recipes' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id, versionNumber } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的配方ID' });
        }

        const [versions] = await connection.query(
            'SELECT * FROM dough_recipe_versions WHERE recipe_id = ? AND version_number = ?',
            [id, versionNumber]
        );
        if (versions.length === 0) {
            return res.status(404).json({ error: 'Version not found' });
        }
        const versionToRestore = versions[0];

        const [recipeRows] = await connection.query(
            'SELECT current_version FROM dough_recipes WHERE id = ?',
            [id]
        );
        const currentVersion = recipeRows[0].current_version;
        const newVersion = await generateVersionNumber(connection, id);

        await connection.query(
            'INSERT INTO dough_recipe_versions (recipe_id, version_number, expected_temp, timezone) VALUES (?, ?, ?, ?)',
            [id, newVersion, versionToRestore.expected_temp || null, getTimezone()]
        );

        await connection.query('DELETE FROM dough_recipe_ingredients_current WHERE recipe_id = ? AND version = ?', [id, currentVersion]);

        const [archivedIngredients] = await connection.query(
            'SELECT material_id, stage, percentage, note, unit FROM dough_recipe_ingredients_archive WHERE version_id = ?',
            [versionToRestore.id]
        );

        for (const ing of archivedIngredients) {
            await connection.query(
                'INSERT INTO dough_recipe_ingredients_current (recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, newVersion, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit]
            );
        }

        await connection.query(
            'UPDATE dough_recipes SET current_version = ? WHERE id = ?',
            [newVersion, id]
        );

        await connection.commit();
        res.json({ success: true, version: newVersion });
    } catch (error) {
        await connection.rollback();
        console.error('DB error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

module.exports = router;
