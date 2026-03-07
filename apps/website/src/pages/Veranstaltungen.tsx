import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronRight, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

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

const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Demokratie-Workshop: Bürgerbeteiligung stärken',
    date: '2025-03-15',
    time: '14:00–17:00 Uhr',
    location: 'Wien, 1. Bezirk – Volkshaus',
    category: 'workshop',
    description: 'Ein interaktiver Workshop über Möglichkeiten der direkten Demokratie in Österreich. Gemeinsam erkunden wir Bürgerbegehren, Volksbegehren und kommunale Beteiligungsformate.',
    maxParticipants: 30,
    currentParticipants: 18,
    imageEmoji: '🗳️',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Vortrag: Menschenrechte im digitalen Zeitalter',
    date: '2025-03-22',
    time: '18:30–20:00 Uhr',
    location: 'Online (Zoom)',
    category: 'online',
    description: 'Wie verändern Algorithmen, KI und Überwachungstechnologien unsere Grundrechte? Ein Vortrag mit anschließender Diskussion.',
    maxParticipants: 200,
    currentParticipants: 87,
    imageEmoji: '💻',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Jugend-Forum: Klimagerechtigkeit und Demokratie',
    date: '2025-04-05',
    time: '10:00–16:00 Uhr',
    location: 'Graz – Stadtbibliothek',
    category: 'jugend',
    description: 'Ein ganztägiges Forum für junge Menschen zwischen 14 und 26 Jahren. Diskutiert, vernetzt euch und entwickelt gemeinsam Ideen für eine gerechte Klimapolitik.',
    maxParticipants: 50,
    currentParticipants: 34,
    imageEmoji: '🌱',
  },
  {
    id: 4,
    title: 'Netzwerktreffen: Zivilgesellschaft Österreich',
    date: '2025-04-12',
    time: '17:00–19:30 Uhr',
    location: 'Linz – Kulturzentrum Ursulinenhof',
    category: 'netzwerk',
    description: 'Treffen Sie andere Engagierte aus der österreichischen Zivilgesellschaft. Erfahrungsaustausch, Kooperationsmöglichkeiten und gemeinsame Projekte.',
    maxParticipants: 60,
    currentParticipants: 22,
    imageEmoji: '🤝',
  },
  {
    id: 5,
    title: 'Workshop: Konflikte konstruktiv lösen',
    date: '2025-04-26',
    time: '09:00–17:00 Uhr',
    location: 'Salzburg – Bildungshaus St. Virgil',
    category: 'workshop',
    description: 'Ein Tagesworkshop mit Methoden der gewaltfreien Kommunikation und Mediation. Für alle, die in Vereinen, Schulen oder Gemeinden aktiv sind.',
    maxParticipants: 20,
    currentParticipants: 15,
    imageEmoji: '🕊️',
  },
  {
    id: 6,
    title: 'Online-Seminar: Vereinsrecht in Österreich',
    date: '2025-05-08',
    time: '18:00–19:30 Uhr',
    location: 'Online (Zoom)',
    category: 'online',
    description: 'Alles Wichtige über Vereinsgründung, Statuten, Haftung und Buchhaltung für Vereinsvorstände und Gründungsinteressierte.',
    maxParticipants: 100,
    currentParticipants: 43,
    imageEmoji: '📋',
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

function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const fillPercent = Math.round((event.currentParticipants / event.maxParticipants) * 100);

  return (
    <Card className={`p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow ${event.isFeatured ? 'ring-2 ring-primary-500' : ''}`}>
      {event.isFeatured && (
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded-full w-fit">
          ⭐ Empfohlen
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{event.imageEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[event.category]}`}>
              {CATEGORY_LABELS[event.category]}
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
          <span>{event.currentParticipants} / {event.maxParticipants} Teilnehmer·innen</span>
        </div>
      </div>

      {/* Auslastungsbalken */}
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
        onClick={() => window.open('mailto:events@menschlichkeit-oesterreich.at?subject=Anmeldung: ' + encodeURIComponent(event.title), '_blank')}
      >
        {spotsLeft <= 0 ? 'Warteliste' : 'Jetzt anmelden'}
        {spotsLeft > 0 && <ChevronRight className="w-4 h-4" />}
      </Button>
    </Card>
  );
}

export default function Veranstaltungen() {
  const [activeFilter, setActiveFilter] = useState<Event['category'] | 'alle'>('alle');

  const filtered = activeFilter === 'alle'
    ? EVENTS
    : EVENTS.filter(e => e.category === activeFilter);

  const categories: Array<Event['category'] | 'alle'> = ['alle', 'workshop', 'vortrag', 'netzwerk', 'online', 'jugend'];

  return (
    <div className="min-h-screen bg-semantic-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Veranstaltungen</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Workshops, Vorträge, Netzwerktreffen und mehr – engagieren Sie sich und lernen Sie Gleichgesinnte kennen.
          </p>
        </div>
      </section>

      {/* Filter */}
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

      {/* Events Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-secondary-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Keine Veranstaltungen in dieser Kategorie gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Eigene Veranstaltung vorschlagen */}
      <section className="bg-primary-50 border-t border-primary-100 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-3">Eigene Veranstaltung einreichen</h2>
          <p className="text-secondary-600 mb-6">
            Sie möchten eine Veranstaltung im Rahmen von Menschlichkeit Österreich organisieren?
            Wir unterstützen Sie gerne dabei.
          </p>
          <Button
            variant="primary"
            onClick={() => window.open('mailto:events@menschlichkeit-oesterreich.at?subject=Veranstaltungsvorschlag', '_blank')}
          >
            Veranstaltung vorschlagen
          </Button>
        </div>
      </section>
    </div>
  );
}
