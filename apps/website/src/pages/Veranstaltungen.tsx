import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { dashboardApi } from '../services/dashboard-api';
import SeoHead from '../components/seo/SeoHead';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SpendenCTA from '../components/SpendenCTA';
import { CONTACT_EMAIL } from '../config/siteConfig';

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

const EVENT_FORMATS = [
  {
    title: 'Workshops & Bildung',
    description: 'Formate zu Demokratie, Menschenrechten, Vereinsarbeit und gesellschaftlicher Teilhabe.',
    icon: '\uD83C\uDF93',
  },
  {
    title: 'Diskussionen & Vorträge',
    description: 'Gespräche zu aktuellen Entwicklungen in Österreich mit Raum für Fragen und Debatte.',
    icon: '\uD83D\uDDE3\uFE0F',
  },
  {
    title: 'Vernetzung & Mitmachen',
    description: 'Austausch für Mitglieder, Interessierte und Engagierte aus der Zivilgesellschaft.',
    icon: '\uD83E\uDD1D',
  },
];

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
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
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
      setEvents(mapped);
    } catch {
      setEvents([]);
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  }

  async function handleRsvp(eventId: number) {
    try {
      await dashboardApi.rsvpEvent(String(eventId));
      loadEvents();
    } catch {
      window.open(`mailto:${CONTACT_EMAIL}?subject=Anmeldung: Event ${eventId}`, '_blank');
    }
  }

  const filtered = activeFilter === 'alle'
    ? events
    : events.filter(e => e.category === activeFilter);

  const categories: Array<Event['category'] | 'alle'> = ['alle', 'workshop', 'vortrag', 'netzwerk', 'online', 'jugend'];

  return (
    <div className="min-h-screen bg-semantic-background">
      <SeoHead
        title="Veranstaltungen – Menschlichkeit Österreich"
        description="Workshops, Diskussionen, Netzwerktreffen und Online-Events des Vereins Menschlichkeit Österreich. Aktuelle Termine und Anmeldung."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Veranstaltungen', url: 'https://www.menschlichkeit-oesterreich.at/veranstaltungen' },
      ]} />
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Veranstaltungen</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Workshops, Vorträge, Netzwerktreffen und mehr – hier finden Sie bestätigte Termine und Möglichkeiten zum Mitmachen.
          </p>
        </div>
      </section>

      {events.length > 0 && (
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
      )}

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {EVENT_FORMATS.map((format) => (
            <article key={format.title} className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
              <div className="text-3xl" aria-hidden="true">{format.icon}</div>
              <h2 className="mt-4 text-lg font-semibold text-secondary-900">{format.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary-700">{format.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading && !hasLoaded ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-secondary-200 bg-white px-6 py-12 text-center text-secondary-500 shadow-sm">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h2 className="text-2xl font-bold text-secondary-900">Derzeit sind noch keine bestätigten Termine veröffentlicht</h2>
            <p className="mt-4 max-w-2xl mx-auto text-secondary-600">
              Sobald neue Veranstaltungen freigeschaltet sind, finden Sie sie hier. Bis dahin können Sie Themen,
              Bildungsangebote und Kontaktmöglichkeiten nutzen, um mit uns in Verbindung zu bleiben.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <Link to="/bildung" className="font-medium text-primary-700 hover:underline">Bildungsangebote</Link>
              <Link to="/themen" className="font-medium text-primary-700 hover:underline">Themenübersicht</Link>
              <Link to="/kontakt" className="font-medium text-primary-700 hover:underline">Kontakt</Link>
            </div>
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
            onClick={() => window.open(`mailto:${CONTACT_EMAIL}?subject=Veranstaltungsvorschlag`, '_blank')}
          >
            Veranstaltung vorschlagen
          </Button>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <SpendenCTA
            heading="Veranstaltungen ermöglichen"
            body="Mit Ihrer Unterstützung können wir mehr Veranstaltungen, Workshops und Bildungsformate für alle Menschen in Österreich anbieten."
            variant="subtle"
          />
        </div>
      </section>
    </div>
  );
}
