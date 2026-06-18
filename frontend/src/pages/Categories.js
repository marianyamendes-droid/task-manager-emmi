import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const load = () => api.get('/categories').then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post('/categories', { name: newName, color: newColor });
      setNewName(''); setNewColor('#6366f1');
      toast.success('Categoria criada!');
      load();
    } catch { toast.error('Erro ao criar categoria'); }
  };

  const handleSaveEdit = async (id) => {
    await api.put(`/categories/${id}`, { name: editName, color: editColor });
    setEditId(null);
    toast.success('Categoria atualizada!');
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta categoria?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Categoria excluída');
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Nova categoria</h2>
        <div className="flex gap-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} required
            placeholder="Nome da categoria"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5" title="Cor" />
          <button type="submit" className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus size={16} /> Adicionar
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Nenhuma categoria cadastrada</p>
        ) : (
          <div className="divide-y">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                {editId === cat.id ? (
                  <>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5" />
                    <button onClick={() => handleSaveEdit(cat.id)} className="text-green-500 hover:text-green-700"><Check size={18} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditColor(cat.color); }}
                      className="text-gray-300 hover:text-primary-500 transition"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
