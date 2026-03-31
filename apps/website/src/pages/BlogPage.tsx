import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/api';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';

interface BlogArticle {
  id: string;
  titel: string;
  zusammenfassung: string | null;
  kategorie: string;
  tags: string[];
  autor_name: string;
  created_at: string;
  og_image: string | null;
}

const API_BASE = API_BASE_URL;
const QUICK_LINKS = [
  { to: '/themen', label: 'Themenübersicht' },
  { to: '/veranstaltungen', label: 'Veranstaltungen' },
  { to: '/presse', label: 'Presse' },
  { to: '/kontakt', label: 'Kontakt' },
];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function ArticleCard({ article, featured = false }: { article: BlogArticle; featured?: boolean }) {
  const backgroundStyle = article.og_image
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(27, 73, 101, 0.84), rgba(212, 97, 30, 0.72)), url(${article.og_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <Link
      className={[
        'group overflow-hidden rounded-[1.75rem] border border-secondary-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl',
        featured ? 'grid gap-0 lg:grid-cols-[1.15fr_0.85fr]' : 'flex h-full flex-col',
      ].join(' ')}
      to={`/blog/${article.id}`}
    >
      <div
        className={[
          'flex items-end justify-between bg-[linear-gradient(135deg,#1B4965_0%,#255d81_45%,#D4611E_100%)] p-6 text-white',
          featured ? 'min-h-[260px]' : 'min-h-[180px]',
        ].join(' ')}
        style={backgroundStyle}
      >
        <div>
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
            {article.kategorie}
          </span>
          <div className="mt-4 max-w-xs text-sm text-white/80">
            {formatDate(article.created_at)}
          </div>
        </div>
        <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
          Beitrag
        </div>
      </div>

      <div className={featured ? 'flex flex-col justify-between p-7' : 'flex flex-1 flex-col p-6'}>
        <div>
          <h2 className={featured ? 'text-3xl font-bold text-secondary-950' : 'text-xl font-bold text-secondary-950'}>
            {article.titel}
          </h2>
          <p className="mt-3 text-sm leading-7 text-secondary-600">
            {article.zusammenfassung || 'Ein aktueller Beitrag aus der Redaktion von Menschlichkeit Österreich.'}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="text-sm text-secondary-500">Von {article.autor_name}</div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, featured ? 5 : 3).map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span className="inline-flex items-center text-sm font-semibold text-primary-700 transition-colors group-hover:text-primary-800">
            Beitrag lesen
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    void loadArticles();
  }, [selectedCategory]);

  async function loadArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set('kategorie', selectedCategory);
      }

      const url = params.size > 0 ? `${API_BASE}/api/blog/articles?${params}` : `${API_BASE}/api/blog/articles`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.data || []);
      }
    } catch {
      setArticles([]);
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  }

  const allCategories = [...new Set(articles.map(article => article.kategorie))];
  const [featuredArticle, ...otherArticles] = articles;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHead
        title="Neuigkeiten & Blog – Menschlichkeit Österreich"
        description="Aktuelle Beiträge, Berichte und Analysen zu Demokratie, Menschenrechten, sozialer Gerechtigkeit und Zivilgesellschaft in Österreich."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Blog', url: 'https://www.menschlichkeit-oesterreich.at/blog' },
        ]}
      />

      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-secondary-200 bg-[linear-gradient(140deg,#1B4965_0%,#255d81_45%,#D4611E_100%)] px-7 py-8 text-white shadow-[0_28px_70px_rgba(27,73,101,0.18)] sm:px-10 sm:py-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
              Redaktion & Einordnung
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Blog und Neuigkeiten mit Haltung, Klarheit und Kontext.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/86 sm:text-lg">
              Hier bündeln wir Analysen, Berichte aus dem Vereinsalltag, Einordnungen zu aktuellen Entwicklungen und
              Hinweise auf Projekte, Veranstaltungen und Beteiligungsmöglichkeiten.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-secondary-950 transition-colors hover:bg-secondary-50"
              to="/forum"
            >
              Zur Community
            </Link>
            <Link
              className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/16"
              to="/mitglied-werden"
            >
              Mitglied werden
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-secondary-950">Filter</h2>
              <p className="mt-2 text-sm leading-6 text-secondary-600">
                Filtern Sie Beiträge nach Themenfeldern und springen Sie direkt in weitere öffentliche Bereiche.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className={[
                    'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                    !selectedCategory
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
                  ].join(' ')}
                  onClick={() => setSelectedCategory('')}
                >
                  Alle
                </button>
                {allCategories.map(category => (
                  <button
                    key={category}
                    className={[
                      'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
                    ].join(' ')}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-secondary-950">Weiterlesen</h2>
              <div className="mt-4 space-y-3">
                {QUICK_LINKS.map(link => (
                  <Link
                    key={link.to}
                    className="block rounded-2xl border border-secondary-100 px-4 py-3 text-sm font-medium text-secondary-700 transition-colors hover:border-accent-200 hover:bg-accent-50 hover:text-accent-800"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {loading && !hasLoaded ? (
              <div className="rounded-[1.75rem] border border-secondary-200 bg-white px-6 py-12 text-center shadow-sm">
                <div
                  className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent motion-safe:animate-spin"
                  aria-hidden="true"
                />
                <p className="text-sm text-secondary-500">Beiträge werden geladen…</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-[1.75rem] border border-secondary-200 bg-white px-6 py-12 text-center shadow-sm">
                <h2 className="text-2xl font-semibold text-secondary-950">Noch keine Beiträge veröffentlicht</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-secondary-600">
                  Sobald neue Artikel erscheinen, finden Sie sie hier. Bis dahin lohnen sich unsere Themenübersicht,
                  Veranstaltungen und die Community im Forum.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {QUICK_LINKS.map(link => (
                    <Link
                      key={link.to}
                      className="rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-800 transition-colors hover:bg-secondary-200"
                      to={link.to}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {featuredArticle && <ArticleCard article={featuredArticle} featured />}
                {otherArticles.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {otherArticles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
