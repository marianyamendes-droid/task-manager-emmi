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
    <div className="min-h-screen flex" style={{ backgroundColor: '#2e313c' }}>
      {/* Painel esquerdo decorativo */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#906a47' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(244,228,195,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(46,49,60,0.3) 0%, transparent 50%)'
        }} />
        <div className="relative z-10 text-center px-12">
          <img src={emmiLogo} alt="Emmi Empresarial" style={{ width: '260px', height: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          <div className="mt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2rem' }}>
            <p style={{ color: 'rgba(244,228,195,0.8)', fontSize: '0.75rem', letterSpacing: '0.2em', fontFamily: 'DM Sans, sans-serif' }}>
              ASSESSORIA EMPRESARIAL
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center px-8" style={{ backgroundColor: '#f4e4c3' }}>
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex justify-center mb-10 lg:hidden">
            <img src={emmiLogo} alt="Emmi Empresarial" style={{ width: '180px', height: 'auto', filter: 'brightness(0.2)' }} />
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, color: '#2e313c', lineHeight: 1.1 }}>
              Bem-vindo
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#906a47' }}>Acesse o gerenciador de tarefas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-1.5 tracking-widest uppercase" style={{ color: '#906a47' }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm focus:outline-none transition"
                style={{ border: 'none', borderBottom: '1px solid #c4a882', backgroundColor: 'transparent', color: '#2e313c' }}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 tracking-widest uppercase" style={{ color: '#906a47' }}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm focus:outline-none transition"
                style={{ border: 'none', borderBottom: '1px solid #c4a882', backgroundColor: 'transparent', color: '#2e313c' }}
                placeholder="••••••••"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 text-sm font-medium tracking-widest uppercase transition disabled:opacity-50"
                style={{ backgroundColor: '#2e313c', letterSpacing: '0.15em' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#906a47'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2e313c'}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
