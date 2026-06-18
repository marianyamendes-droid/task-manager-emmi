import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, X, UserCheck, UserX } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Usuário cadastrado com sucesso!');
      setForm({ name: '', email: '', password: '', role: 'member' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: '#2e313c' }}>Usuários</h1>
          <p className="text-sm mt-0.5" style={{ color: '#906a47' }}>Gerencie os membros da equipe</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          style={{ backgroundColor: '#906a47' }}>
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Novo usuário</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl shadow-sm border p-5 space-y-4"
          style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
          <h2 className="font-semibold" style={{ color: '#2e313c' }}>Novo usuário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2e313c' }}>Nome completo *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                placeholder="Ex: Ana Paula"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff', '--tw-ring-color': '#906a47' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2e313c' }}>E-mail *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                placeholder="ana@emmi.com.br"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2e313c' }}>Senha provisória *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                placeholder="Mínimo 6 caracteres"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2e313c' }}>Perfil</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fff' }}>
                <option value="member">Membro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ backgroundColor: '#906a47' }}>
            {loading ? 'Cadastrando...' : 'Cadastrar usuário'}
          </button>
        </form>
      )}

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
        {users.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: '#906a47' }}>Nenhum usuário cadastrado</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#d4c4a8' }}>
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#906a47' }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: '#2e313c' }}>{u.name}</p>
                  <p className="text-sm truncate" style={{ color: '#906a47' }}>{u.email}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
                  style={u.role === 'admin'
                    ? { backgroundColor: '#2e313c', color: '#f4e4c3' }
                    : { backgroundColor: '#e7e6e4', color: '#2e313c' }}>
                  {u.role === 'admin' ? <UserCheck size={12} /> : <UserX size={12} />}
                  {u.role === 'admin' ? 'Administrador' : 'Membro'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
