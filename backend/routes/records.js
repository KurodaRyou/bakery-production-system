const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { getTimezone } = require('../config/versioning');

// GET /api/records
router.get('/', requireAuth, async (req, res) => {
    try {
        const { limit: limitStr, offset: offsetStr } = req.query;
        if (limitStr && offsetStr) {
            const limit = Math.min(parseInt(limitStr) || 100, 500);
            const offset = parseInt(offsetStr) || 0;
            const [rows] = await pool.query(
                'SELECT *, timezone FROM mixing_records ORDER BY batch_number DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );
            const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM mixing_records');
            return res.json({ records: rows, total, limit, offset });
        }
        const [rows] = await pool.query(`
            SELECT r.*, r.timezone, rv.expected_temp
            FROM mixing_records r
            LEFT JOIN dough_recipes rp ON r.dough_name = rp.name
            LEFT JOIN dough_recipe_versions rv ON rp.id = rv.recipe_id AND rp.current_version = rv.version_number
            ORDER BY r.batch_number DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// POST /api/records
router.post('/', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'manager') {
        return res.status(403).json({ error: '仅管理员和主管可新增打面记录' });
    }
    try {
        const record = req.body;

        if (!record.batch_number) {
            return res.status(400).json({ error: '批次号不能为空' });
        }
        if (!record.dough_name) {
            return res.status(400).json({ error: '面团种类不能为空' });
        }

        if ('created_at' in record || 'updated_at' in record) {
            return res.status(400).json({ error: '字段 created_at, updated_at 不可手动设置' });
        }

        const sql = `INSERT INTO mixing_records
            (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp,
             flour_amount, water_amount, machine_speed, gluten_level,
             output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, timezone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(sql, [
            record.batch_number, record.dough_name, record.dry_temp, record.room_temp,
            record.ice_ratio, record.water_temp, record.flour_amount, record.water_amount,
            record.machine_speed, record.gluten_level, record.output_temp,
            record.machine, record.operator, record.bulk_ferment_temp, record.bulk_ferment_time,
            getTimezone()
        ]);
        res.json({ success: true });
    } catch (error) {
        console.error('Create record error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '该批次号已存在' });
        }
        if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
            return res.status(400).json({ error: '数据超出范围，请检查输入值' });
        }
        console.error('Create record error:', error);
        res.status(500).json({ error: '保存失败，请稍后重试' });
    }
});

// PUT /api/records/:batchNumber
router.put('/:batchNumber', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'manager') {
        return res.status(403).json({ error: '仅管理员和主管可编辑打面记录' });
    }
    try {
        const { batchNumber } = req.params;
        const record = req.body;

        const protectedFields = ['batch_number', 'created_at', 'updated_at'];
        for (const field of protectedFields) {
            if (field in record) {
                return res.status(400).json({ error: `字段 ${field} 不可修改` });
            }
        }

        const allowedFields = {
            dough_name: 'dough_name', dry_temp: 'dry_temp', room_temp: 'room_temp',
            ice_ratio: 'ice_ratio', water_temp: 'water_temp', flour_amount: 'flour_amount',
            water_amount: 'water_amount', dough_weight: 'dough_weight', machine_speed: 'machine_speed',
            gluten_level: 'gluten_level', output_temp: 'output_temp', machine: 'machine',
            operator: 'operator', bulk_ferment_temp: 'bulk_ferment_temp', bulk_ferment_time: 'bulk_ferment_time'
        };
        const setClauses = Object.keys(record).filter(k => allowedFields[k]).map(k => `${allowedFields[k]} = ?`);
        const values = Object.keys(record).filter(k => allowedFields[k]).map(k => record[k]);
        if (setClauses.length === 0) {
            return res.status(400).json({ error: '没有需要更新的字段' });
        }
        await pool.query(`UPDATE mixing_records SET ${setClauses.join(', ')} WHERE batch_number = ?`, [...values, batchNumber]);
        res.json({ success: true });
    } catch (error) {
        console.error('Update record error:', error);
        if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
            return res.status(400).json({ error: '数据超出范围，请检查输入值' });
        }
        console.error('Update record error:', error);
        res.status(500).json({ error: '保存失败，请稍后重试' });
    }
});

// DELETE /api/records/:batchNumber
router.delete('/:batchNumber', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'manager') {
        return res.status(403).json({ error: '仅管理员和主管可删除记录' });
    }
    try {
        const { batchNumber } = req.params;
        await pool.query('DELETE FROM mixing_records WHERE batch_number = ?', [batchNumber]);
        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;