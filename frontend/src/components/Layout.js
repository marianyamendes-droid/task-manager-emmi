import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import {
  LayoutDashboard, CheckSquare, Tag, BarChart2,
  Bell, LogOut, Menu, X, Users, Briefcase
} from 'lucide-react';
import emmiLogo from '../logo-emmi-claro.png';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { to: '/categories', icon: Tag, label: 'Categorias' },
  { to: '/clients', icon: Briefcase, label: 'Clientes' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
  { to: '/users', icon: Users, label: 'Usuários' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data));
  }, [location.pathname]);

  const unread = notifications.filter(n => !n.read).length;
  const handleLogout = () => { logout(); navigate('/login'); };
  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const currentLabel = navItems.find(n => n.to === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f0e8d8' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform md:relative md:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#2e313c' }}>

        {/* Logo */}
        <div className="flex flex-col items-center px-6 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(244,228,195,0.12)' }}>
          <img src={emmiLogo} alt="Emmi Empresarial" style={{ width: '88%', height: 'auto' }} />
          <button className="absolute top-4 right-4 md:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={active
                  ? { backgroundColor: '#906a47', color: '#fff', borderLeft: '3px solid #f4e4c3' }
                  : { color: '#e7e6e4', opacity: 0.75, borderLeft: '3px solid transparent' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.opacity = '1'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.opacity = '0.75'; } }}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(244,228,195,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: '#906a47', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: '#f4e4c3', opacity: 0.55 }}>
                {user?.role === 'admin' ? 'Administrador' : 'Membro'}
              </p>
            </div>
            <button onClick={handleLogout} title="Sair" className="transition" style={{ color: 'rgba(244,228,195,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e57373'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,228,195,0.4)'}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3.5" style={{ backgroundColor: '#f4e4c3', borderBottom: '1px solid #d4c4a8' }}>
          <button className="md:hidden" style={{ color: '#2e313c' }} onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#2e313c', letterSpacing: '0.01em' }}>
            {currentLabel}
          </span>
          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 transition rounded-lg"
              style={{ color: '#906a47' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ecdcc0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-white rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#7a3a2a', fontSize: 9 }}>{unread}</span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden"
                style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #d4c4a8' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: '#2e313c' }}>Notificações</span>
                  {unread > 0 && <button onClick={markAllRead} className="text-xs hover:underline" style={{ color: '#906a47' }}>Marcar como lidas</button>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm py-8" style={{ color: '#906a47', opacity: 0.5 }}>Nenhuma notificação</p>
                  ) : notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 text-sm" style={{ borderBottom: '1px solid #e8d8b8', color: n.read ? '#a08060' : '#2e313c' }}>
                      <p>{n.message}</p>
                      {n.task_title && <p className="text-xs mt-0.5" style={{ color: '#906a47' }}>{n.task_title}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#f0e8d8' }}>{children}</main>
      </div>
    </div>
  );
}
