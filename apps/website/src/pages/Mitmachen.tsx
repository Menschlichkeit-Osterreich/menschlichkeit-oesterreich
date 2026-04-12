import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Heart,
  Monitor,
  BookOpen,
  Mail,
  Construction,
  Globe,
  MessageCircle,
  Palette,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import SeoHead from '../components/seo/SeoHead';
import SpendenCTA from '../components/SpendenCTA';

/* ------------------------------------------------------------------ */
/*  Daten                                                              */
/* ------------------------------------------------------------------ */

interface Projekt {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

const PROJEKTE: Projekt[] = [
  {
    id: 'plattform',
    title: 'Digitale NGO-Plattform',
    description:
      'Aufbau von „Menschlichkeit Österreich" als moderne, transparente und partizipative Online-Plattform für demokratisches Engagement.',
    icon: <Globe className="w-6 h-6" />,
    tags: ['Web', 'Open Source', 'Transparenz'],
  },
  {
    id: 'community',
    title: 'Community- & Beteiligungsformate',
    description:
      'Entwicklung von Online- und lokalen Formaten, die Menschen zusammenbringen und aktive Mitgestaltung ermöglichen.',
    icon: <MessageCircle className="w-6 h-6" />,
    tags: ['Community', 'Events', 'Dialog'],
  },
  {
    id: 'bildung',
    title: 'Bildung & Aufklärung',
    description:
      'Projekte im Bereich Gesellschaft, Demokratie und Künstliche Intelligenz — verständlich, zugänglich und praxisnah.',
    icon: <BookOpen className="w-6 h-6" />,
    tags: ['Demokratie', 'KI', 'Gesellschaft'],
  },
];

interface FreiwilligenBereich {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  beispiele: string[];
}

const FREIWILLIGEN_BEREICHE: FreiwilligenBereich[] = [
  {
    id: 'community-mgmt',
    title: 'Community-Management und Organisation',
    description:
      'Unterstützung beim Aufbau und der Betreuung unserer Community — online wie offline.',
    icon: <Users className="w-6 h-6" />,
    beispiele: ['Moderation von Foren & Social Media', 'Event-Organisation', 'Netzwerkpflege'],
  },
  {
    id: 'content',
    title: 'Content-Erstellung',
    description:
      'Texte, Grafiken und Social-Media-Inhalte, die unsere Themen sichtbar machen.',
    icon: <Palette className="w-6 h-6" />,
    beispiele: ['Blog-Artikel & Berichte', 'Grafik-Design', 'Social-Media-Beiträge'],
  },
  {
    id: 'technik',
    title: 'Technische Unterstützung',
    description:
      'Mithilfe bei Webentwicklung, IT-Infrastruktur und Datenpflege.',
    icon: <Monitor className="w-6 h-6" />,
    beispiele: ['Webentwicklung (React, TypeScript)', 'IT-Support & Hosting', 'Datenbank- & Datenpflege'],
  },
  {
    id: 'bildung-veranstaltungen',
    title: 'Bildungs- und Veranstaltungsformate',
    description:
      'Mitwirkung an Workshops, Vorträgen und Bildungsmaterialien.',
    icon: <BookOpen className="w-6 h-6" />,
    beispiele: ['Workshop-Moderation', 'Lernmaterial-Erstellung', 'Veranstaltungsplanung'],
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-Komponenten                                                    */
/* ------------------------------------------------------------------ */

function ProjektCard({ projekt }: { projekt: Projekt }) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-700 mb-4">
        {projekt.icon}
      </div>
      <h3 className="text-lg font-bold text-secondary-900 mb-2">{projekt.title}</h3>
      <p className="text-sm text-secondary-600 leading-relaxed mb-4">{projekt.description}</p>
      <div className="flex flex-wrap gap-2">
        {projekt.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function FreiwilligenCard({ bereich }: { bereich: FreiwilligenBereich }) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-700 mb-4">
        {bereich.icon}
      </div>
      <h3 className="text-lg font-bold text-secondary-900 mb-2">{bereich.title}</h3>
      <p className="text-sm text-secondary-600 leading-relaxed mb-4">{bereich.description}</p>
      <ul className="space-y-2">
        {bereich.beispiele.map((beispiel) => (
          <li key={beispiel} className="flex items-start gap-2 text-sm text-secondary-600">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
            {beispiel}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hauptkomponente                                                    */
/* ------------------------------------------------------------------ */

export default function Mitmachen() {
  return (
    <div className="min-h-screen bg-semantic-background">
      <SeoHead
        title="Mitmachen – Freiwillig engagieren bei Menschlichkeit Österreich"
        description="Entdecken Sie, wie Sie sich bei Menschlichkeit Österreich freiwillig engagieren können: Community, Content, Technik und Bildung. Flexibel, sinnvoll und projektbezogen."
      />

      {/* === AUFBAU-BANNER — ENTFERNEN WENN NICHT MEHR BENÖTIGT === */}
      <section className="bg-amber-50 border-b border-amber-200" aria-label="Hinweis: Seite im Aufbau">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Diese Seite befindet sich noch im Aufbau.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Unser Verein und unsere Strukturen werden laufend weiterentwickelt. Inhalte und
              Möglichkeiten erweitern sich kontinuierlich. Bei Interesse oder Fragen erreichen
              Sie uns vorerst unter{' '}
              <a
                href="mailto:office@menschlichkeit-oesterreich.at"
                className="font-semibold underline hover:text-amber-900 transition-colors"
              >
                office@menschlichkeit-oesterreich.at
              </a>
            </p>
          </div>
        </div>
      </section>
      {/* === ENDE AUFBAU-BANNER === */}

      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-900 via-primary-900 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4 text-red-300" />
            Gemeinsam mehr bewirken
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Engagieren Sie sich<br />bei Menschlichkeit Österreich
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Es gibt viele Wege, sich bei uns einzubringen — ob mit wenig oder viel Zeit,
            mit fachlichen Kenntnissen oder einfach mit dem Wunsch, etwas zu bewegen.
          </p>
          <a
            href="mailto:office@menschlichkeit-oesterreich.at"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-3 px-8 rounded-2xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            <Mail className="w-5 h-5" />
            Jetzt Kontakt aufnehmen
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Schnellstart */}
      <section className="max-w-6xl mx-auto px-4 py-10" aria-label="Schnell starten">
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-secondary-900">Schnell starten</h2>
              <p className="mt-2 text-sm text-secondary-700 max-w-2xl">
                Wenn Sie direkt aktiv werden möchten, wählen Sie den Weg, der am besten zu Ihrer
                aktuellen Situation passt.
              </p>
            </div>
            <div className="text-xs text-secondary-600">
              ZVR 1182213083 • transparente Vereinsarbeit • datenschutzkonform
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Link
              to="/mitglied-werden"
              className="rounded-xl border border-primary-300 bg-white p-4 hover:shadow-sm transition-all"
            >
              <div className="font-semibold text-secondary-900">Mitglied werden</div>
              <p className="mt-1 text-sm text-secondary-600">Regelmäßig mittragen und mitgestalten.</p>
            </Link>
            <Link
              to="/spenden"
              className="rounded-xl border border-primary-300 bg-white p-4 hover:shadow-sm transition-all"
            >
              <div className="font-semibold text-secondary-900">Jetzt spenden</div>
              <p className="mt-1 text-sm text-secondary-600">Projekte sofort und konkret unterstützen.</p>
            </Link>
            <Link
              to="/veranstaltungen"
              className="rounded-xl border border-primary-300 bg-white p-4 hover:shadow-sm transition-all"
            >
              <div className="font-semibold text-secondary-900">Veranstaltung besuchen</div>
              <p className="mt-1 text-sm text-secondary-600">Unverbindlich kennenlernen und austauschen.</p>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">
              Transparenz
            </Link>
            <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">
              Datenschutz
            </Link>
            <Link to="/statuten" className="font-medium text-primary-700 hover:underline">
              Statuten
            </Link>
          </div>
        </div>
      </section>

      {/* Aktuelle Projekte */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 mb-3">
            <Construction className="w-4 h-4" />
            Aktuell im Aufbau
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
            Unsere aktuellen Projekte
          </h2>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Derzeit befinden sich mehrere unserer Projekte im Aufbau bzw. in einer frühen
            Umsetzungsphase. Hier können Sie aktiv mitgestalten:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJEKTE.map((projekt) => (
            <ProjektCard key={projekt.id} projekt={projekt} />
          ))}
        </div>
      </section>

      {/* Freiwilligen-Bereiche */}
      <section className="bg-secondary-50 border-t border-b border-secondary-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
              So können Sie sich einbringen
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Freiwillige können sich bei uns flexibel und projektbezogen engagieren,
              z.&nbsp;B. in folgenden Bereichen:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FREIWILLIGEN_BEREICHE.map((bereich) => (
              <FreiwilligenCard key={bereich.id} bereich={bereich} />
            ))}
          </div>

          {/* Philosophie-Hinweis */}
          <div className="mt-10 text-center">
            <p className="text-secondary-600 max-w-2xl mx-auto italic">
              Uns ist wichtig, dass Engagement niederschwellig, sinnvoll und
              entsprechend der individuellen Fähigkeiten möglich ist.
            </p>
          </div>
        </div>
      </section>

      {/* Kontakt-CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Interesse geweckt?
          </h2>
          <p className="text-secondary-600 mb-8 leading-relaxed">
            Egal ob Sie regelmäßig oder punktuell mitarbeiten möchten — melden Sie sich
            einfach bei uns. Wir freuen uns über jede helfende Hand und finden gemeinsam
            den passenden Einsatzbereich für Sie.
          </p>
          <a
            href="mailto:office@menschlichkeit-oesterreich.at"
            className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Mail className="w-5 h-5" />
            office@menschlichkeit-oesterreich.at
          </a>
        </div>
      </section>

      {/* Weitere Wege */}
      <section className="bg-primary-50 border-t border-primary-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-secondary-900 mb-6 text-center">
            Weitere Möglichkeiten, uns zu unterstützen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/mitglied-werden"
              className="flex items-center gap-3 bg-white rounded-xl border border-primary-200 p-4 hover:shadow-md transition-all group"
            >
              <Users className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                  Mitglied werden
                </span>
                <p className="text-xs text-secondary-500">Ab 2 € / Monat</p>
              </div>
            </Link>
            <Link
              to="/spenden"
              className="flex items-center gap-3 bg-white rounded-xl border border-primary-200 p-4 hover:shadow-md transition-all group"
            >
              <Heart className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                  Spenden
                </span>
                <p className="text-xs text-secondary-500">Einmalig oder regelmäßig</p>
              </div>
            </Link>
            <Link
              to="/veranstaltungen"
              className="flex items-center gap-3 bg-white rounded-xl border border-primary-200 p-4 hover:shadow-md transition-all group"
            >
              <BookOpen className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                  Veranstaltungen
                </span>
                <p className="text-xs text-secondary-500">Workshops & Vernetzung</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Spenden-CTA */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <SpendenCTA
            heading="Engagement ermöglichen"
            body="Mit Ihrer Spende oder Mitgliedschaft unterstützen Sie den Aufbau unserer Strukturen und ermöglichen es uns, noch mehr Menschen zum Mitmachen einzuladen."
            variant="subtle"
          />
        </div>
      </section>
    </div>
  );
}
