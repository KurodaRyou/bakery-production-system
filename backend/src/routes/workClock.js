const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * 获取工作流程模板列表
 * GET /api/workflow-templates
 * Query: user_id (可选，NULL 返回通用模板)
 * 
 * 数据库结构:
 * workflow_templates: id, name, user_id, steps(JSON), is_active, created_at, updated_at
 * 
 * steps JSON 格式:
 * [
 *   { time: "06:00", duration: 90, task_type: "打面", dough_id: 1, description: "" },
 *   { time: "07:30", duration: 30, task_type: "整形", dough_id: 1, description: "" },
 * ]
 */
router.get('/workflow-templates', requireAuth, async (req, res) => {
    try {
        const { user_id } = req.query;
        let sql = 'SELECT * FROM workflow_templates WHERE is_active = 1';
        let params = [];
        
        // TODO: 暂时注释，等真实数据结构
        // if (user_id) {
        //     sql += ' AND (user_id = ? OR user_id IS NULL)';
        //     params.push(user_id);
        // } else {
        //     sql += ' AND user_id IS NULL';
        // }
        
        const [rows] = await pool.query(sql, params);
        
        // 解析 steps JSON
        const templates = rows.map(row => ({
            ...row,
            steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps
        }));
        
        res.json(templates);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

/**
 * 创建工作流程模板
 * POST /api/workflow-templates
 * Body: { name, user_id, steps }
 */
router.post('/workflow-templates', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, user_id, steps } = req.body;
        
        if (!name || !steps) {
            return res.status(400).json({ error: 'name 和 steps 是必填参数' });
        }
        
        // TODO: 暂时注释，等真实数据结构
        // const [result] = await pool.query(
        //     'INSERT INTO workflow_templates (name, user_id, steps) VALUES (?, ?, ?)',
        //     [name, user_id || null, JSON.stringify(steps)]
        // );
        // res.json({ id: result.insertId, success: true });
        
        res.status(501).json({ error: '待实现：需要先完善数据结构' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

/**
 * 获取某天的所有工作日程
 * GET /api/workday-slots
 * Query: date (必填，格式 YYYY-MM-DD), user_id (必填)
 * 
 * 数据库结构:
 * workday_slots: id, date, user_id, slot_index(0-287), task_type, product_id, 
 *                description, duration_slots, is_temporary, status, created_at, updated_at
 * 
 * slot_index: 每5分钟一个槽，0=00:00, 1=00:05, ..., 287=23:55
 * task_type: 打面/整形/准备馅料/其他
 * status: pending/running/completed
 */
router.get('/workday-slots', requireAuth, async (req, res) => {
    try {
        const { date, user_id } = req.query;
        
        if (!date || !user_id) {
            return res.status(400).json({ error: 'date 和 user_id 是必填参数' });
        }
        
        // ⛔ 待取消注释：等真实数据结构完善后，取消下面几行注释
        // const [rows] = await pool.query(
        //     `SELECT ws.*, p.name as product_name, dt.name as dough_name 
        //      FROM workday_slots ws 
        //      LEFT JOIN products p ON ws.product_id = p.id 
        //      LEFT JOIN dough_types dt ON p.dough_id = dt.id
        //      WHERE ws.date = ? AND ws.user_id = ?
        //      ORDER BY ws.slot_index`,
        //     [date, user_id]
        // );
        
        // 模拟数据返回（待取消注释后删除此行）
        res.json([]);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

/**
 * 插入临时工作（只能插入空闲 slot）
 * POST /api/workday-slots
 * Body: { date, user_id, slot_index, task_type, product_id, description, duration_slots }
 * 
 * 规则:
 * - 临时工作只能插入空闲的 slot
 * - 不能覆盖已有工作
 * - duration_slots 可以为 NULL（无时长）
 */
router.post('/workday-slots', requireAuth, async (req, res) => {
    try {
        const { date, user_id, slot_index, task_type, product_id, description, duration_slots } = req.body;
        
        if (!date || !user_id || slot_index === undefined) {
            return res.status(400).json({ error: '缺少必填参数' });
        }
        
        // TODO: 暂时注释，等真实数据结构
        // // 检查目标 slot 是否空闲
        // const [existing] = await pool.query(
        //     'SELECT id FROM workday_slots WHERE date = ? AND user_id = ? AND slot_index = ?',
        //     [date, user_id, slot_index]
        // );
        // 
        // if (existing.length > 0) {
        //     return res.status(400).json({ error: '该时间槽已被占用' });
        // }
        // 
        // // 插入新工作
        // const [result] = await pool.query(
        //     `INSERT INTO workday_slots (date, user_id, slot_index, task_type, product_id, description, duration_slots, is_temporary, status)
        //      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pending')`,
        //     [date, user_id, slot_index, task_type, product_id, description, duration_slots]
        // );
        // 
        // res.json({ id: result.insertId, success: true });
        
        res.status(501).json({ error: '待实现：需要先完善数据结构' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

/**
 * 更新工作状态
 * PUT /api/workday-slots/:id
 * Body: { status }
 * 
 * status: pending -> running -> completed
 */
router.put('/workday-slots/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'status 是必填参数' });
        }
        
        // TODO: 暂时注释，等真实数据结构
        // await pool.query('UPDATE workday_slots SET status = ? WHERE id = ?', [status, id]);
        // res.json({ success: true });
        
        res.status(501).json({ error: '待实现：需要先完善数据结构' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

/**
 * 获取班次配置
 * GET /api/shifts
 * 
 * 班次边界（固定）:
 * - 早班: 06:00-14:00 (slot 72-167)
 * - 中班: 14:00-22:00 (slot 168-263)
 * - 夜班: 22:00-06:00 (slot 264-287 + 0-71)
 */
router.get('/shifts', requireAuth, async (req, res) => {
    try {
        const shifts = [
            { id: 'morning', name: '早班', start: '06:00', end: '14:00', start_slot: 72, end_slot: 167 },
            { id: 'afternoon', name: '中班', start: '14:00', end: '22:00', start_slot: 168, end_slot: 263 },
            { id: 'night', name: '夜班', start: '22:00', end: '06:00', start_slot: 264, end_slot: 71, next_day: true }
        ];
        res.json(shifts);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

/**
 * 创建班次
 * POST /api/shifts
 * Body: { name, start, end, start_slot, end_slot }
 */
router.post('/shifts', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, start, end, start_slot, end_slot } = req.body;
        
        if (!name || !start || !end) {
            return res.status(400).json({ error: 'name, start, end 是必填参数' });
        }
        
        // TODO: 暂时注释，等真实数据结构
        // const [result] = await pool.query(
        //     'INSERT INTO shifts (name, start, end, start_slot, end_slot) VALUES (?, ?, ?, ?, ?)',
        //     [name, start, end, start_slot, end_slot]
        // );
        // res.json({ id: result.insertId, success: true });
        
        res.status(501).json({ error: '待实现：需要先完善数据结构' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;
