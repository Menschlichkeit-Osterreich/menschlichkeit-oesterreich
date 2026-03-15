import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import JsonLdArticle from '../components/seo/JsonLdArticle';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function BlogArticle() {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (articleId) loadArticle();
  }, [articleId]);

  async function loadArticle() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/blog/articles/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
        if (data.seo_title) document.title = data.seo_title;
        else document.title = `${data.titel} | Menschlichkeit Österreich`;
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Wird geladen…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Artikel nicht gefunden</h1>
        <Link to="/blog" className="text-red-600 hover:underline">Zurück zum Blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <SeoHead
        title={article.seo_title || `${article.titel} – Menschlichkeit Österreich`}
        description={article.seo_description || article.zusammenfassung || `Beitrag von ${article.autor_name} auf dem Blog von Menschlichkeit Österreich.`}
        ogImage={article.og_image || undefined}
        ogType="article"
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Blog', url: 'https://www.menschlichkeit-oesterreich.at/blog' },
        { name: article.titel, url: `https://www.menschlichkeit-oesterreich.at/blog/${article.id}` },
      ]} />
      <JsonLdArticle
        title={article.seo_title || article.titel}
        description={article.seo_description || article.zusammenfassung || ''}
        url={`https://www.menschlichkeit-oesterreich.at/blog/${article.id}`}
        publishedAt={article.created_at}
        modifiedAt={article.updated_at}
        authorName={article.autor_name}
        imageUrl={article.og_image || undefined}
      />
      <Link to="/blog" className="text-red-600 hover:underline text-sm mb-4 inline-block">← Zurück zum Blog</Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">{article.kategorie}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">{article.titel}</h1>
        {article.zusammenfassung && (
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">{article.zusammenfassung}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Von <strong>{article.autor_name}</strong></span>
          <span>{formatDate(article.created_at)}</span>
        </div>
      </header>

      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
        {article.inhalt}
      </div>

      {article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Schlagwörter</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <Link to="/blog" className="text-red-600 hover:underline font-medium">Weitere Beiträge lesen</Link>
      </div>
    </article>
  );
}
