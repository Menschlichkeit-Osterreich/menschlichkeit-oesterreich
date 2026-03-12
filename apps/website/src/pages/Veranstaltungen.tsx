import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronRight, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { dashboardApi } from '../services/dashboard-api';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'workshop' | 'vortrag' | 'netzwerk' | 'online' | 'jugend';
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  imageEmoji: string;
  isFeatured?: boolean;
}

const FALLBACK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Demokratie-Workshop: Bürgerbeteiligung stärken',
    date: '2026-03-15',
    time: '14:00\u201317:00 Uhr',
    location: 'Wien, 1. Bezirk \u2013 Volkshaus',
    category: 'workshop',
    description: 'Ein interaktiver Workshop über Möglichkeiten der direkten Demokratie in Österreich. Gemeinsam erkunden wir Bürgerbegehren, Volksbegehren und kommunale Beteiligungsformate.',
    maxParticipants: 30,
    currentParticipants: 18,
    imageEmoji: '\uD83D\uDDF3\uFE0F',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Vortrag: Menschenrechte im digitalen Zeitalter',
    date: '2026-03-22',
    time: '18:30\u201320:00 Uhr',
    location: 'Online (Zoom)',
    category: 'online',
    description: 'Wie verändern Algorithmen, KI und Überwachungstechnologien unsere Grundrechte? Ein Vortrag mit anschließender Diskussion.',
    maxParticipants: 200,
    currentParticipants: 87,
    imageEmoji: '\uD83D\uDCBB',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Jugend-Forum: Klimagerechtigkeit und Demokratie',
    date: '2026-04-05',
    time: '10:00\u201316:00 Uhr',
    location: 'Graz \u2013 Stadtbibliothek',
    category: 'jugend',
    description: 'Ein ganztägiges Forum für junge Menschen zwischen 14 und 26 Jahren.',
    maxParticipants: 50,
    currentParticipants: 34,
    imageEmoji: '\uD83C\uDF31',
  },
  {
    id: 4,
    title: 'Netzwerktreffen: Zivilgesellschaft Österreich',
    date: '2026-04-12',
    time: '17:00\u201319:30 Uhr',
    location: 'Linz \u2013 Kulturzentrum Ursulinenhof',
    category: 'netzwerk',
    description: 'Treffen Sie andere Engagierte aus der österreichischen Zivilgesellschaft.',
    maxParticipants: 60,
    currentParticipants: 22,
    imageEmoji: '\uD83E\uDD1D',
  },
  {
    id: 5,
    title: 'Workshop: Konflikte konstruktiv lösen',
    date: '2026-04-26',
    time: '09:00\u201317:00 Uhr',
    location: 'Salzburg \u2013 Bildungshaus St. Virgil',
    category: 'workshop',
    description: 'Ein Tagesworkshop mit Methoden der gewaltfreien Kommunikation und Mediation.',
    maxParticipants: 20,
    currentParticipants: 15,
    imageEmoji: '\uD83D\uDD4A\uFE0F',
  },
  {
    id: 6,
    title: 'Online-Seminar: Vereinsrecht in Österreich',
    date: '2026-05-08',
    time: '18:00\u201319:30 Uhr',
    location: 'Online (Zoom)',
    category: 'online',
    description: 'Alles Wichtige über Vereinsgründung, Statuten, Haftung und Buchhaltung.',
    maxParticipants: 100,
    currentParticipants: 43,
    imageEmoji: '\uD83D\uDCCB',
  },
];

const CATEGORY_LABELS: Record<Event['category'], string> = {
  workshop: 'Workshop',
  vortrag: 'Vortrag',
  netzwerk: 'Netzwerk',
  online: 'Online',
  jugend: 'Jugend',
};

