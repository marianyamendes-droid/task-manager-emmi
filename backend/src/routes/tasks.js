const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { createNotification } = require('../services/notifications');

router.get('/', auth, async (req, res) => {
  const { status, category_id, assigned_to, priority, client_id } = req.query;
  let where = [];
  let params = [];
  let i = 1;

  if (status) { where.push(`t.status=$${i++}`); params.push(status); }
  if (category_id) { where.push(`t.category_id=$${i++}`); params.push(category_id); }
  if (assigned_to) { where.push(`t.assigned_to=$${i++}`); params.push(assigned_to); }
  if (priority) { where.push(`t.priority=$${i++}`); params.push(priority); }
  if (client_id) { where.push(`t.client_id=$${i++}`); params.push(client_id); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const result = await db.query(`
      SELECT t.*,
        c.name as category_name, c.color as category_color,
        u1.name as created_by_name,
        u2.name as assigned_to_name,
        cl.name as client_name
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN users u1 ON u1.id = t.created_by
      LEFT JOIN users u2 ON u2.id = t.assigned_to
      LEFT JOIN clients cl ON cl.id = t.client_id
      ${whereClause}
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*,
        c.name as category_name, c.color as category_color,
        u1.name as created_by_name,
        u2.name as assigned_to_name, u2.email as assigned_to_email,
        cl.name as client_name
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN users u1 ON u1.id = t.created_by
      LEFT JOIN users u2 ON u2.id = t.assigned_to
      LEFT JOIN clients cl ON cl.id = t.client_id
      WHERE t.id=$1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, priority, due_date, category_id, assigned_to, client_id, competencia, recorrente, recorrencia_dia } = req.body;
  if (!title) return res.status(400).json({ error: 'Título obrigatório' });

  try {
    const result = await db.query(
      `INSERT INTO tasks (title, description, priority, due_date, category_id, created_by, assigned_to, client_id, competencia, recorrente, recorrencia_dia)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title, description, priority || 'medium', due_date, category_id, req.user.id, assigned_to, client_id, competencia, recorrente || false, recorrencia_dia || 1]
    );
    const task = result.rows[0];

    if (assigned_to && assigned_to !== req.user.id) {
      await createNotification(assigned_to, task.id, 'assigned', `Você foi atribuído à tarefa: ${title}`);
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, due_date, category_id, assigned_to, client_id, competencia, recorrente, recorrencia_dia } = req.body;

  try {
    const prev = await db.query('SELECT * FROM tasks WHERE id=$1', [req.params.id]);
    if (!prev.rows.length) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const completed_at = status === 'completed' ? 'NOW()' : (status && status !== 'completed' ? 'NULL' : null);
    const completedClause = completed_at ? `, completed_at=${completed_at}` : '';

    const result = await db.query(
      `UPDATE tasks SET
        title=COALESCE($1,title),
        description=COALESCE($2,description),
        status=COALESCE($3,status),
        priority=COALESCE($4,priority),
        due_date=COALESCE($5,due_date),
        category_id=COALESCE($6,category_id),
        assigned_to=COALESCE($7,assigned_to),
        client_id=$8,
        competencia=COALESCE($9,competencia),
        recorrente=COALESCE($10,recorrente),
        recorrencia_dia=COALESCE($11,recorrencia_dia)
        ${completedClause}
       WHERE id=$12 RETURNING *`,
      [title, description, status, priority, due_date, category_id, assigned_to, client_id || null, competencia, recorrente, recorrencia_dia, req.params.id]
    );

    const task = result.rows[0];
    const old = prev.rows[0];

    // Se concluída e recorrente, gera próxima competência
    if (status === 'completed' && task.recorrente) {
      const [ano, mes] = (task.competencia || '').split('-').map(Number);
      if (ano && mes) {
        const proxMes = mes === 12 ? 1 : mes + 1;
        const proxAno = mes === 12 ? ano + 1 : ano;
        const proxComp = `${proxAno}-${String(proxMes).padStart(2, '0')}`;
        const dia = task.recorrencia_dia || 1;
        const proxDue = new Date(proxAno, proxMes - 1 + 1, dia);

        await db.query(
          `INSERT INTO tasks (title, description, priority, category_id, created_by, assigned_to, client_id, competencia, recorrente, recorrencia_dia, due_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [task.title, task.description, task.priority, task.category_id, task.created_by, task.assigned_to, task.client_id, proxComp, true, dia, proxDue]
        );
      }
    }

    if (assigned_to && assigned_to !== old.assigned_to && assigned_to !== req.user.id) {
      await createNotification(assigned_to, task.id, 'assigned', `Você foi atribuído à tarefa: ${task.title}`);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
