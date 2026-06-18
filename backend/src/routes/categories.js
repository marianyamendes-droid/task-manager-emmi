const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const result = await db.query('SELECT * FROM categories ORDER BY name');
  res.json(result.rows);
});

router.post('/', auth, async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  try {
    const result = await db.query(
      'INSERT INTO categories (name, color, created_by) VALUES ($1,$2,$3) RETURNING *',
      [name, color || '#6366f1', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, color } = req.body;
  try {
    const result = await db.query(
      'UPDATE categories SET name=COALESCE($1,name), color=COALESCE($2,color) WHERE id=$3 RETURNING *',
      [name, color, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
