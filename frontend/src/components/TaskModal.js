import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    due_date: '', category_id: '', assigned_to: '', status: 'pending',
    client_id: '', competencia: '', recorrente: false, recorrencia_dia: 1,
  });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    api.get('/users').then(r => setUsers(r.data));
    api.get('/clients').then(r => setClients(r.data));
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        category_id: task.category_id || '',
        assigned_to: task.assigned_to || '',
        status: task.status || 'pending',
        client_id: task.client_id || '',
        competencia: task.competencia || '',
        recorrente: task.recorrente || false,
        recorrencia_dia: task.recorrencia_dia || 1,
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        due_date: form.due_date || null,
        category_id: form.category_id || null,
        assigned_to: form.assigned_to || null,
        client_id: form.client_id || null,
        competencia: form.competencia || null,
      };
      if (task?.id) await api.put(`/tasks/${task.id}`, payload);
      else await api.post('/tasks', payload);
      toast.success(task?.id ? 'Tarefa atualizada!' : 'Tarefa criada!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#f4e4c3' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #d4c4a8' }}>
          <h2 className="font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#2e313c' }}>
            {task?.id ? 'Editar tarefa' : 'Nova tarefa'}
          </h2>
          <button onClick={onClose}><X size={20} style={{ color: '#906a47' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Título *</label>
            <input value={form.title} onChange={set('title')} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}
              placeholder="Ex: Folha de pagamento" />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Cliente</label>
            <select value={form.client_id} onChange={set('client_id')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}>
              <option value="">Sem cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Competência */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Competência (mês/ano)</label>
              <input type="month" value={form.competencia} onChange={set('competencia')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Prazo de entrega</label>
              <input type="datetime-local" value={form.due_date} onChange={set('due_date')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Descrição</label>
            <textarea value={form.description} onChange={set('description')} rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}
              placeholder="Detalhes da tarefa..." />
          </div>

          {/* Prioridade, Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Prioridade</label>
              <select value={form.priority} onChange={set('priority')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Status</label>
              <select value={form.status} onChange={set('status')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}>
                <option value="pending">Pendente</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>

          {/* Categoria e Responsável */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Categoria</label>
              <select value={form.category_id} onChange={set('category_id')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Responsável</label>
              <select value={form.assigned_to} onChange={set('assigned_to')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}>
                <option value="">Não atribuído</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* Recorrência */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#ecdcc0', border: '1px solid #d4c4a8' }}>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recorrente" checked={form.recorrente} onChange={set('recorrente')}
                className="w-4 h-4 cursor-pointer" style={{ accentColor: '#906a47' }} />
              <label htmlFor="recorrente" className="text-sm font-medium cursor-pointer" style={{ color: '#2e313c' }}>
                Tarefa recorrente (repete mensalmente)
              </label>
            </div>
            {form.recorrente && (
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>
                  Dia do vencimento no mês seguinte
                </label>
                <input type="number" min="1" max="31" value={form.recorrencia_dia} onChange={set('recorrencia_dia')}
                  className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
                <p className="text-xs mt-1" style={{ color: '#906a47', opacity: 0.7 }}>
                  Ao concluir esta tarefa, a próxima competência será criada automaticamente neste dia.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition"
              style={{ border: '1px solid #d4c4a8', color: '#2e313c', backgroundColor: 'transparent' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              style={{ backgroundColor: '#906a47' }}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
