require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { checkOverdueTasks, checkUpcomingTasks } = require('./services/notifications');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

// Verifica tarefas a cada hora
cron.schedule('0 * * * *', async () => {
  await checkOverdueTasks();
  await checkUpcomingTasks();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
