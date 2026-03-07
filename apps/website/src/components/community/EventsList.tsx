import React, { useEffect, useState } from 'react';
import { civicrm, CiviEvent } from '../../services/civicrm';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

interface EventsListProps {
  limit?: number;
  className?: string;
}

export function EventsList({ limit = 6, className = '' }: EventsListProps) {
  const [events, setEvents] = useState<CiviEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const result = await civicrm.events.listPublic();
        setEvents(result.values.slice(0, limit));
      } catch (err: unknown) {
        setError(`Veranstaltungen konnten nicht geladen werden: ${err instanceof Error ? err.message : ''}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [limit]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-AT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className={`text-center p-8 text-secondary-500 ${className}`}>Veranstaltungen werden geladen…</div>;
  }

  if (error) {
    return <Alert variant="error" className={className}>{error}</Alert>;
  }

  if (events.length === 0) {
    return (
      <div className={`text-center p-8 text-secondary-500 ${className}`}>
        <p>Aktuell sind keine Veranstaltungen geplant.</p>
        <p className="text-sm mt-2">Schauen Sie bald wieder vorbei!</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {events.map((event) => (
        <Card key={event.id} className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {formatDate(event.start_date)}
            </span>
            {event.end_date && event.end_date !== event.start_date && (
              <span className="text-xs text-secondary-500"> – {formatDate(event.end_date)}</span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug">{event.title}</h3>
          {event.location && (
            <p className="text-sm text-secondary-600 flex items-center gap-1">
              <span>📍</span> {event.location}
            </p>
          )}
          {event.description && (
            <p className="text-sm text-secondary-600 line-clamp-2">{event.description}</p>
          )}
          {event.max_participants && (
            <p className="text-xs text-secondary-500">Max. {event.max_participants} Teilnehmer/innen</p>
          )}
          <a
            href={`${import.meta.env.VITE_CIVICRM_BASE_URL}/civicrm/event/info?id=${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1 text-sm text-primary-600 hover:underline font-medium"
          >
            Mehr erfahren & Anmelden →
          </a>
        </Card>
      ))}
    </div>
  );
}
