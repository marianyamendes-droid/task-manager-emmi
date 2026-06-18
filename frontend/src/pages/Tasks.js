import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TaskModal from '../components/TaskModal';

const statusLabel = { pending: 'Pendente', in_progress: 'Em andamento', completed: 'Concluída', overdue: 'Atrasada' };
const statusColor = { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700' };
const priorityColor = { low: 'bg-gray-100 text-gray-600', medium: 'bg-orange-100 text-orange-600', high: 'bg-red-100 text-red-600' };
const priorityLabel = { low: 'Baixa', medium: 'Média', high: 'Alta' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const load = useCallback(async () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterPriority) params.priority = filterPriority;
    const { data } = await api.get('/tasks', { params });
    setTasks(data);
  }, [filterStatus, filterPriority]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta tarefa?')) return;
    await api.delete(`/tasks/${id}`);
    toast.success('Tarefa excluída');
    load();
  };

  const handleComplete = async (task) => {
    await api.put(`/tasks/${task.id}`, { status: task.status === 'completed' ? 'pending' : 'completed' });
    load();
  };

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <button onClick={() => { setEditTask(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Nova tarefa
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluída</option>
          <option value="overdue">Atrasada</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todas as prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nenhuma tarefa encontrada</p>
        ) : (
          <div className="divide-y">
            {filtered.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition group">
                <button onClick={() => handleComplete(task)} className="flex-shrink-0 text-gray-300 hover:text-green-500 transition">
                  <CheckCircle size={22} className={task.status === 'completed' ? 'text-green-500' : ''} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.category_name && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: task.category_color || '#6366f1' }}>{task.category_name}</span>
                    )}
                    {task.assigned_to_name && <span className="text-xs text-gray-400">{task.assigned_to_name}</span>}
                    {task.due_date && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:block ${priorityColor[task.priority]}`}>{priorityLabel[task.priority]}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[task.status]}`}>{statusLabel[task.status]}</span>
                  <button onClick={() => { setEditTask(task); setShowModal(true); }} className="text-gray-300 hover:text-primary-500 transition opacity-0 group-hover:opacity-100"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TaskModal task={editTask} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
