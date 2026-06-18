const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const result = await db.query(
    `SELECT n.*, t.title as task_title FROM notifications n
     LEFT JOIN tasks t ON t.id = n.task_id
     WHERE n.user_id=$1 ORDER BY n.created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.patch('/:id/read', auth, async (req, res) => {
  await db.query('UPDATE notifications SET read=TRUE WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

router.patch('/read-all', auth, async (req, res) => {
  await db.query('UPDATE notifications SET read=TRUE WHERE user_id=$1', [req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
