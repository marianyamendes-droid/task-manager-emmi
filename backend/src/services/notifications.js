const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function createNotification(userId, taskId, type, message) {
  await db.query(
    'INSERT INTO notifications (user_id, task_id, type, message) VALUES ($1,$2,$3,$4)',
    [userId, taskId, type, message]
  );
}

async function sendEmailNotification(to, subject, html) {
  if (!process.env.EMAIL_PASS) return;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err.message);
  }
}

async function checkOverdueTasks() {
  const overdue = await db.query(`
    SELECT t.id, t.title, u.email, u.name, u.id as user_id
    FROM tasks t JOIN users u ON u.id = t.assigned_to
    WHERE t.due_date < NOW() AND t.status NOT IN ('completed','overdue')
  `);

  for (const task of overdue.rows) {
    await db.query("UPDATE tasks SET status='overdue' WHERE id=$1", [task.id]);
    await createNotification(task.user_id, task.id, 'overdue', `Tarefa em atraso: ${task.title}`);
    await sendEmailNotification(
      task.email,
      `[Task Manager] Tarefa em atraso: ${task.title}`,
      `<p>Olá ${task.name},</p><p>A tarefa <strong>${task.title}</strong> está em atraso.</p>`
    );
  }
}

async function checkUpcomingTasks() {
  const upcoming = await db.query(`
    SELECT t.id, t.title, t.due_date, u.email, u.name, u.id as user_id
    FROM tasks t JOIN users u ON u.id = t.assigned_to
    WHERE t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
      AND t.status NOT IN ('completed','overdue')
  `);

  for (const task of upcoming.rows) {
    const exists = await db.query(
      "SELECT id FROM notifications WHERE task_id=$1 AND user_id=$2 AND type='due_soon'",
      [task.id, task.user_id]
    );
    if (exists.rows.length) continue;
    await createNotification(task.user_id, task.id, 'due_soon', `Prazo próximo: ${task.title}`);
    await sendEmailNotification(
      task.email,
      `[Task Manager] Prazo se aproximando: ${task.title}`,
      `<p>Olá ${task.name},</p><p>A tarefa <strong>${task.title}</strong> vence em breve.</p>`
    );
  }
}

module.exports = { createNotification, sendEmailNotification, checkOverdueTasks, checkUpcomingTasks };
