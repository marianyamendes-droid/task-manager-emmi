import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, X, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabel = { pending: 'Pendente', in_progress: 'Em andamento', completed: 'Concluída', overdue: 'Atrasada' };
const statusColor = { pending: '#c4a882', in_progress: '#906a47', completed: '#2e313c', overdue: '#7a3a2a' };

const emptyForm = { name: '', email: '', phone: '', document: '', notes: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [clientDetail, setClientDetail] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const load = () => api.get('/clients').then(r => setClients(r.data));
  useEffect(() => { load(); }, []);

  const handleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); setClientDetail(null); return; }
    setExpanded(id);
    const { data } = await api.get(`/clients/${id}`);
    setClientDetail(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/clients/${editId}`, form);
        toast.success('Cliente atualizado!');
      } else {
        await api.post('/clients', form);
        toast.success('Cliente cadastrado!');
      }
      setForm(emptyForm); setShowForm(false); setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', document: client.document || '', notes: client.notes || '' });
    setEditId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este cliente? As tarefas vinculadas serão desvinculadas.')) return;
    await api.delete(`/clients/${id}`);
    toast.success('Cliente excluído');
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: '#2e313c' }}>Clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: '#906a47' }}>Gerencie os clientes e suas tarefas</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          style={{ backgroundColor: '#906a47' }}>
          {showForm && !editId ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Novo cliente</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-5 space-y-4"
          style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
          <h2 className="font-semibold" style={{ color: '#2e313c' }}>{editId ? 'Editar cliente' : 'Novo cliente'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Nome *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                placeholder="Nome do cliente ou empresa"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@cliente.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Telefone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>CPF / CNPJ</label>
              <input value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))}
                placeholder="000.000.000-00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: '#906a47' }}>Observações</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                placeholder="Informações adicionais..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ backgroundColor: '#906a47' }}>
            {loading ? 'Salvando...' : editId ? 'Atualizar' : 'Cadastrar'}
          </button>
        </form>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#d4c4a8' }}>
        {clients.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: '#906a47', backgroundColor: '#f4e4c3' }}>Nenhum cliente cadastrado</p>
        ) : clients.map(client => (
          <div key={client.id} style={{ borderBottom: '1px solid #d4c4a8' }}>
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
              style={{ backgroundColor: expanded === client.id ? '#ecdcc0' : '#f4e4c3' }}
              onClick={() => handleExpand(client.id)}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ backgroundColor: '#906a47', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                {client.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: '#2e313c' }}>{client.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#906a47' }}>
                  {client.email || 'Sem e-mail'} {client.document ? `· ${client.document}` : ''}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full mr-2" style={{ backgroundColor: '#e7e6e4', color: '#2e313c' }}>
                {client.task_count} tarefa{client.task_count !== '1' ? 's' : ''}
              </span>
              <button onClick={e => { e.stopPropagation(); handleEdit(client); }} className="p-1.5 transition"
                style={{ color: '#c4a882' }} onMouseEnter={e => e.currentTarget.style.color = '#906a47'}
                onMouseLeave={e => e.currentTarget.style.color = '#c4a882'}>
                <Pencil size={15} />
              </button>
              <button onClick={e => { e.stopPropagation(); handleDelete(client.id); }} className="p-1.5 transition"
                style={{ color: '#c4a882' }} onMouseEnter={e => e.currentTarget.style.color = '#7a3a2a'}
                onMouseLeave={e => e.currentTarget.style.color = '#c4a882'}>
                <Trash2 size={15} />
              </button>
              {expanded === client.id ? <ChevronUp size={16} style={{ color: '#906a47' }} /> : <ChevronDown size={16} style={{ color: '#906a47' }} />}
            </div>

            {expanded === client.id && clientDetail && (
              <div className="px-5 py-4" style={{ backgroundColor: '#faf5ec', borderTop: '1px solid #d4c4a8' }}>
                {clientDetail.notes && (
                  <p className="text-sm mb-4 italic" style={{ color: '#906a47' }}>{clientDetail.notes}</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#906a47' }}>Tarefas do cliente</p>
                  <button onClick={() => setShowTaskModal(client.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white transition"
                    style={{ backgroundColor: '#2e313c' }}>
                    <Plus size={12} /> Nova tarefa
                  </button>
                </div>
                {clientDetail.tasks.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: '#c4a882' }}>Nenhuma tarefa para este cliente</p>
                ) : (
                  <div className="space-y-2">
                    {clientDetail.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: '#f4e4c3' }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor[task.status] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#2e313c' }}>{task.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#906a47' }}>
                            {task.assigned_to_name || 'Não atribuído'}
                            {task.due_date ? ` · ${format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}` : ''}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: statusColor[task.status] }}>
                          {statusLabel[task.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showTaskModal && (
        <TaskModal
          task={{ client_id: showTaskModal }}
          onClose={() => setShowTaskModal(false)}
          onSave={() => { setShowTaskModal(false); handleExpand(expanded); }}
        />
      )}
    </div>
  );
}
