import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [byUser, setByUser] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get('/reports/by-user').then(r => setByUser(r.data));
    api.get('/reports/by-category').then(r => setByCategory(r.data));
  }, []);

  useEffect(() => {
    api.get(`/reports/timeline?days=${days}`).then(r => setTimeline(r.data));
  }, [days]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Tarefas criadas x concluídas</h2>
          <select value={days} onChange={e => setDays(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={timeline}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="created" name="Criadas" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Por categoria</h2>
          {byCategory.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">Sem dados</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, total }) => `${name} (${total})`}>
                  {byCategory.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By User */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Por responsável</h2>
          <div className="space-y-3">
            {byUser.map((u, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{u.name}</span>
                  <span className="text-xs text-gray-400">{u.completed}/{u.total} concluídas</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: u.total > 0 ? `${(u.completed / u.total) * 100}%` : '0%' }}
                  />
                </div>
                {parseInt(u.overdue) > 0 && (
                  <p className="text-xs text-red-500 mt-0.5">{u.overdue} em atraso</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
