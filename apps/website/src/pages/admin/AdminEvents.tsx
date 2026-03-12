import React, { useState, useEffect, useRef } from 'react';
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

const FALLBACK_EVENTS: Event[] = [
  { id: 1, title: 'Demokratie-Workshop: Bürgerrechte', date: '2026-03-15', location: 'Wien, Rathaus', capacity: 40, registered: 28, status: 'upcoming', type: 'workshop' },
  { id: 2, title: 'Mitgliederversammlung 2026', date: '2026-03-22', location: 'Online (Zoom)', capacity: 200, registered: 87, status: 'upcoming', type: 'meeting' },
  { id: 3, title: 'Webinar: Digitale Demokratie', date: '2026-04-05', location: 'Online', capacity: 100, registered: 45, status: 'upcoming', type: 'webinar' },
  { id: 4, title: 'Frühjahrsfest der Menschlichkeit', date: '2026-04-20', location: 'Graz, Stadtpark', capacity: 150, registered: 62, status: 'upcoming', type: 'social' },
  { id: 5, title: 'Workshop: Klimagerechtigkeit', date: '2026-02-10', location: 'Salzburg', capacity: 30, registered: 30, status: 'past', type: 'workshop' },
];

const TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  meeting: 'Versammlung',
  webinar: 'Webinar',
  social: 'Social',
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  past: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Geplant',
  active: 'Aktiv',
  past: 'Vergangen',
  cancelled: 'Abgesagt',
};

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const capacityRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getEvents();
      const mapped = (res.data || []).map((e: any) => ({
        id: e.id,
        title: e.title || e.titel || '',
        date: e.date || e.datum || '',
        location: e.location || e.ort || '',
        capacity: e.capacity || e.kapazitaet || 50,
        registered: e.registered || e.anmeldungen || 0,
        status: e.status || 'upcoming',
        type: e.type || e.typ || 'workshop',
      }));
      setEvents(mapped.length > 0 ? mapped : FALLBACK_EVENTS);
    } catch {
      setEvents(FALLBACK_EVENTS);
      setError('Verbindung zur API nicht möglich – Beispieldaten werden angezeigt.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const title = titleRef.current?.value?.trim();
    const date = dateRef.current?.value;
    const beschreibung = descriptionRef.current?.value?.trim() || title;
    if (!title || !date) return;

    setCreating(true);
    try {
      await dashboardApi.createEvent({
        titel: title,
        start_datum: date,
        max_teilnehmer: Number(capacityRef.current?.value) || 50,
        ort: locationRef.current?.value || '',
        kategorie: typeRef.current?.value || 'Workshop',
        beschreibung,
        ist_oeffentlich: true,
      });
      setShowModal(false);
      loadEvents();
    } catch {
      alert('Fehler beim Erstellen. Bitte versuchen Sie es erneut.');
    } finally {
      setCreating(false);
    }
  }

  const filtered = events.filter(e =>
    filter === 'all' ? true :
    filter === 'upcoming' ? e.status === 'upcoming' || e.status === 'active' :
    e.status === 'past' || e.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Veranstaltungen</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Alle Events verwalten und planen</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Neues Event
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
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
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">{TYPE_LABELS[event.type] || event.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[event.status] || ''}`}>
                      {STATUS_LABELS[event.status] || event.status}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(event.date).toLocaleDateString('de-AT', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>{event.location}</span>
                    <span>{event.registered}/{event.capacity} Teilnehmer</span>
                  </div>
                  <div className="mt-3 w-full max-w-xs">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${event.registered >= event.capacity ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {event.registered >= event.capacity ? 'Ausgebucht' : `${event.capacity - event.registered} Plätze frei`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                    Bearbeiten
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Neues Event erstellen</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&#10005;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                <input ref={titleRef} type="text" placeholder="Event-Titel" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum</label>
                  <input ref={dateRef} type="date" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kapazität</label>
                  <input ref={capacityRef} type="number" placeholder="50" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ort</label>
                <input ref={locationRef} type="text" placeholder="Wien, Rathaus oder Online" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                <select ref={typeRef} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Versammlung</option>
                  <option value="webinar">Webinar</option>
                  <option value="social">Social Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                <textarea ref={descriptionRef} rows={3} placeholder="Kurze Beschreibung des Events..." className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Abbrechen
              </button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50">
                {creating ? 'Erstelle...' : 'Event erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
