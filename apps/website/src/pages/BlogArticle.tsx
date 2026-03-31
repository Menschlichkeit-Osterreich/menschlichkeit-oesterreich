import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/api';
import JsonLdArticle from '../components/seo/JsonLdArticle';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';

interface Article {
  id: string;
  titel: string;
  inhalt: string;
  zusammenfassung: string | null;
  kategorie: string;
  tags: string[];
  autor_name: string;
  veroeffentlicht: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE = API_BASE_URL;

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

export default function BlogArticle() {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    void loadArticle(articleId);
  }, [articleId]);

  async function loadArticle(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/blog/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
      } else {
        setArticle(null);
      }
    } catch {
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent motion-safe:animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-secondary-500">Beitrag wird geladen…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-secondary-950">Artikel nicht gefunden</h1>
        <p className="mt-3 text-sm text-secondary-600">
          Der gewünschte Beitrag ist nicht verfügbar oder wurde verschoben.
        </p>
        <Link className="mt-5 inline-flex text-sm font-semibold text-primary-700 hover:underline" to="/blog">
          Zurück zum Blog
        </Link>
      </div>
    );
  }

  const heroStyle = article.og_image
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(27, 73, 101, 0.86), rgba(212, 97, 30, 0.72)), url(${article.og_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <SeoHead
        title={article.seo_title || `${article.titel} – Menschlichkeit Österreich`}
        description={
          article.seo_description ||
          article.zusammenfassung ||
          `Beitrag von ${article.autor_name} auf dem Blog von Menschlichkeit Österreich.`
        }
        ogImage={article.og_image || undefined}
        ogType="article"
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Blog', url: 'https://www.menschlichkeit-oesterreich.at/blog' },
          { name: article.titel, url: `https://www.menschlichkeit-oesterreich.at/blog/${article.id}` },
        ]}
      />
      <JsonLdArticle
        authorName={article.autor_name}
        description={article.seo_description || article.zusammenfassung || ''}
        imageUrl={article.og_image || undefined}
        modifiedAt={article.updated_at}
        publishedAt={article.created_at}
        title={article.seo_title || article.titel}
        url={`https://www.menschlichkeit-oesterreich.at/blog/${article.id}`}
      />

      <div className="space-y-8">
        <Link className="inline-flex text-sm font-semibold text-primary-700 hover:underline" to="/blog">
          Zurück zum Blog
        </Link>

        <header
          className="overflow-hidden rounded-[2rem] border border-secondary-200 bg-[linear-gradient(135deg,#1B4965_0%,#255d81_48%,#D4611E_100%)] p-8 text-white shadow-[0_28px_70px_rgba(27,73,101,0.18)]"
          style={heroStyle}
        >
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              {article.kategorie}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">{article.titel}</h1>
            {article.zusammenfassung && (
              <p className="mt-4 text-lg leading-8 text-white/86">{article.zusammenfassung}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/82">
              <span>Von {article.autor_name}</span>
              <span>{formatDate(article.created_at)}</span>
              <span>{article.veroeffentlicht ? 'Veröffentlicht' : 'Entwurf'}</span>
            </div>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-secondary-200 bg-white p-7 shadow-sm">
          <div className="prose prose-lg max-w-none text-secondary-700 prose-headings:font-display prose-headings:text-secondary-950 prose-p:leading-8">
            <div className="whitespace-pre-wrap">{article.inhalt}</div>
          </div>

          {article.tags.length > 0 && (
            <div className="mt-8 border-t border-secondary-200 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-500">Schlagwörter</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-[1.75rem] border border-secondary-200 bg-secondary-50 p-6 shadow-sm sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-secondary-950">Weiter im Thema bleiben</h2>
            <p className="mt-2 text-sm leading-7 text-secondary-600">
              Im Forum und auf unseren Themenseiten geht die Debatte weiter. Dort finden Sie Rückfragen, ergänzende
              Perspektiven und Beteiligungsmöglichkeiten.
            </p>
          </div>
          <div className="flex flex-wrap items-start justify-start gap-3 sm:justify-end">
            <Link
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              to="/forum"
            >
              Im Forum diskutieren
            </Link>
            <Link
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-secondary-900 transition-colors hover:bg-secondary-100"
              to="/blog"
            >
              Weitere Beiträge lesen
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
