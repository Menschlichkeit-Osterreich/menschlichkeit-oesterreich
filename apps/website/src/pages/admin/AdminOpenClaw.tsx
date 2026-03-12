/**
 * Admin-Panel: OpenClaw Multi-Agent-System Monitoring
 * Zeigt Status aller Agenten, Tasks, Tool-Calls und Audit-Log
 */

import React, { useState, useEffect, useCallback } from 'react';

const BRIDGE_URL = import.meta.env.VITE_OPENCLAW_BRIDGE_URL || 'http://127.0.0.1:18790';

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
  orchestrator: 'bg-purple-100 text-purple-800',
  research:     'bg-blue-100 text-blue-800',
  code:         'bg-green-100 text-green-800',
  write:        'bg-yellow-100 text-yellow-800',
  qa:           'bg-orange-100 text-orange-800',
  memory:       'bg-pink-100 text-pink-800',
};

const STATUS_COLORS: Record<string, string> = {
  idle:    'text-gray-500',
  running: 'text-green-600',
  error:   'text-red-600',
  PENDING: 'text-yellow-600',
  RUNNING: 'text-blue-600',
  DONE:    'text-green-600',
  DEADLETTER: 'text-red-600',
};

export default function AdminOpenClaw() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'tools' | 'github'>('overview');
  const [newTask, setNewTask] = useState({ title: '', objective: '', role: 'research' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [healthResp, tasksResp] = await Promise.all([
        fetch(`${BRIDGE_URL}/agent/health`, { signal: AbortSignal.timeout(5000) }),
        fetch(`${BRIDGE_URL}/agent/task/list?limit=20`, { signal: AbortSignal.timeout(5000) }),
      ]);

      if (healthResp.ok) {
        const h = await healthResp.json();
        setHealth(h);
        setIsOnline(true);
      }
      if (tasksResp.ok) {
        const t = await tasksResp.json();
        setTasks(t.tasks || []);
      }
    } catch {
      setIsOnline(false);
      // Demo-Daten wenn offline
      setHealth({
        status: 'offline',
        services: { nats: 'offline', postgres: 'offline', redis: 'offline', qdrant: 'offline' },
        agents: [
          { id: 'oc-orchestrator-1', role: 'orchestrator', status: 'idle', tasks_completed: 0, tasks_failed: 0, uptime_seconds: 0 },
          { id: 'oc-research-1', role: 'research', status: 'idle', tasks_completed: 0, tasks_failed: 0, uptime_seconds: 0 },
          { id: 'oc-code-1', role: 'code', status: 'idle', tasks_completed: 0, tasks_failed: 0, uptime_seconds: 0 },
          { id: 'oc-write-1', role: 'write', status: 'idle', tasks_completed: 0, tasks_failed: 0, uptime_seconds: 0 },
          { id: 'oc-qa-1', role: 'qa', status: 'idle', tasks_completed: 0, tasks_failed: 0, uptime_seconds: 0 },
          { id: 'oc-memory-1', role: 'memory', status: 'idle', tasks_completed: 0, tasks_failed: 0, uptime_seconds: 0 },
        ],
        queue_depth: 0,
        tasks_today: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const submitTask = async () => {
    if (!newTask.title || !newTask.objective) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${BRIDGE_URL}/agent/task/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (resp.ok) {
        setNewTask({ title: '', objective: '', role: 'research' });
        await fetchData();
      }
    } catch (_e) {
      alert('Fehler beim Einreichen des Tasks. Ist der Stack gestartet?');
    } finally {
      setSubmitting(false);
    }
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OpenClaw Agent-System</h1>
          <p className="text-gray-500 text-sm mt-1">Multi-Agent-Orchestrierung für Menschlichkeit Österreich</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isOnline ? 'System Online' : 'System Offline'}
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Aktualisieren"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Aktive Agenten', value: health?.agents.filter(a => a.status === 'running').length ?? 0, icon: '🤖', color: 'blue' },
          { label: 'Tasks heute', value: health?.tasks_today ?? 0, icon: '📋', color: 'green' },
          { label: 'Queue-Tiefe', value: health?.queue_depth ?? 0, icon: '⏳', color: 'yellow' },
          { label: 'Services', value: Object.values(health?.services ?? {}).filter(s => s === 'ok').length, icon: '🔧', color: 'purple' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['overview', 'tasks', 'tools', 'github'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' ? 'Übersicht' : tab === 'tasks' ? 'Tasks' : tab === 'tools' ? 'Tools' : 'GitHub'}
          </button>
        ))}
      </div>

      {/* Tab: Übersicht */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Agenten-Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Agenten-Status</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {health?.agents.map(agent => (
                <div key={agent.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'running' ? 'bg-green-500 animate-pulse' :
                      agent.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{agent.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[agent.role] || 'bg-gray-100 text-gray-600'}`}>
                          {agent.role}
                        </span>
                      </div>
                      {agent.current_task && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{agent.current_task}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Erledigt</div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">{agent.tasks_completed}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Fehler</div>
                      <div className={`font-medium ${agent.tasks_failed > 0 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>{agent.tasks_failed}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Uptime</div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">{formatUptime(agent.uptime_seconds)}</div>
                    </div>
                    <span className={`text-xs font-medium ${STATUS_COLORS[agent.status]}`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services-Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Infrastruktur-Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(health?.services ?? {}).map(([name, status]) => (
                <div key={name} className={`p-3 rounded-lg border ${
                  status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{name}</div>
                  <div className={`text-sm font-semibold mt-1 ${status === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                    {status === 'ok' ? '✓ Online' : '✗ Offline'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stack starten */}
          {!isOnline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Stack nicht gestartet</h3>
              <p className="text-yellow-700 text-sm mb-4">
                Der OpenClaw Docker-Stack läuft nicht. Starten Sie ihn mit einem der folgenden Befehle:
              </p>
              <div className="space-y-2">
                <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-sm">
                  # Linux/WSL2:<br />
                  bash openclaw-system/scripts/boot.sh
                </div>
                <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-sm">
                  # Windows PowerShell:<br />
                  C:\openclawd-win-bridge\scripts\Start-Stack.ps1
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Neuer Task */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Neuen Task einreichen</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task-Titel"
                value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                placeholder="Aufgabenbeschreibung / Ziel"
                value={newTask.objective}
                onChange={e => setNewTask(p => ({ ...p, objective: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex gap-3">
                <select
                  value={newTask.role}
                  onChange={e => setNewTask(p => ({ ...p, role: e.target.value }))}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {['orchestrator', 'research', 'code', 'write', 'qa', 'memory'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button
                  onClick={submitTask}
                  disabled={submitting || !newTask.title || !newTask.objective || !isOnline}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {submitting ? 'Wird eingereicht...' : 'Task einreichen'}
                </button>
              </div>
            </div>
          </div>

          {/* Task-Liste */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Letzte Tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-3">📋</div>
                <div>Noch keine Tasks vorhanden</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {tasks.map(task => (
                  <div key={task.task_id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{task.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[task.role] || 'bg-gray-100 text-gray-600'}`}>
                            {task.role}
                          </span>
                        </div>
                        {task.result_summary && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.result_summary}</div>
                        )}
                        {task.error_message && (
                          <div className="text-xs text-red-500 mt-1">{task.error_message}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-semibold ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                        <span className="text-xs text-gray-400">{new Date(task.created_at).toLocaleString('de-AT')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: GitHub */}
      {activeTab === 'github' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">GitHub-Integration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personal Account</div>
                <div className="text-xs text-gray-500">Token: Serverseitig verwaltet</div>
                <div className="text-xs text-gray-500 mt-1">Berechtigungen: repo, read:org</div>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organisation</div>
                <div className="text-xs text-gray-500">Menschlichkeit-Osterreich</div>
                <div className="text-xs text-gray-500 mt-1">Repo: menschlichkeit-oesterreich-development</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setup-Anleitung</div>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>GitHub PAT erstellen: Settings → Developer settings → Personal access tokens → Fine-grained</li>
                <li>Berechtigungen: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">repo</code>, <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">workflow</code>, <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">read:org</code></li>
                <li>Token in <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">~/.openclaw/.env</code> als <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">GITHUB_TOKEN</code> eintragen</li>
                <li>Stack neu starten: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">bash openclaw-system/scripts/boot.sh</code></li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
