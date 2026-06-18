import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, CheckCircle, Clock, Pencil, Trash2, Briefcase, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TaskModal from '../components/TaskModal';

const statusLabel = { pending: 'Pendente', in_progress: 'Em andamento', completed: 'Concluída' };
const statusStyle = {
  pending:     { backgroundColor: '#f4e4c3', color: '#906a47', border: '1px solid #d4c4a8' },
  in_progress: { backgroundColor: '#906a47', color: '#fff' },
  completed:   { backgroundColor: '#2e313c', color: '#f4e4c3' },
};
const priorityStyle = {
  low:    { backgroundColor: '#e7e6e4', color: '#2e313c' },
  medium: { backgroundColor: '#c4a882', color: '#fff' },
  high:   { backgroundColor: '#7a3a2a', color: '#fff' },
};
const priorityLabel = { low: 'Baixa', medium: 'Média', high: 'Alta' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => { api.get('/clients').then(r => setClients(r.data)); }, []);

  const load = useCallback(async () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterPriority) params.priority = filterPriority;
    if (filterClient) params.client_id = filterClient;
    const { data } = await api.get('/tasks', { params });
    setTasks(data);
  }, [filterStatus, filterPriority, filterClient]);

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

  const selectStyle = {
    border: '1px solid #d4c4a8',
    backgroundColor: '#f4e4c3',
    color: '#2e313c',
    borderRadius: '0.5rem',
    padding: '0.4rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: '#2e313c' }}>Tarefas</h1>
          <p className="text-sm mt-0.5" style={{ color: '#906a47' }}>{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditTask(null); setShowModal(true); }}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          style={{ backgroundColor: '#906a47' }}>
          <Plus size={16} /> Nova tarefa
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4a882' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tarefas..."
            style={{ ...selectStyle, paddingLeft: '2.2rem', width: '100%' }} />
        </div>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={selectStyle}>
          <option value="">Todos os clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluída</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={selectStyle}>
          <option value="">Todas as prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#d4c4a8' }}>
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: '#906a47', backgroundColor: '#f4e4c3' }}>Nenhuma tarefa encontrada</p>
        ) : (
          <div>
            {filtered.map(task => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-4 group transition"
                style={{ backgroundColor: '#f4e4c3', borderBottom: '1px solid #d4c4a8' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ecdcc0'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f4e4c3'}>

                <button onClick={() => handleComplete(task)} className="flex-shrink-0 transition"
                  style={{ color: task.status === 'completed' ? '#2e313c' : '#d4c4a8' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#906a47'}
                  onMouseLeave={e => e.currentTarget.style.color = task.status === 'completed' ? '#2e313c' : '#d4c4a8'}>
                  <CheckCircle size={22} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium" style={{ color: task.status === 'completed' ? '#c4a882' : '#2e313c', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                      {task.title}
                    </p>
                    {task.recorrente && <RefreshCw size={12} style={{ color: '#906a47' }} title="Recorrente" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.client_name && (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#906a47' }}>
                        <Briefcase size={10} />{task.client_name}
                      </span>
                    )}
                    {task.competencia && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#e7e6e4', color: '#2e313c' }}>
                        Comp. {task.competencia.slice(0, 7).replace('-', '/')}
                      </span>
                    )}
                    {task.category_name && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: task.category_color || '#906a47' }}>{task.category_name}</span>
                    )}
                    {task.assigned_to_name && <span className="text-xs" style={{ color: '#c4a882' }}>{task.assigned_to_name}</span>}
                    {task.due_date && (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#c4a882' }}>
                        <Clock size={11} /> {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block"
                    style={priorityStyle[task.priority]}>{priorityLabel[task.priority]}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={statusStyle[task.status]}>{statusLabel[task.status]}</span>
                  <button onClick={() => { setEditTask(task); setShowModal(true); }}
                    className="p-1 transition opacity-0 group-hover:opacity-100"
                    style={{ color: '#c4a882' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#906a47'}
                    onMouseLeave={e => e.currentTarget.style.color = '#c4a882'}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(task.id)}
                    className="p-1 transition opacity-0 group-hover:opacity-100"
                    style={{ color: '#c4a882' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#7a3a2a'}
                    onMouseLeave={e => e.currentTarget.style.color = '#c4a882'}>
                    <Trash2 size={15} />
                  </button>
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
