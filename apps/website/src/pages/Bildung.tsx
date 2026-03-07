import React, { useState } from 'react';
import { BookOpen, Play, Download, ExternalLink, ChevronRight, Star, Users, Clock } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  duration: string;
  level: 'Einsteiger' | 'Fortgeschritten' | 'Experte';
  topics: string[];
  gameLink?: string;
  downloadLink?: string;
}

const MODULES: Module[] = [
  {
    id: 'demokratie-grundlagen',
    title: 'Demokratie verstehen',
    subtitle: 'Grundlagen der Demokratie in Österreich',
    emoji: '🗳️',
    duration: '45 Min.',
    level: 'Einsteiger',
    topics: ['Parlamentarismus', 'Gewaltenteilung', 'Grundrechte', 'Wahlrecht'],
    gameLink: '/spiel',
  },
  {
    id: 'menschenrechte',
    title: 'Menschenrechte',
    subtitle: 'Universelle Rechte und ihre Bedeutung',
    emoji: '⚖️',
    duration: '60 Min.',
    level: 'Einsteiger',
    topics: ['EMRK', 'UN-Charta', 'Diskriminierungsschutz', 'Soziale Rechte'],
    downloadLink: '/materialien',
  },
  {
    id: 'zivilgesellschaft',
    title: 'Zivilgesellschaft',
    subtitle: 'Engagement und Beteiligung',
    emoji: '🤝',
    duration: '50 Min.',
    level: 'Fortgeschritten',
    topics: ['NGOs', 'Vereinsrecht', 'Bürgerinitiative', 'Volksbegehren'],
    gameLink: '/spiel',
    downloadLink: '/materialien',
  },
  {
    id: 'medien-demokratie',
    title: 'Medien & Demokratie',
    subtitle: 'Medienbildung und kritisches Denken',
    emoji: '📰',
    duration: '55 Min.',
    level: 'Fortgeschritten',
    topics: ['Pressefreiheit', 'Fake News', 'Medienkompetenz', 'Algorithmen'],
    downloadLink: '/materialien',
  },
  {
    id: 'konfliktloesung',
    title: 'Konfliktlösung',
    subtitle: 'Konstruktiver Umgang mit Konflikten',
    emoji: '🕊️',
    duration: '90 Min.',
    level: 'Fortgeschritten',
    topics: ['Mediation', 'Gewaltfreie Kommunikation', 'Verhandlung', 'Kompromiss'],
    gameLink: '/spiel',
  },
  {
    id: 'europa',
    title: 'Europa & EU',
    subtitle: 'Europäische Demokratie und Institutionen',
    emoji: '🇪🇺',
    duration: '70 Min.',
    level: 'Experte',
    topics: ['EU-Parlament', 'Europarat', 'Subsidiarität', 'Europäische Bürgerinitiative'],
    downloadLink: '/materialien',
  },
];

const LEVEL_COLORS = {
  'Einsteiger': 'bg-green-100 text-green-800',
  'Fortgeschritten': 'bg-blue-100 text-blue-800',
  'Experte': 'bg-purple-100 text-purple-800',
};

const STATS = [
  { value: '6', label: 'Lernmodule', icon: '📚' },
  { value: '100+', label: 'Spiellevel', icon: '🎮' },
  { value: '5.000+', label: 'Lernende', icon: '👥' },
  { value: 'Kostenlos', label: 'Für alle', icon: '🎁' },
];

function ModuleCard({ module }: { module: Module }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{module.emoji}</div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[module.level]}`}>
            {module.level}
          </span>
        </div>
        <h3 className="text-lg font-bold text-secondary-900 mb-1">{module.title}</h3>
        <p className="text-sm text-secondary-500 mb-4">{module.subtitle}</p>

        <div className="flex items-center gap-4 text-xs text-secondary-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {module.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {module.topics.length} Themen
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-800 transition-colors"
          aria-expanded={expanded}
        >
          Themen {expanded ? '▲' : '▼'}
        </button>

        {expanded && (
          <ul className="mt-3 space-y-1">
            {module.topics.map(topic => (
              <li key={topic} className="flex items-center gap-2 text-sm text-secondary-600">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-2">
        {module.gameLink && (
          <a
            href={module.gameLink}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Spielen
          </a>
        )}
        {module.downloadLink && (
          <a
            href={module.downloadLink}
            className="flex-1 flex items-center justify-center gap-2 bg-secondary-100 text-secondary-700 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-secondary-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Materialien
          </a>
        )}
      </div>
    </div>
  );
}

export default function Bildung() {
  const [activeLevel, setActiveLevel] = useState<string>('alle');

  const filtered = activeLevel === 'alle'
    ? MODULES
    : MODULES.filter(m => m.level === activeLevel);

  return (
    <div className="min-h-screen bg-semantic-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-900 via-primary-900 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 text-yellow-400" />
            Demokratiebildung für alle
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Lernen, Spielen,<br />Demokratie leben
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Interaktive Lernmodule, Unterrichtsmaterialien und unser Demokratie-Spiel
            „Brücken Bauen" – kostenlos für Schulen, Vereine und alle Interessierten.
          </p>
          <a
            href="/spiel"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-3 px-8 rounded-2xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            <Play className="w-5 h-5" />
            Jetzt spielen
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-secondary-100 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-secondary-900">{stat.value}</div>
              <div className="text-sm text-secondary-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter */}
      <section className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          {['alle', 'Einsteiger', 'Fortgeschritten', 'Experte'].map(level => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeLevel === level
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {level === 'alle' ? 'Alle Level' : level}
            </button>
          ))}
        </div>
      </section>

      {/* Module Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-secondary-900 mb-8">Lernmodule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>

      {/* Für Lehrkräfte */}
      <section className="bg-primary-50 border-t border-primary-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary-900 mb-4">
                Für Lehrkräfte & Pädagog·innen
              </h2>
              <p className="text-secondary-600 mb-6">
                Alle Materialien sind kostenlos, LEHRPLAN-konform und für den Einsatz
                in der Schule optimiert. Das Demokratie-Spiel kann als Klasse gespielt
                werden – mit integriertem Lehrkräfte-Dashboard.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Lehrplan-konforme Unterrichtseinheiten',
                  'Differenzierungsmaterial für verschiedene Niveaus',
                  'Lehrkräfte-Dashboard mit Klassenauswertung',
                  'Druckfertige Arbeitsblätter und Präsentationen',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-secondary-700">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:bildung@menschlichkeit-oesterreich.at"
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-medium py-2.5 px-6 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                Schulzugang anfragen
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-primary-200 shadow-sm">
              <h3 className="font-semibold text-secondary-900 mb-4">Externe Ressourcen</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Demokratiezentrum Wien', url: 'https://www.demokratiezentrum.org' },
                  { name: 'Bundeszentrale für politische Bildung', url: 'https://www.bpb.de' },
                  { name: 'Österreichisches Parlament – Demokratiewebstatt', url: 'https://www.demokratiewebstatt.at' },
                  { name: 'UNHCR Österreich – Bildungsmaterialien', url: 'https://www.unhcr.org/at' },
                ].map(link => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
