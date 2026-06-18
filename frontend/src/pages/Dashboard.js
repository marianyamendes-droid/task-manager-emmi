import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, ListTodo, ArrowRight, Briefcase } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatCard = ({ icon: Icon, label, value, iconBg }) => (
  <div className="rounded-xl p-6 shadow-sm border flex flex-col gap-4" style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
    <div className="flex items-center justify-between">
      <div className="p-2.5 rounded-lg" style={{ backgroundColor: iconBg }}>
        <Icon size={20} style={{ color: '#fff' }} />
      </div>
    </div>
    <div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '2.8rem', fontWeight: 700, color: '#2e313c', lineHeight: 1 }}>{value}</p>
      <p className="text-sm mt-1.5" style={{ color: '#906a47' }}>{label}</p>
    </div>
  </div>
);

const statusCount = (rows, s) => rows.find(r => r.status === s)?.count || 0;

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/reports/dashboard').then(r => setData(r.data)); }, []);

  if (!data) return <div className="text-center py-20" style={{ color: '#906a47' }}>Carregando...</div>;

  const pending = parseInt(statusCount(data.byStatus, 'pending'));
  const inProgress = parseInt(statusCount(data.byStatus, 'in_progress'));
  const completed = parseInt(statusCount(data.byStatus, 'completed'));

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: '#906a47' }}>Visão geral das tarefas do escritório</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ListTodo}    label="Total de tarefas" value={data.total}            iconBg="#906a47" />
        <StatCard icon={Clock}       label="Pendentes"        value={pending + inProgress}  iconBg="#c4a882" />
        <StatCard icon={CheckCircle} label="Concluídas"       value={completed}             iconBg="#2e313c" />
        <StatCard icon={AlertTriangle} label="Em atraso"      value={data.overdue}          iconBg="#7a3a2a" />
      </div>

      {data.byClient && data.byClient.length > 0 && (
        <div className="rounded-xl shadow-sm border p-5" style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: '#2e313c', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
              <Briefcase size={16} style={{ color: '#906a47' }} /> Demanda por cliente
            </h2>
            <Link to="/clients" className="text-sm flex items-center gap-1 hover:underline" style={{ color: '#906a47' }}>
              Ver clientes <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.byClient.map((c, i) => {
              const max = data.byClient[0]?.total || 1;
              const pct = Math.round((c.total / max) * 100);
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: '#2e313c', maxWidth: '55%' }}>
                      <span className="text-xs mr-2" style={{ color: '#c4a882' }}>#{i + 1}</span>{c.name}
                    </span>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#906a47' }}>
                      <span>{c.total} tarefa{c.total !== '1' ? 's' : ''}</span>
                      {parseInt(c.atrasadas) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#7a3a2a' }}>
                          {c.atrasadas} atrasada{parseInt(c.atrasadas) !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e7e6e4' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: parseInt(c.atrasadas) > 0 ? '#7a3a2a' : '#906a47' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl shadow-sm border p-5" style={{ backgroundColor: '#f4e4c3', borderColor: '#d4c4a8' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#2e313c', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>Tarefas com prazo próximo</h2>
          <Link to="/tasks" className="text-sm flex items-center gap-1 hover:underline" style={{ color: '#906a47' }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {data.upcoming.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#906a47', opacity: 0.6 }}>Nenhuma tarefa com prazo nos próximos 3 dias</p>
        ) : (
          <div className="space-y-3">
            {data.upcoming.map(task => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center gap-4 p-3 rounded-lg transition group"
                style={{ ':hover': { backgroundColor: '#ecdcc0' } }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ecdcc0'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: task.category_color || '#906a47' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: '#2e313c' }}>{task.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#906a47' }}>{task.assigned_to_name || 'Não atribuído'} · {task.category_name || 'Sem categoria'}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full"
                  style={isPast(new Date(task.due_date))
                    ? { backgroundColor: '#7a3a2a', color: '#f4e4c3' }
                    : { backgroundColor: '#c4a882', color: '#fff' }}>
                  {format(new Date(task.due_date), "dd 'de' MMM", { locale: ptBR })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

