const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(t.id) as task_count
      FROM clients c
      LEFT JOIN tasks t ON t.client_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const client = await db.query('SELECT * FROM clients WHERE id=$1', [req.params.id]);
    if (!client.rows.length) return res.status(404).json({ error: 'Cliente não encontrado' });
    const tasks = await db.query(`
      SELECT t.*, u.name as assigned_to_name, cat.name as category_name, cat.color as category_color
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN categories cat ON cat.id = t.category_id
      WHERE t.client_id = $1
      ORDER BY t.due_date ASC NULLS LAST
    `, [req.params.id]);
    res.json({ ...client.rows[0], tasks: tasks.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, email, phone, document, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  try {
    const result = await db.query(
      'INSERT INTO clients (name, email, phone, document, notes, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, email, phone, document, notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, document, notes } = req.body;
  try {
    const result = await db.query(
      `UPDATE clients SET
        name=COALESCE($1,name), email=COALESCE($2,email),
        phone=COALESCE($3,phone), document=COALESCE($4,document),
        notes=COALESCE($5,notes)
       WHERE id=$6 RETURNING *`,
      [name, email, phone, document, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM clients WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
