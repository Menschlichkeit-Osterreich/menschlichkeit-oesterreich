import React from 'react';
import { OPENCLAW_BRIDGE_URL } from '@/constants/api';

interface AgentStatus {
  id: string;
  role: string;
  status: 'idle' | 'running' | 'error';
  current_task?: string;
  tasks_completed: number;
  tasks_failed: number;
  uptime_seconds: number;
}

interface Task {
  task_id: string;
  title: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'DEADLETTER';
  role: string;
  created_at: string;
  result_summary?: string;
  error_message?: string;
}

interface SystemHealth {
  status: string;
  services: Record<string, string>;
  agents: AgentStatus[];
  queue_depth: number;
  tasks_today: number;
}

const ROLE_COLORS: Record<string, string> = {
  orchestrator: 'bg-secondary-100 text-secondary-800',
  research: 'bg-primary-50 text-primary-700',
  code: 'bg-success-100 text-success-700',
  write: 'bg-warning-100 text-warning-700',
  qa: 'bg-secondary-200 text-secondary-800',
  memory: 'bg-primary-100 text-primary-700',
};

const STATUS_COLORS: Record<string, string> = {
  idle: 'text-secondary-500',
  running: 'text-success-700',
  error: 'text-error-700',
  PENDING: 'text-warning-700',
  RUNNING: 'text-primary-700',
  DONE: 'text-success-700',
  DEADLETTER: 'text-error-700',
};

export default function AdminOpenClaw() {
  const [health, setHealth] = React.useState<SystemHealth | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ title: '', objective: '', role: 'research' });

  const fetchData = React.useCallback(async () => {
    setError(null);
    try {
      const [healthResponse, tasksResponse] = await Promise.all([
        fetch(`${OPENCLAW_BRIDGE_URL}/agent/health`, { signal: AbortSignal.timeout(5000) }),
        fetch(`${OPENCLAW_BRIDGE_URL}/agent/task/list?limit=20`, { signal: AbortSignal.timeout(5000) }),
      ]);

      if (!healthResponse.ok) {
        throw new Error('Health-Endpunkt nicht erreichbar');
      }

      const healthPayload = (await healthResponse.json()) as SystemHealth;
      const tasksPayload = tasksResponse.ok ? await tasksResponse.json() : { tasks: [] };

      setHealth(healthPayload);
      setTasks(tasksPayload.tasks || []);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
      setHealth(null);
      setTasks([]);
      setError('OpenClaw ist aktuell nicht erreichbar. Bitte starten Sie Gateway, Runtime und Windows-Bridge.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  async function submitTask() {
    if (!newTask.title.trim() || !newTask.objective.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${OPENCLAW_BRIDGE_URL}/agent/task/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Task konnte nicht eingereicht werden');
      }

      setNewTask({ title: '', objective: '', role: 'research' });
      await fetchData();
    } catch {
      setError('Der Task konnte nicht eingereicht werden.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeAgents = health?.agents.filter(agent => agent.status === 'running').length ?? 0;
  const onlineServices = Object.values(health?.services ?? {}).filter(service => service === 'ok').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">OpenClaw Operations</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Live-Status für Agenten, Queue und Infrastruktur aus dem laufenden OpenClaw-Stack.
          </p>
        </div>
        <div
          className={[
            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold',
            isOnline ? 'bg-success-100 text-success-700' : 'bg-error-50 text-error-700',
          ].join(' ')}
        >
          <span className={['h-2 w-2 rounded-full', isOnline ? 'bg-success-500' : 'bg-error-500'].join(' ')} />
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Aktive Agenten', value: activeAgents },
          { label: 'Tasks heute', value: health?.tasks_today ?? 0 },
          { label: 'Queue-Tiefe', value: health?.queue_depth ?? 0 },
          { label: 'Services online', value: onlineServices },
        ].map(item => (
          <div key={item.label} className="rounded-3xl border border-secondary-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-secondary-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold text-secondary-900">
              {loading ? '…' : item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Task einreichen</h2>
          <div className="mt-5 space-y-4">
            <input
              className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
              placeholder="Kurzer Titel"
              value={newTask.title}
              onChange={event => setNewTask(prev => ({ ...prev, title: event.target.value }))}
            />
            <textarea
              className="min-h-32 w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
              placeholder="Ziel / Arbeitsauftrag"
              value={newTask.objective}
              onChange={event => setNewTask(prev => ({ ...prev, objective: event.target.value }))}
            />
            <div className="flex flex-wrap gap-3">
              <select
                className="rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                value={newTask.role}
                onChange={event => setNewTask(prev => ({ ...prev, role: event.target.value }))}
              >
                {['orchestrator', 'research', 'code', 'write', 'qa', 'memory'].map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                disabled={!isOnline || submitting}
                onClick={submitTask}
              >
                {submitting ? 'Sendet…' : 'Task einreichen'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Stack-Hinweise</h2>
          <div className="mt-5 space-y-4 text-sm text-secondary-600">
            <p>
              Erwartete lokale Services:
              <code className="ml-2 rounded bg-secondary-100 px-2 py-1 text-xs">gateway:9101</code>
              <code className="ml-2 rounded bg-secondary-100 px-2 py-1 text-xs">runtime:9100</code>
              <code className="ml-2 rounded bg-secondary-100 px-2 py-1 text-xs">bridge:18790</code>
            </p>
            <div className="rounded-2xl bg-secondary-50 p-4">
              <div className="font-semibold text-secondary-900">Startreihenfolge</div>
              <p className="mt-2">
                Claude Launch startet Gateway, Runtime und Windows-Bridge separat. Wenn einer der Dienste fehlt,
                bleibt diese Ansicht bewusst im Offline-Zustand und zeigt keine Demo-Daten.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-secondary-900">Agentenstatus</h2>
        {!health || health.agents.length === 0 ? (
          <p className="mt-4 text-sm text-secondary-500">
            Noch keine aktiven Agenten gemeldet.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {health.agents.map(agent => (
              <div key={agent.id} className="flex flex-col gap-3 rounded-2xl border border-secondary-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-secondary-900">{agent.id}</span>
                    <span className={['rounded-full px-2.5 py-1 text-xs font-semibold', ROLE_COLORS[agent.role] || 'bg-secondary-100 text-secondary-700'].join(' ')}>
                      {agent.role}
                    </span>
                  </div>
                  {agent.current_task && (
                    <div className="mt-1 text-sm text-secondary-500">{agent.current_task}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-secondary-500">
                  <span>Erledigt: {agent.tasks_completed}</span>
                  <span>Fehler: {agent.tasks_failed}</span>
                  <span className={STATUS_COLORS[agent.status]}>{agent.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-secondary-900">Letzte Tasks</h2>
        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-secondary-500">Noch keine Tasks gemeldet.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {tasks.map(task => (
              <div key={task.task_id} className="rounded-2xl border border-secondary-200 px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-secondary-900">{task.title}</div>
                    <div className="mt-1 text-sm text-secondary-500">
                      {task.role} · {new Date(task.created_at).toLocaleString('de-AT')}
                    </div>
                  </div>
                  <span className={['text-sm font-semibold', STATUS_COLORS[task.status]].join(' ')}>
                    {task.status}
                  </span>
                </div>
                {task.result_summary && (
                  <p className="mt-3 text-sm text-secondary-600">{task.result_summary}</p>
                )}
                {task.error_message && (
                  <p className="mt-3 text-sm text-error-700">{task.error_message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
