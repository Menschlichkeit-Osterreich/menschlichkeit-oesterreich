import { useEffect, useRef, useState } from 'react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { dashboardApi } from '../../services/dashboard-api';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'active' | 'past' | 'cancelled';
  type: 'workshop' | 'meeting' | 'webinar' | 'social';
}

type EventFilter = 'all' | 'upcoming' | 'past';

type ApiEvent = {
  id?: number;
  title?: string;
  titel?: string;
  date?: string;
  datum?: string;
  location?: string;
  ort?: string;
  capacity?: number;
  kapazitaet?: number;
  registered?: number;
  anmeldungen?: number;
  status?: string;
  type?: string;
  typ?: string;
};

const TYPE_LABELS: Record<Event['type'], string> = {
  workshop: 'Workshop',
  meeting: 'Versammlung',
  webinar: 'Webinar',
  social: 'Social',
};

const STATUS_COLORS: Record<Event['status'], string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  past: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<Event['status'], string> = {
  upcoming: 'Geplant',
  active: 'Aktiv',
  past: 'Vergangen',
  cancelled: 'Abgesagt',
};

function normalizeEventType(value: string | undefined): Event['type'] {
  if (value === 'meeting' || value === 'webinar' || value === 'social') {
    return value;
  }
  return 'workshop';
}

function normalizeEventStatus(value: string | undefined): Event['status'] {
  if (value === 'active' || value === 'past' || value === 'cancelled') {
    return value;
  }
  return 'upcoming';
}

function mapApiEvent(event: ApiEvent): Event {
  return {
    id: Number(event.id ?? 0),
    title: event.title || event.titel || '',
    date: event.date || event.datum || '',
    location: event.location || event.ort || '',
    capacity: Number(event.capacity ?? event.kapazitaet ?? 50),
    registered: Number(event.registered ?? event.anmeldungen ?? 0),
    status: normalizeEventStatus(event.status),
    type: normalizeEventType(event.type || event.typ),
  };
}

function getFilteredEvents(events: Event[], filter: EventFilter): Event[] {
  if (filter === 'all') {
    return events;
  }
  if (filter === 'upcoming') {
    return events.filter(event => event.status === 'upcoming' || event.status === 'active');
  }
  return events.filter(event => event.status === 'past' || event.status === 'cancelled');
}

function formatEventDate(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Datum offen';
  }

  return parsedDate.toLocaleDateString('de-AT', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const capacityRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useAccessibleDialog({
    isOpen: showModal,
    containerRef: dialogRef,
    initialFocusRef: titleRef,
    onClose: () => setShowModal(false),
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getEvents();
      const rawEvents = Array.isArray(res.data) ? (res.data as ApiEvent[]) : [];
      setEvents(rawEvents.map(mapApiEvent));
    } catch {
      setEvents([]);
      setError('Verbindung zur API nicht möglich – es werden keine Eventdaten angezeigt.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const title = titleRef.current?.value?.trim();
    const date = dateRef.current?.value;
    const beschreibung = descriptionRef.current?.value?.trim() || title;

    if (!title) {
      setCreateError('Bitte geben Sie einen Titel für das Event ein.');
      titleRef.current?.focus();
      return;
    }

    if (!date) {
      setCreateError('Bitte wählen Sie ein Datum für das Event aus.');
      dateRef.current?.focus();
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const requestedCapacity = Number(capacityRef.current?.value);
      const safeCapacity =
        Number.isFinite(requestedCapacity) && requestedCapacity > 0 ? requestedCapacity : 50;

      await dashboardApi.createEvent({
        titel: title,
        start_datum: date,
        max_teilnehmer: safeCapacity,
        ort: locationRef.current?.value || '',
        kategorie: typeRef.current?.value || 'Workshop',
        beschreibung,
        ist_oeffentlich: true,
      });
      setStatusMessage(`Das Event „${title}“ wurde erfolgreich erstellt.`);
      setShowModal(false);
      loadEvents();
    } catch {
      setCreateError('Fehler beim Erstellen. Bitte versuchen Sie es erneut.');
    } finally {
      setCreating(false);
    }
  }

  const filtered = getFilteredEvents(events, filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Veranstaltungen</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Alle Events verwalten und planen
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateError(null);
            setStatusMessage(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Neues Event
        </button>
      </div>

      {statusMessage && (
        <div
          className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}

      {error && (
        <div
          className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'upcoming' ? 'Geplant' : 'Vergangen'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p>Keine Veranstaltungen in dieser Kategorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(event => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">
                      {TYPE_LABELS[event.type] || event.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[event.status] || ''}`}
                    >
                      {STATUS_LABELS[event.status] || event.status}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatEventDate(event.date)}</span>
                    <span>{event.location}</span>
                    <span>
                      {event.registered}/{event.capacity} Teilnehmer
                    </span>
                  </div>
                  <div className="mt-3 w-full max-w-xs">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${event.registered >= event.capacity ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{
                          width: `${Math.min((event.registered / Math.max(event.capacity, 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {event.registered >= event.capacity
                        ? 'Ausgebucht'
                        : `${event.capacity - event.registered} Plätze frei`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                  >
                    Teilnehmer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={dialogRef}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-events-dialog-title"
            aria-describedby="admin-events-dialog-description"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  id="admin-events-dialog-title"
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  Neues Event erstellen
                </h2>
                <p
                  id="admin-events-dialog-description"
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  Erfassen Sie Titel, Datum, Ort, Typ und eine kurze Beschreibung für das neue
                  Event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Dialog schliessen"
              >
                &#10005;
              </button>
            </div>
            {createError && (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                role="alert"
              >
                {createError}
              </div>
            )}
            <form
              className="space-y-4"
              onSubmit={event => {
                event.preventDefault();
                void handleCreate();
              }}
            >
              <div>
                <label
                  htmlFor="admin-event-title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Titel
                </label>
                <input
                  id="admin-event-title"
                  ref={titleRef}
                  type="text"
                  placeholder="Event-Titel"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="admin-event-date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Datum
                  </label>
                  <input
                    id="admin-event-date"
                    ref={dateRef}
                    type="date"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-event-capacity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Kapazität
                  </label>
                  <input
                    id="admin-event-capacity"
                    ref={capacityRef}
                    type="number"
                    placeholder="50"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="admin-event-location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Ort
                </label>
                <input
                  id="admin-event-location"
                  ref={locationRef}
                  type="text"
                  placeholder="Wien, Rathaus oder Online"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-event-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Typ
                </label>
                <select
                  id="admin-event-type"
                  ref={typeRef}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Versammlung</option>
                  <option value="webinar">Webinar</option>
                  <option value="social">Social Event</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="admin-event-description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Beschreibung
                </label>
                <textarea
                  id="admin-event-description"
                  ref={descriptionRef}
                  rows={3}
                  placeholder="Kurze Beschreibung des Events..."
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  aria-busy={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {creating ? 'Erstelle...' : 'Event erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
