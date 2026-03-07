import React, { useState, useMemo } from 'react';
import { Download, Search, FileText, Presentation, Image, Film, Filter } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  category: 'arbeitsblatt' | 'praesentation' | 'broschuere' | 'video' | 'infografik';
  format: string;
  size: string;
  language: string;
  ageGroup: string;
  downloadUrl: string;
  previewEmoji: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

const MATERIALS: Material[] = [
  {
    id: 'demokratie-grundlagen-ab',
    title: 'Demokratie – Grundlagen (Arbeitsblatt)',
    description: 'Einführung in die Grundprinzipien der Demokratie mit Aufgaben und Reflexionsfragen.',
    category: 'arbeitsblatt',
    format: 'PDF',
    size: '1,2 MB',
    language: 'Deutsch',
    ageGroup: '12–16 Jahre',
    downloadUrl: '#',
    previewEmoji: '📄',
    isFeatured: true,
  },
  {
    id: 'menschenrechte-praesentation',
    title: 'Menschenrechte – Präsentation',
    description: 'Fertige Unterrichtspräsentation zu den Menschenrechten mit Diskussionsimpulsen.',
    category: 'praesentation',
    format: 'PPTX',
    size: '4,8 MB',
    language: 'Deutsch',
    ageGroup: '14–18 Jahre',
    downloadUrl: '#',
    previewEmoji: '📊',
    isFeatured: true,
  },
  {
    id: 'konflikte-loesen-ab',
    title: 'Konflikte konstruktiv lösen (Arbeitsblatt)',
    description: 'Methoden der gewaltfreien Kommunikation und Mediation für den Schulalltag.',
    category: 'arbeitsblatt',
    format: 'PDF',
    size: '0,9 MB',
    language: 'Deutsch',
    ageGroup: '10–14 Jahre',
    downloadUrl: '#',
    previewEmoji: '🕊️',
  },
  {
    id: 'eu-institutionen-infografik',
    title: 'EU-Institutionen – Infografik',
    description: 'Übersichtliche Darstellung der EU-Institutionen und ihrer Aufgaben.',
    category: 'infografik',
    format: 'PNG',
    size: '2,1 MB',
    language: 'Deutsch',
    ageGroup: 'Alle',
    downloadUrl: '#',
    previewEmoji: '🇪🇺',
    isNew: true,
  },
  {
    id: 'demokratie-spiel-anleitung',
    title: 'Brücken Bauen – Spielanleitung für Lehrkräfte',
    description: 'Vollständige Anleitung zur Nutzung des Demokratie-Spiels im Unterricht.',
    category: 'broschuere',
    format: 'PDF',
    size: '3,4 MB',
    language: 'Deutsch',
    ageGroup: 'Lehrkräfte',
    downloadUrl: '#',
    previewEmoji: '🎮',
    isNew: true,
  },
  {
    id: 'zivilgesellschaft-broschuere',
    title: 'Zivilgesellschaft in Österreich',
    description: 'Broschüre über NGOs, Vereine und Bürgerengagement in Österreich.',
    category: 'broschuere',
    format: 'PDF',
    size: '5,2 MB',
    language: 'Deutsch',
    ageGroup: 'Erwachsene',
    downloadUrl: '#',
    previewEmoji: '📋',
  },
  {
    id: 'fake-news-ab',
    title: 'Fake News erkennen (Arbeitsblatt)',
    description: 'Praktische Übungen zur Medienkompetenz und kritischem Denken.',
    category: 'arbeitsblatt',
    format: 'PDF',
    size: '1,5 MB',
    language: 'Deutsch',
    ageGroup: '12–18 Jahre',
    downloadUrl: '#',
    previewEmoji: '🔍',
  },
  {
    id: 'demokratie-video',
    title: 'Was ist Demokratie? (Video)',
    description: 'Kurzes Erklär-Video für den Unterrichtseinstieg (5 Minuten).',
    category: 'video',
    format: 'MP4',
    size: '45 MB',
    language: 'Deutsch',
    ageGroup: '10–16 Jahre',
    downloadUrl: '#',
    previewEmoji: '🎬',
  },
];

