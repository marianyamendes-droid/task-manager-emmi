import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    due_date: '', category_id: '', assigned_to: '', status: 'pending',
  });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    api.get('/users').then(r => setUsers(r.data));
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        category_id: task.category_id || '',
        assigned_to: task.assigned_to || '',
        status: task.status || 'pending',
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, due_date: form.due_date || null, category_id: form.category_id || null, assigned_to: form.assigned_to || null };
      if (task) await api.put(`/tasks/${task.id}`, payload);
      else await api.post('/tasks', payload);
      toast.success(task ? 'Tarefa atualizada!' : 'Tarefa criada!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-lg">{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Digite o título da tarefa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descreva a tarefa..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="pending">Pendente</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
            <input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Não atribuído</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
