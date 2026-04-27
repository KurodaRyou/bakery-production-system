const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

async function deleteMaterialIfOrphaned(connection, materialId) {
    if (!materialId) return;
    const [refs] = await connection.query(`
        SELECT 'ingredient' as src FROM ingredients WHERE material_id = ? UNION ALL
        SELECT 'dough_recipe' FROM dough_recipes WHERE material_id = ? UNION ALL
        SELECT 'preparation_recipe' FROM preparation_recipes WHERE material_id = ? UNION ALL
        SELECT 'dough_ingredient' FROM dough_recipe_ingredients_current WHERE material_id = ? UNION ALL
        SELECT 'preparation_ingredient' FROM preparation_ingredients_current WHERE material_id = ?
    `, [materialId, materialId, materialId, materialId, materialId]);
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
        const [rows] = await connection.query('SELECT id FROM materials WHERE id = ?', [id]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ error: '物料不存在' });
        }
        await connection.beginTransaction();
        await deleteMaterialIfOrphaned(connection, id);
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

module.exports = router;