const CATEGORY_LABELS: Record<Material['category'], string> = {
  arbeitsblatt: 'Arbeitsblatt',
  praesentation: 'Präsentation',
  broschuere: 'Broschüre',
  video: 'Video',
  infografik: 'Infografik',
};

const CATEGORY_ICONS: Record<Material['category'], React.ReactNode> = {
  arbeitsblatt: <FileText className="w-4 h-4" />,
  praesentation: <Presentation className="w-4 h-4" />,
  broschuere: <FileText className="w-4 h-4" />,
  video: <Film className="w-4 h-4" />,
  infografik: <Image className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<Material['category'], string> = {
  arbeitsblatt: 'bg-blue-100 text-blue-800',
  praesentation: 'bg-orange-100 text-orange-800',
  broschuere: 'bg-green-100 text-green-800',
  video: 'bg-red-100 text-red-800',
  infografik: 'bg-purple-100 text-purple-800',
};

function MaterialCard({ material }: { material: Material }) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200 ${material.isFeatured ? 'border-primary-300 ring-1 ring-primary-200' : 'border-secondary-200'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[material.category]}`}>
              {CATEGORY_ICONS[material.category]}
              {CATEGORY_LABELS[material.category]}
            </span>
            {material.isNew && (
              <span className="text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">NEU</span>
            )}
          </div>
          <span className="text-2xl">{material.previewEmoji}</span>
        </div>

        <h3 className="font-semibold text-secondary-900 text-sm mb-2 leading-snug">{material.title}</h3>
        <p className="text-xs text-secondary-500 mb-4 line-clamp-2">{material.description}</p>

        <div className="grid grid-cols-2 gap-1 text-xs text-secondary-500 mb-4">
          <span>📁 {material.format} · {material.size}</span>
          <span>👥 {material.ageGroup}</span>
          <span>🌐 {material.language}</span>
        </div>

        <a
          href={material.downloadUrl}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-primary-700 transition-colors"
          onClick={(e) => { e.preventDefault(); alert('Download wird vorbereitet...'); }}
        >
          <Download className="w-4 h-4" />
          Herunterladen
        </a>
      </div>
    </div>
  );
}

export default function Materialien() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Material['category'] | 'alle'>('alle');

  const filtered = useMemo(() => {
    return MATERIALS.filter(m => {
      const matchesCategory = activeCategory === 'alle' || m.category === activeCategory;
      const matchesSearch = search === '' ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const featured = MATERIALS.filter(m => m.isFeatured);

  return (
    <div className="min-h-screen bg-semantic-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-800 to-secondary-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Materialien & Downloads</h1>
          <p className="text-xl text-secondary-300 max-w-2xl mx-auto">
            Kostenlose Unterrichtsmaterialien, Arbeitsblätter, Präsentationen und mehr –
            für Lehrkräfte, Pädagog·innen und alle Engagierten.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          ⭐ Empfohlene Materialien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {featured.map(m => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="search"
              placeholder="Materialien durchsuchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-secondary-400 flex-shrink-0" />
            {(['alle', 'arbeitsblatt', 'praesentation', 'broschuere', 'video', 'infografik'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {cat === 'alle' ? 'Alle' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* All Materials */}
        <h2 className="text-lg font-bold text-secondary-900 mb-4">
          Alle Materialien
          <span className="ml-2 text-sm font-normal text-secondary-500">({filtered.length})</span>
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-secondary-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Keine Materialien gefunden. Bitte passen Sie Ihre Suche an.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(m => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        )}
      </section>

      {/* Material einreichen */}
      <section className="bg-secondary-50 border-t border-secondary-200 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-3">Material einreichen</h2>
          <p className="text-secondary-600 mb-6">
            Haben Sie selbst Unterrichtsmaterialien entwickelt? Teilen Sie Ihre Ressourcen
            mit der Community und helfen Sie anderen Pädagog·innen.
          </p>
          <a
            href="mailto:materialien@menschlichkeit-oesterreich.at?subject=Materialeinreichung"
            className="inline-flex items-center gap-2 bg-secondary-800 text-white font-medium py-2.5 px-6 rounded-xl hover:bg-secondary-900 transition-colors"
          >
            Material einreichen
          </a>
        </div>
      </section>
    </div>
  );
}
