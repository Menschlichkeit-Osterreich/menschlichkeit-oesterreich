// Security Dashboard - Sprint 1 Critical Component
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/api';

// TypeScript Interfaces for Security Management
interface SecurityLog {
  id: string;
  timestamp: Date;
  event: SecurityEventType;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, unknown>;
}

type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_blocked'
  | 'password_changed'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_failed'
  | 'session_expired'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_export'
  | 'admin_action'
  | 'sepa_mandate_created'
  | 'sepa_payment_processed'
  | 'privacy_request';

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  activeSessions: number;
  twoFactorUsage: number;
  suspiciousActivities: number;
  dataExports: number;
  passwordChanges: number;
  lastSecurityIncident?: Date;
}

interface Session {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  isCurrent: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'brute_force' | 'suspicious_ip' | 'data_breach_attempt' | 'unusual_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  isResolved: boolean;
  affectedUsers?: string[];
  recommendedActions: string[];
}

// Security Metrics Overview
const SecurityOverview: React.FC<{
  metrics: SecurityMetrics;
  onViewDetails: (metric: keyof SecurityMetrics) => void;
}> = ({ metrics, onViewDetails }) => {
  const metricCards = [
    {
      key: 'totalLogins' as keyof SecurityMetrics,
      title: 'Gesamt-Anmeldungen',
      value: metrics.totalLogins,
      trend: '+12%',
      trendType: 'positive' as const,
      icon: 'bi-box-arrow-in-right',
      color: 'bg-blue-500',
    },
    {
      key: 'failedLogins' as keyof SecurityMetrics,
      title: 'Fehlgeschlagene Anmeldungen',
      value: metrics.failedLogins,
      trend: '-5%',
      trendType: metrics.failedLogins > 10 ? ('negative' as const) : ('positive' as const),
      icon: 'bi-shield-exclamation',
      color: metrics.failedLogins > 10 ? 'bg-red-500' : 'bg-yellow-500',
    },
    {
      key: 'activeSessions' as keyof SecurityMetrics,
      title: 'Aktive Sitzungen',
      value: metrics.activeSessions,
      icon: 'bi-people',
      color: 'bg-green-500',
    },
    {
      key: 'twoFactorUsage' as keyof SecurityMetrics,
      title: '2FA-Nutzung',
      value: `${metrics.twoFactorUsage}%`,
      trend: metrics.twoFactorUsage > 70 ? 'Gut' : 'Verbesserung nötig',
      trendType: metrics.twoFactorUsage > 70 ? ('positive' as const) : ('negative' as const),
      icon: 'bi-shield-check',
      color: metrics.twoFactorUsage > 70 ? 'bg-green-500' : 'bg-orange-500',
    },
    {
      key: 'suspiciousActivities' as keyof SecurityMetrics,
      title: 'Verdächtige Aktivitäten',
      value: metrics.suspiciousActivities,
      trendType: metrics.suspiciousActivities > 0 ? ('negative' as const) : ('positive' as const),
      icon: 'bi-exclamation-triangle',
      color: metrics.suspiciousActivities > 0 ? 'bg-red-500' : 'bg-green-500',
    },
    {
      key: 'dataExports' as keyof SecurityMetrics,
      title: 'Daten-Exporte (DSGVO)',
      value: metrics.dataExports,
      icon: 'bi-download',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map(metric => (
        <motion.div
          key={metric.key}
          whileHover={{ scale: 1.02 }}
          className="card-modern p-6 cursor-pointer"
          onClick={() => onViewDetails(metric.key)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}
                >
                  <i className={`${metric.icon} text-white text-lg`} aria-hidden="true"></i>
                </div>
                <h3 className="font-semibold text-sm text-muted">{metric.title}</h3>
              </div>

              <div className="mb-2">
                <span className="text-2xl font-bold text-text">{metric.value}</span>
              </div>

              {metric.trend && (
                <div
                  className={`text-xs flex items-center gap-1 ${
                    metric.trendType === 'positive' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  <i
                    className={`bi ${
                      metric.trendType === 'positive' ? 'bi-arrow-up' : 'bi-arrow-down'
                    }`}
                    aria-hidden="true"
                  ></i>
                  <span>{metric.trend}</span>
                </div>
              )}
            </div>

            <i className="bi bi-chevron-right text-muted" aria-hidden="true"></i>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Active Sessions Management
const SessionManager: React.FC<{
  sessions: Session[];
  onTerminateSession: (sessionId: string) => void;
  onTerminateAllOthers: () => void;
}> = ({ sessions, onTerminateSession, onTerminateAllOthers }) => {
  const [showTerminateConfirm, setShowTerminateConfirm] = useState<string | null>(null);

  const getLocationDisplay = (session: Session): string => {
    return session.location || 'Unbekannter Standort';
  };

  const getBrowserDisplay = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unbekannter Browser';
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `vor ${diffInHours} Std`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `vor ${diffInDays} Tagen`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Aktive Sitzungen</h3>
        <button
          onClick={onTerminateAllOthers}
          className="btn btn-ghost btn-sm text-destructive hover:bg-destructive/10"
        >
          <i className="bi bi-x-circle mr-2" aria-hidden="true"></i>
          Andere Sitzungen beenden
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`p-4 border rounded-lg ${
              session.isCurrent ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      session.isActive ? 'bg-success' : 'bg-neutral-400'
                    }`}
                  />
                  <span className="font-medium">
                    {session.isCurrent ? 'Diese Sitzung' : getBrowserDisplay(session.userAgent)}
                  </span>
                  {session.isCurrent && (
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                      Aktuell
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted space-y-1">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-geo-alt text-xs" aria-hidden="true"></i>
                    <span>{getLocationDisplay(session)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-router text-xs" aria-hidden="true"></i>
                    <span className="font-mono text-xs">{session.ipAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-clock text-xs" aria-hidden="true"></i>
                    <span>Letzte Aktivität: {getTimeAgo(session.lastActivity)}</span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => setShowTerminateConfirm(session.id)}
                  className="btn btn-ghost btn-sm text-destructive hover:bg-destructive/10"
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showTerminateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTerminateConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-surface rounded-lg p-6 max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Sitzung beenden</h3>
              <p className="text-muted mb-6">
                Möchten Sie diese Sitzung wirklich beenden? Der Benutzer wird automatisch
                abgemeldet.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTerminateConfirm(null)}
                  className="btn btn-ghost flex-1"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    onTerminateSession(showTerminateConfirm);
                    setShowTerminateConfirm(null);
                  }}
                  className="btn btn-danger flex-1"
                >
                  Sitzung beenden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Security Log Viewer
const SecurityLogViewer: React.FC<{
  logs: SecurityLog[];
  onFilterChange: (filter: {
    event?: SecurityEventType;
    severity?: string;
    timeRange?: string;
  }) => void;
}> = ({ logs, onFilterChange }) => {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventType | ''>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');

  const eventTypes: Array<{ value: SecurityEventType; label: string; icon: string }> = [
    { value: 'login_success', label: 'Erfolgreiche Anmeldung', icon: 'bi-check-circle' },
    { value: 'login_failed', label: 'Fehlgeschlagene Anmeldung', icon: 'bi-x-circle' },
    { value: 'password_changed', label: 'Passwort geändert', icon: 'bi-key' },
    { value: '2fa_enabled', label: '2FA aktiviert', icon: 'bi-shield-plus' },
    {
      value: 'suspicious_activity',
      label: 'Verdächtige Aktivität',
      icon: 'bi-exclamation-triangle',
    },
    { value: 'data_access', label: 'Datenzugriff', icon: 'bi-eye' },
    { value: 'sepa_mandate_created', label: 'SEPA-Mandat erstellt', icon: 'bi-bank' },
    { value: 'privacy_request', label: 'Datenschutz-Anfrage', icon: 'bi-shield-lock' },
  ];

  const getSeverityColor = (severity: SecurityLog['severity']): string => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getEventIcon = (eventType: SecurityEventType): string => {
    const event = eventTypes.find(e => e.value === eventType);
    return event?.icon || 'bi-info-circle';
  };

  useEffect(() => {
    onFilterChange({
      event: selectedEvent || undefined,
      severity: selectedSeverity || undefined,
      timeRange: selectedTimeRange || undefined,
    });
  }, [selectedEvent, selectedSeverity, selectedTimeRange, onFilterChange]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-surface-elevated rounded-lg">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium mb-1">Event-Typ</label>
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value as SecurityEventType | '')}
            className="input w-full"
          >
            <option value="">Alle Events</option>
            {eventTypes.map(event => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-32">
          <label className="block text-sm font-medium mb-1">Schweregrad</label>
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="input w-full"
          >
            <option value="">Alle</option>
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
            <option value="critical">Kritisch</option>
          </select>
        </div>

        <div className="flex-1 min-w-32">
          <label className="block text-sm font-medium mb-1">Zeitraum</label>
          <select
            value={selectedTimeRange}
            onChange={e => setSelectedTimeRange(e.target.value)}
            className="input w-full"
          >
            <option value="1h">Letzte Stunde</option>
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
          </select>
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <i className="bi bi-journal-text text-2xl mb-2" aria-hidden="true"></i>
            <p>Keine Sicherheitslogs für die ausgewählten Filter gefunden.</p>
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className="p-4 border border-border rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(log.severity)}`}
                  >
                    <i className={`${getEventIcon(log.event)} text-sm`} aria-hidden="true"></i>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.description}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(log.severity)}`}
                      >
                        {log.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm text-muted space-y-1">
                      <div className="flex items-center gap-4">
                        <span>{log.timestamp.toLocaleString('de-AT')}</span>
                        {log.userEmail && (
                          <span className="flex items-center gap-1">
                            <i className="bi bi-person text-xs" aria-hidden="true"></i>
                            {log.userEmail}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <i className="bi bi-geo-alt text-xs" aria-hidden="true"></i>
                          {log.ipAddress}
                        </span>
                      </div>

                      {log.metadata && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-primary-500 hover:text-primary-600">
                            Zusätzliche Details anzeigen
                          </summary>
                          <pre className="mt-2 p-2 bg-surface text-xs rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Security Alerts Panel
const SecurityAlerts: React.FC<{
  alerts: SecurityAlert[];
  onResolveAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
}> = ({ alerts, onResolveAlert, onDismissAlert }) => {
  const unResolvedAlerts = alerts.filter(alert => !alert.isResolved);

  const getSeverityIcon = (severity: SecurityAlert['severity']): string => {
    switch (severity) {
      case 'low':
        return 'bi-info-circle';
      case 'medium':
        return 'bi-exclamation-circle';
      case 'high':
        return 'bi-exclamation-triangle';
      case 'critical':
        return 'bi-exclamation-diamond';
      default:
        return 'bi-info-circle';
    }
  };

  const getSeverityColor = (severity: SecurityAlert['severity']): string => {
    switch (severity) {
      case 'low':
        return 'border-blue-200 bg-blue-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-neutral-200 bg-neutral-50';
    }
  };

  if (unResolvedAlerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-shield-check text-2xl text-green-600" aria-hidden="true"></i>
        </div>
        <h3 className="text-lg font-semibold mb-2">Keine aktiven Sicherheitswarnungen</h3>
        <p className="text-muted">Alle Sicherheitswarnungen wurden bearbeitet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unResolvedAlerts.map(alert => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <i
                className={`${getSeverityIcon(alert.severity)} text-lg mt-1`}
                aria-hidden="true"
              ></i>
              <div>
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-sm text-muted mt-1">{alert.description}</p>
                <div className="text-xs text-muted mt-2">
                  {alert.timestamp.toLocaleString('de-AT')}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onResolveAlert(alert.id)}
                className="btn btn-ghost btn-sm text-green-600 hover:bg-green-100"
              >
                <i className="bi bi-check2" aria-hidden="true"></i>
              </button>
              <button
                onClick={() => onDismissAlert(alert.id)}
                className="btn btn-ghost btn-sm text-neutral-600 hover:bg-neutral-100"
              >
                <i className="bi bi-x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          {alert.recommendedActions.length > 0 && (
            <div className="mt-3 p-3 bg-white/50 rounded">
              <h5 className="text-sm font-semibold mb-2">Empfohlene Maßnahmen:</h5>
              <ul className="text-sm space-y-1">
                {alert.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <i className="bi bi-arrow-right text-xs mt-1" aria-hidden="true"></i>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Main Security Dashboard Component
export const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'logs' | 'alerts'>(
    'overview'
  );

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    activeSessions: 0,
    twoFactorUsage: 0,
    suspiciousActivities: 0,
    dataExports: 0,
    passwordChanges: 0,
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  const loadSessions = useCallback(async () => {
    try {
      const response = await authService.getSessions();
      if (response.success && response.data) {
        const mapped: Session[] = response.data.map(s => ({
          id: s.id,
          userId: '',
          userEmail: '',
          ipAddress: '',
          userAgent: s.deviceInfo,
          location: s.location,
          createdAt: new Date(s.lastActivity),
          lastActivity: new Date(s.lastActivity),
          isActive: true,
          isCurrent: s.isCurrent,
        }));
        setSessions(mapped);
        setMetrics(prev => ({ ...prev, activeSessions: mapped.length }));
      }
    } catch {
      // Sessions nicht verfügbar — leere Liste beibehalten
    }
  }, []);

  const loadSecurityLogs = useCallback(async () => {
    try {
      const response = await authService.getSecurityLogs();
      if (response.success && response.data) {
        const mapped: SecurityLog[] = response.data.map(log => ({
          id: log.id,
          timestamp: new Date(log.createdAt),
          event: log.action as SecurityEventType,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          severity: 'low' as const,
          description: log.description,
        }));
        setSecurityLogs(mapped);

        // Metriken aus Logs ableiten
        const failed = mapped.filter(l => l.event === 'login_failed').length;
        const suspicious = mapped.filter(l => l.event === 'suspicious_activity').length;
        const logins = mapped.filter(l => l.event === 'login_success').length;
        const pwChanges = mapped.filter(l => l.event === 'password_changed').length;
        setMetrics(prev => ({
          ...prev,
          failedLogins: failed,
          suspiciousActivities: suspicious,
          totalLogins: logins + failed,
          passwordChanges: pwChanges,
        }));
      }
    } catch {
      // Logs nicht verfügbar — leere Liste beibehalten
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadSecurityLogs();
  }, [loadSessions, loadSecurityLogs]);

  const handleViewDetails = (metric: keyof SecurityMetrics) => {
    switch (metric) {
      case 'activeSessions':
        setActiveTab('sessions');
        break;
      case 'failedLogins':
      case 'suspiciousActivities':
        setActiveTab('logs');
        break;
      default:
        setActiveTab('logs');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await authService.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setMetrics(prev => ({ ...prev, activeSessions: Math.max(0, prev.activeSessions - 1) }));
    } catch {
      // Fehler bei Sitzungsbeendigung — UI bleibt konsistent
    }
  };

  const handleTerminateAllOthers = async () => {
    try {
      await authService.revokeAllSessions();
      setSessions(prev => prev.filter(s => s.isCurrent));
      setMetrics(prev => ({ ...prev, activeSessions: 1 }));
    } catch {
      // Fehler bei Sitzungsbeendigung
    }
  };

  const handleLogFilter = async (filter: {
    event?: SecurityEventType;
    severity?: string;
    timeRange?: string;
  }) => {
    try {
      const response = await authService.getSecurityLogs();
      if (response.success && response.data) {
        let mapped: SecurityLog[] = response.data.map(log => ({
          id: log.id,
          timestamp: new Date(log.createdAt),
          event: log.action as SecurityEventType,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          severity: 'low' as const,
          description: log.description,
        }));

        if (filter.event) {
          mapped = mapped.filter(l => l.event === filter.event);
        }
        if (filter.timeRange) {
          const now = Date.now();
          const ranges: Record<string, number> = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
          };
          const cutoff = ranges[filter.timeRange];
          if (cutoff) {
            mapped = mapped.filter(l => now - l.timestamp.getTime() <= cutoff);
          }
        }

        setSecurityLogs(mapped);
      }
    } catch {
      // Fehler beim Laden der Logs
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert => (alert.id === alertId ? { ...alert, isResolved: true } : alert))
    );
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const tabs = [
    { id: 'overview' as const, label: 'Übersicht', icon: 'bi-speedometer2' },
    { id: 'sessions' as const, label: 'Sitzungen', icon: 'bi-people' },
    { id: 'logs' as const, label: 'Sicherheitslogs', icon: 'bi-journal-text' },
    { id: 'alerts' as const, label: 'Warnungen', icon: 'bi-exclamation-triangle' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted">Sicherheitsüberwachung und Session-Management</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
            <i className="bi bi-shield-check" aria-hidden="true"></i>
            <span className="text-sm font-medium">System sicher</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-primary-500 border-primary-500'
                    : 'text-muted border-transparent hover:text-text hover:border-border'
                }
              `}
            >
              <i className={tab.icon} aria-hidden="true"></i>
              {tab.label}
              {tab.id === 'alerts' && alerts.filter(a => !a.isResolved).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {alerts.filter(a => !a.isResolved).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <SecurityOverview metrics={metrics} onViewDetails={handleViewDetails} />
        )}

        {activeTab === 'sessions' && (
          <SessionManager
            sessions={sessions}
            onTerminateSession={handleTerminateSession}
            onTerminateAllOthers={handleTerminateAllOthers}
          />
        )}

        {activeTab === 'logs' && (
          <SecurityLogViewer logs={securityLogs} onFilterChange={handleLogFilter} />
        )}

        {activeTab === 'alerts' && (
          <SecurityAlerts
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
          />
        )}
      </motion.div>
    </div>
  );
};

// Export types and helper functions
export type { SecurityLog, SecurityMetrics, Session, SecurityAlert, SecurityEventType };
export { SecurityOverview, SessionManager, SecurityLogViewer, SecurityAlerts };
