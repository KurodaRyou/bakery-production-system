const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Find which recipes (dough or preparation) currently use given material IDs.
// Returns Map<materialId, [{ type, id, name, version }]>
async function findMaterialRecipeRefs(connection, materialIds) {
    const result = new Map();
    if (!materialIds || materialIds.length === 0) return result;

    const placeholders = materialIds.map(() => '?').join(',');

    const [doughRefs] = await connection.query(`
        SELECT di.material_id, d.id, d.name, d.current_version as version
        FROM dough_ingredients_current di
        JOIN doughs d ON d.id = di.dough_id
        WHERE di.material_id IN (${placeholders})
    `, materialIds);

    const [prepRefs] = await connection.query(`
        SELECT pi.material_id, p.id, p.name, p.current_version as version
        FROM preparation_ingredients_current pi
        JOIN preparations p ON p.id = pi.preparation_id
        WHERE pi.material_id IN (${placeholders})
    `, materialIds);

    for (const row of doughRefs) {
        if (!result.has(row.material_id)) result.set(row.material_id, []);
        result.get(row.material_id).push({ type: 'dough', id: row.id, name: row.name, version: row.version });
    }
    for (const row of prepRefs) {
        if (!result.has(row.material_id)) result.set(row.material_id, []);
        result.get(row.material_id).push({ type: 'preparation', id: row.id, name: row.name, version: row.version });
    }

    return result;
}

// Clean up a material row if nothing else references it (used after deleting associated rows).
async function deleteMaterialIfOrphaned(connection, materialId) {
    if (!materialId) return;
    const [refs] = await connection.query(`
        SELECT 'ingredient' as src FROM ingredients WHERE material_id = ? UNION ALL
        SELECT 'dough_ingredient' FROM dough_ingredients_current WHERE material_id = ? UNION ALL
        SELECT 'preparation_ingredient' FROM preparation_ingredients_current WHERE material_id = ?
    `, [materialId, materialId, materialId]);
    if (refs.length === 0) {
        await connection.query('DELETE FROM materials WHERE id = ?', [materialId]);
    }
}

// ================== Ingredients Routes ==================

router.get('/api/ingredients', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ingredients ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.post('/api/ingredients', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { name, type, default_unit, manufacturer, spec, price } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Ingredient name is required' });
        }

        await connection.beginTransaction();

        const [materialResult] = await connection.query(
            'INSERT INTO materials (name, type) VALUES (?, ?)',
            [name, 'ingredient']
        );
        const materialId = materialResult.insertId;

        const [result] = await connection.query(
            'INSERT INTO ingredients (name, material_id, type, default_unit, manufacturer, spec, price) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE material_id = VALUES(material_id), type = VALUES(type), default_unit = VALUES(default_unit), manufacturer = VALUES(manufacturer), spec = VALUES(spec), price = VALUES(price)',
            [name, materialId, type || 'additive', default_unit || '%', manufacturer || null, spec || null, price || null]
        );

        await connection.commit();
        res.json({ id: result.insertId, material_id: materialId, name, type, default_unit, manufacturer, spec, price });
    } catch (error) {
        await connection.rollback();
        console.error('DB error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

router.put('/api/ingredients/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, default_unit, manufacturer, spec, price } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Ingredient name is required' });
        }
        await pool.query(
            'UPDATE ingredients SET name = ?, type = ?, default_unit = ?, manufacturer = ?, spec = ?, price = ? WHERE id = ?',
            [name, type || 'others', default_unit || '%', manufacturer || null, spec || null, price || null, id]
        );
        res.json({ id: parseInt(id), name, type, default_unit, manufacturer, spec, price });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.delete('/api/ingredients/:id', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const [rows] = await connection.query('SELECT material_id FROM ingredients WHERE id = ?', [id]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ error: '原材料不存在' });
        }
        const materialId = rows[0].material_id;

        const refs = await findMaterialRecipeRefs(connection, [materialId]);
        if (refs.has(materialId)) {
            connection.release();
            return res.status(409).json({
                error: 'material_in_use',
                message: '该原材料正在被配方使用，无法删除。请先从下列配方中移除该材料后再试。',
                references: refs.get(materialId)
            });
        }

        await connection.beginTransaction();
        await connection.query('DELETE FROM ingredients WHERE id = ?', [id]);
        await deleteMaterialIfOrphaned(connection, materialId);
        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

// ================== Materials Routes ==================

router.get('/api/materials', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM materials ORDER BY type, name');
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.post('/api/materials', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'name and type are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO materials (name, type) VALUES (?, ?)',
            [name, type]
        );
        res.json({ id: result.insertId, name, type });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.put('/api/materials/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'name and type are required' });
        }
        await pool.query(
            'UPDATE materials SET name = ?, type = ? WHERE id = ?',
            [name, type, id]
        );
        res.json({ id: parseInt(id), name, type });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.delete('/api/materials/:id', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const materialId = parseInt(id);

        const [rows] = await connection.query('SELECT id, name FROM materials WHERE id = ?', [materialId]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ error: '物料不存在' });
        }

        const refs = await findMaterialRecipeRefs(connection, [materialId]);
        if (refs.has(materialId)) {
            connection.release();
            return res.status(409).json({
                error: 'material_in_use',
                message: '该原材料正在被配方使用，无法删除。请先从下列配方中移除该材料后再试。',
                references: refs.get(materialId)
            });
        }

        await connection.beginTransaction();
        await connection.query('DELETE FROM ingredients WHERE material_id = ?', [materialId]);
        await connection.query('DELETE FROM materials WHERE id = ?', [materialId]);
        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

router.post('/api/materials/batch-delete', requireAuth, requireAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            connection.release();
            return res.status(400).json({ error: 'ids must be a non-empty array' });
        }

        const materialIds = ids.map(id => parseInt(id));
        const refs = await findMaterialRecipeRefs(connection, materialIds);

        const [materials] = await connection.query(
            'SELECT id, name FROM materials WHERE id IN (' + materialIds.map(() => '?').join(',') + ')',
            materialIds
        );

        const failedDeletions = [];
        const safeToDelete = [];

        for (const m of materials) {
            if (refs.has(m.id)) {
                failedDeletions.push({
                    materialId: m.id,
                    materialName: m.name,
                    recipes: refs.get(m.id)
                });
            } else {
                safeToDelete.push(m);
            }
        }

        if (failedDeletions.length > 0) {
            connection.release();
            return res.status(409).json({
                error: 'materials_in_use',
                message: '部分原材料正在被配方使用，无法删除。请先从下列配方中移除对应材料后再试。',
                failedDeletions
            });
        }

        await connection.beginTransaction();
        await connection.query(
            'DELETE FROM ingredients WHERE material_id IN (' + safeToDelete.map(() => '?').join(',') + ')',
            safeToDelete.map(m => m.id)
        );
        await connection.query(
            'DELETE FROM materials WHERE id IN (' + safeToDelete.map(() => '?').join(',') + ')',
            safeToDelete.map(m => m.id)
        );
        await connection.commit();

        res.json({
            deleted: safeToDelete.length,
            deletedMaterials: safeToDelete.map(m => ({ id: m.id, name: m.name }))
        });
    } catch (error) {
        await connection.rollback();
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    } finally {
        connection.release();
    }
});

module.exports = router;
