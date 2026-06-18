const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const [total, byStatus, byPriority, overdue, upcoming] = await Promise.all([
      db.query('SELECT COUNT(*) FROM tasks'),
      db.query(`SELECT status, COUNT(*) FROM tasks GROUP BY status`),
      db.query(`SELECT priority, COUNT(*) FROM tasks GROUP BY priority`),
      db.query(`SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status NOT IN ('completed')`),
      db.query(`SELECT t.*, u.name as assigned_to_name, c.name as category_name, c.color as category_color
        FROM tasks t LEFT JOIN users u ON u.id=t.assigned_to LEFT JOIN categories c ON c.id=t.category_id
        WHERE t.due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days' AND t.status != 'completed'
        ORDER BY t.due_date ASC LIMIT 5`),
    ]);

    res.json({
      total: parseInt(total.rows[0].count),
      byStatus: byStatus.rows,
      byPriority: byPriority.rows,
      overdue: parseInt(overdue.rows[0].count),
      upcoming: upcoming.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/by-user', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.name, u.email,
        COUNT(t.id) as total,
        COUNT(t.id) FILTER (WHERE t.status='completed') as completed,
        COUNT(t.id) FILTER (WHERE t.status='pending') as pending,
        COUNT(t.id) FILTER (WHERE t.status='in_progress') as in_progress,
        COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND t.status != 'completed') as overdue
      FROM users u
      LEFT JOIN tasks t ON t.assigned_to = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY total DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/by-category', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.name, c.color,
        COUNT(t.id) as total,
        COUNT(t.id) FILTER (WHERE t.status='completed') as completed,
        COUNT(t.id) FILTER (WHERE t.status!='completed') as pending
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/timeline', auth, async (req, res) => {
  const { days = 30 } = req.query;
  try {
    const result = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as created,
        COUNT(*) FILTER (WHERE status='completed') as completed
      FROM tasks
      WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
