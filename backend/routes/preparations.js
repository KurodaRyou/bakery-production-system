const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { getTimezone } = require('../config/versioning');
const { requireAuth, requireAdmin } = require('../middleware/auth');

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

// GET /api/preparations
router.get('/', requireAuth, async (req, res) => {
    try {
        // Single JOIN query instead of N+1 queries
        const [rows] = await pool.query(`
            SELECT pr.id, pr.name, pr.author, pr.material_id, pr.preparation_id, pr.current_version, pr.loss_rate,
                   pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type,
                   pv.version_number, pv.created_at as version_created_at,
                   pic.id as pi_id, pic.material_id, pic.percentage, pic.stage, pic.note, pic.unit,
                   mp.name as pi_material_name, mp.type as pi_material_type
            FROM preparation_recipes pr
            LEFT JOIN materials m ON pr.material_id = m.id
            LEFT JOIN preparation_versions pv ON pr.id = pv.recipe_id AND pv.version_number = pr.current_version
            LEFT JOIN preparation_ingredients_current pic ON pr.id = pic.preparation_recipe_id AND pic.version = pr.current_version
            LEFT JOIN materials mp ON pic.material_id = mp.id
            ORDER BY pr.id DESC
        `);

        const recipesMap = new Map();
        for (const row of rows) {
            if (!recipesMap.has(row.id)) {
                recipesMap.set(row.id, {
                    id: row.id,
                    name: row.name,
                    author: row.author,
                    material_id: row.material_id,
                    preparation_id: row.preparation_id,
                    current_version: row.current_version,
                    loss_rate: row.loss_rate,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    material_name: row.material_name,
                    material_type: row.material_type,
                    version: row.version_number || row.current_version,
                    ingredients: []
                });
            }
            if (row.pi_id) {
                recipesMap.get(row.id).ingredients.push({
                    id: row.pi_id,
                    material_id: row.material_id,
                    percentage: row.percentage,
                    stage: row.stage,
                    note: row.note,
                    unit: row.unit,
                    material_name: row.pi_material_name,
                    material_type: row.pi_material_type
                });
            }
        }

        res.json(Array.from(recipesMap.values()));
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// GET /api/preparations/:id
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的半成品ID' });
        }
        
        const [recipes] = await pool.query(`
            SELECT pr.id, pr.name, pr.author, pr.material_id, pr.preparation_id, pr.current_version, pr.loss_rate,
                   pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type
            FROM preparation_recipes pr
            LEFT JOIN materials m ON pr.material_id = m.id
            WHERE pr.id = ?
        `, [id]);
        
        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Preparation not found' });
        }
        
        const recipe = recipes[0];
        
        const [ingredients] = await pool.query(`
            SELECT pic.id, pic.material_id, pic.stage, pic.percentage, pic.note, pic.unit,
                   m.name as material_name, m.type as material_type
            FROM preparation_ingredients_current pic
            LEFT JOIN materials m ON pic.material_id = m.id
            WHERE pic.preparation_recipe_id = ? AND pic.version = ?
        `, [id, recipe.current_version]);
        
        recipe.ingredients = ingredients;
        res.json(recipe);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// POST /api/preparations
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { name, author, ingredients } = req.body;
        if (!name) {
            return res.status(400).json({ error: '名称不能为空' });
        }

        await connection.beginTransaction();

        const [materialResult] = await connection.query(
            'INSERT INTO materials (name, type) VALUES (?, ?)',
            [name, 'preparation']
        );
        const materialId = materialResult.insertId;

        let [existing] = await connection.query('SELECT id FROM preparations WHERE name = ?', [name]);
        let preparationId;
        if (existing.length > 0) {
            preparationId = existing[0].id;
            await connection.query('UPDATE preparations SET material_id = ? WHERE id = ?', [materialId, preparationId]);
        } else {
            const [prepResult] = await connection.query(
                'INSERT INTO preparations (name, material_id, description) VALUES (?, ?, ?)',
                [name, materialId, req.body.description || null]
            );
            preparationId = prepResult.insertId;
        }

        const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
        const versionNumber = `v${today}01`;

        const [result] = await connection.query(
            'INSERT INTO preparation_recipes (name, preparation_id, material_id, author, current_version, loss_rate) VALUES (?, ?, ?, ?, ?, ?)',
            [name, preparationId, materialId, author || null, versionNumber, req.body.loss_rate || 1]
        );
        const recipeId = result.insertId;

        await connection.query(
            'INSERT INTO preparation_versions (recipe_id, version_number, timezone) VALUES (?, ?, ?)',
            [recipeId, versionNumber, getTimezone()]
        );

        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                await connection.query(
                    'INSERT INTO preparation_ingredients_current (preparation_recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [recipeId, versionNumber, ing.material_id, ing.stage || 'base', ing.percentage || null, ing.note || null, ing.unit || null]
                );
            }
        }

        await connection.commit();
        res.json({ id: recipeId, preparation_id: preparationId, material_id: materialId, name, version: versionNumber });
    } catch (error) {
        await connection.rollback();
        console.error('DB error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

// PUT /api/preparations/:id
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { name, author, ingredients } = req.body;
        
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的半成品ID' });
        }
        
        await connection.beginTransaction();
        
        const [existing] = await connection.query(
            'SELECT current_version FROM preparation_recipes WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Preparation not found' });
        }
        
        const currentVersion = existing[0].current_version;
        
        const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
        const prefix = `v${today}`;
        
        const [versionRows] = await connection.query(
            'SELECT version_number FROM preparation_versions WHERE recipe_id = ? AND version_number LIKE ?',
            [id, `${prefix}%`]
        );
        
        let newVersion;
        if (versionRows.length === 0) {
            newVersion = `${prefix}01`;
        } else {
            const suffixes = versionRows.map(r => {
                const match = r.version_number.match(/^v\d{8}(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            });
            newVersion = `${prefix}${String(Math.max(...suffixes) + 1).padStart(2, '0')}`;
        }
        
        const [recipeInfo] = await connection.query(
            'SELECT preparation_id, material_id FROM preparation_recipes WHERE id = ?',
            [id]
        );
        const preparationId = recipeInfo[0]?.preparation_id;

        await connection.query(
            'UPDATE preparation_recipes SET name = ?, author = ?, current_version = ?, loss_rate = ? WHERE id = ?',
            [name, author || null, newVersion, req.body.loss_rate || 1, id]
        );

        if (preparationId && name) {
            await connection.query('UPDATE preparations SET name = ? WHERE id = ?', [name, preparationId]);
        }
        
        const [archiveIngredients] = await connection.query(
            'SELECT material_id, stage, percentage, note, unit FROM preparation_ingredients_current WHERE preparation_recipe_id = ? AND version = ?',
            [id, currentVersion]
        );
        
        if (archiveIngredients.length > 0) {
            const [versionInfo] = await connection.query(
                'SELECT id FROM preparation_versions WHERE recipe_id = ? AND version_number = ?',
                [id, currentVersion]
            );
            if (versionInfo.length > 0) {
                for (const ing of archiveIngredients) {
                    await connection.query(
                        'INSERT INTO preparation_ingredients_archive (version_id, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [versionInfo[0].id, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit, null]
                    );
                }
            }
        }
        
        await connection.query('DELETE FROM preparation_ingredients_current WHERE preparation_recipe_id = ? AND version = ?', [id, currentVersion]);
        
        await connection.query(
            'INSERT INTO preparation_versions (recipe_id, version_number, timezone) VALUES (?, ?, ?)',
            [id, newVersion, getTimezone()]
        );
        
        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                await connection.query(
                    'INSERT INTO preparation_ingredients_current (preparation_recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
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

// DELETE /api/preparations/:id
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的半成品ID' });
        }
        
        await connection.beginTransaction();

        const [recipe] = await connection.query('SELECT material_id, preparation_id FROM preparation_recipes WHERE id = ?', [id]);
        const materialId = recipe.length > 0 ? recipe[0].material_id : null;
        const preparationId = recipe.length > 0 ? recipe[0].preparation_id : null;

        const [versions] = await connection.query(
            'SELECT id FROM preparation_versions WHERE recipe_id = ?',
            [id]
        );
        for (const v of versions) {
            await connection.query('DELETE FROM preparation_ingredients_archive WHERE version_id = ?', [v.id]);
        }
        await connection.query('DELETE FROM preparation_versions WHERE recipe_id = ?', [id]);
        await connection.query('DELETE FROM preparation_ingredients_current WHERE preparation_recipe_id = ?', [id]);
        await connection.query('DELETE FROM preparation_recipes WHERE id = ?', [id]);
        await deleteMaterialIfOrphaned(connection, materialId);

        if (preparationId) {
            const [refs] = await connection.query(
                'SELECT 1 FROM preparation_recipes WHERE preparation_id = ?',
                [preparationId]
            );
            if (refs.length === 0) {
                await connection.query('DELETE FROM preparations WHERE id = ?', [preparationId]);
            }
        }

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

router.get('/:id/versions', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const [versions] = await pool.query(
            'SELECT id, recipe_id, version_number, created_at, timezone FROM preparation_versions WHERE recipe_id = ? ORDER BY created_at DESC',
            [id]
        );
        res.json(versions);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.get('/:id/versions/:version', requireAuth, async (req, res) => {
    try {
        const { id, version } = req.params;
        const [ingredients] = await pool.query(`
            SELECT pia.id, pia.material_id, pia.stage, pia.percentage, pia.note, pia.unit, pia.loss_rate,
                   m.name as material_name, m.type as material_type
            FROM preparation_ingredients_archive pia
            LEFT JOIN materials m ON pia.material_id = m.id
            WHERE pia.version_id IN (SELECT id FROM preparation_versions WHERE recipe_id = ? AND version_number = ?)
            ORDER BY pia.stage, pia.id
        `, [id, version]);
        res.json(ingredients);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;
