import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import emmiLogo from '../logo-emmi-claro.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      toast.error('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2e313c' }}>
      <div className="rounded-2xl shadow-xl p-8 w-full max-w-md" style={{ backgroundColor: '#f4e4c3' }}>

        <div className="flex flex-col items-center mb-8">
          <img src={emmiLogo} alt="Emmi Empresarial" style={{ width: '70%', height: 'auto', filter: 'brightness(0.2)' }} />
          <p className="text-sm mt-3" style={{ color: '#906a47', letterSpacing: '0.08em' }}>GERENCIADOR DE TAREFAS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#2e313c' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 text-sm"
              style={{ border: '1px solid #d4c4a8', backgroundColor: '#fff', '--tw-ring-color': '#906a47' }}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#2e313c' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 text-sm"
              style={{ border: '1px solid #d4c4a8', backgroundColor: '#fff' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
            style={{ backgroundColor: '#906a47' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7a5a3a'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#906a47'}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