const CATEGORY_COLORS: Record<Event['category'], string> = {
  workshop: 'bg-blue-100 text-blue-800',
  vortrag: 'bg-purple-100 text-purple-800',
  netzwerk: 'bg-green-100 text-green-800',
  online: 'bg-orange-100 text-orange-800',
  jugend: 'bg-pink-100 text-pink-800',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-AT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const EMOJI_MAP: Record<string, string> = {
  workshop: '\uD83C\uDF93',
  vortrag: '\uD83C\uDFE4',
  netzwerk: '\uD83E\uDD1D',
  online: '\uD83D\uDCBB',
  jugend: '\uD83C\uDF31',
};

function EventCard({ event, onRsvp }: { event: Event; onRsvp: (id: number) => void }) {
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const fillPercent = Math.round((event.currentParticipants / event.maxParticipants) * 100);

  return (
    <Card className={`p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow ${event.isFeatured ? 'ring-2 ring-primary-500' : ''}`}>
      {event.isFeatured && (
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded-full w-fit">
          Empfohlen
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{event.imageEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-700'}`}>
              {CATEGORY_LABELS[event.category] || event.category}
            </span>
          </div>
          <h3 className="font-semibold text-secondary-900 text-base leading-snug mb-1">{event.title}</h3>
          <p className="text-sm text-secondary-600 line-clamp-2">{event.description}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-secondary-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span>{event.currentParticipants} / {event.maxParticipants} Teilnehmer*innen</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-secondary-500 mb-1">
          <span>{fillPercent}% belegt</span>
          <span className={spotsLeft <= 5 ? 'text-red-600 font-semibold' : 'text-green-600'}>
            {spotsLeft <= 0 ? 'Ausgebucht' : `${spotsLeft} Plätze frei`}
          </span>
        </div>
        <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${fillPercent >= 90 ? 'bg-red-500' : fillPercent >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      <Button
        variant={spotsLeft <= 0 ? 'outline' : 'primary'}
        size="sm"
        className="w-full mt-auto"
        disabled={spotsLeft <= 0}
        onClick={() => onRsvp(event.id)}
      >
        {spotsLeft <= 0 ? 'Warteliste' : 'Jetzt anmelden'}
        {spotsLeft > 0 && <ChevronRight className="w-4 h-4" />}
      </Button>
    </Card>
  );
}

export default function Veranstaltungen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Event['category'] | 'alle'>('alle');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await dashboardApi.getEvents();
      const mapped: Event[] = (res.data || []).map((e: any) => ({
        id: e.id,
        title: e.title || e.titel || '',
        date: e.date || e.datum || '',
        time: e.time || e.zeit || '',
        location: e.location || e.ort || '',
        category: e.category || e.kategorie || 'workshop',
        description: e.description || e.beschreibung || '',
        maxParticipants: e.capacity || e.maxParticipants || e.kapazitaet || 50,
        currentParticipants: e.registered || e.currentParticipants || e.anmeldungen || 0,
        imageEmoji: e.imageEmoji || EMOJI_MAP[e.category || 'workshop'] || '\uD83D\uDCC5',
        isFeatured: e.isFeatured || e.featured || false,
      }));
      setEvents(mapped.length > 0 ? mapped : FALLBACK_EVENTS);
    } catch {
      setEvents(FALLBACK_EVENTS);
    } finally {
      setLoading(false);
    }
  }

  async function handleRsvp(eventId: number) {
    try {
      await dashboardApi.rsvpEvent(String(eventId));
      loadEvents();
    } catch {
      window.open('mailto:kontakt@menschlichkeit-oesterreich.at?subject=Anmeldung: Event ' + eventId, '_blank');
    }
  }

  const filtered = activeFilter === 'alle'
    ? events
    : events.filter(e => e.category === activeFilter);

  const categories: Array<Event['category'] | 'alle'> = ['alle', 'workshop', 'vortrag', 'netzwerk', 'online', 'jugend'];

  return (
    <div className="min-h-screen bg-semantic-background">
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Veranstaltungen</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Workshops, Vorträge, Netzwerktreffen und mehr – engagieren Sie sich und lernen Sie Gleichgesinnte kennen.
          </p>
        </div>
      </section>

      <section className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-secondary-500 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {cat === 'alle' ? 'Alle' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-secondary-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Keine Veranstaltungen in dieser Kategorie gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} onRsvp={handleRsvp} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary-50 border-t border-primary-100 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-3">Eigene Veranstaltung einreichen</h2>
          <p className="text-secondary-600 mb-6">
            Sie möchten eine Veranstaltung im Rahmen von Menschlichkeit Österreich organisieren?
            Wir unterstützen Sie gerne dabei.
          </p>
          <Button
            variant="primary"
            onClick={() => window.open('mailto:kontakt@menschlichkeit-oesterreich.at?subject=Veranstaltungsvorschlag', '_blank')}
          >
            Veranstaltung vorschlagen
          </Button>
        </div>
      </section>
    </div>
  );
}
