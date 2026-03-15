import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  async function loadArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('kategorie', selectedCategory);
      const res = await fetch(`${API_BASE}/api/blog/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.data || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  }

  const allCategories = [...new Set(articles.map(a => a.kategorie))];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SeoHead
        title="Neuigkeiten & Blog – Menschlichkeit Österreich"
        description="Aktuelle Beiträge, Berichte und Analysen zu Demokratie, Menschenrechten, sozialer Gerechtigkeit und Zivilgesellschaft in Österreich."
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Neuigkeiten & Blog</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Aktuelle Nachrichten und Beiträge von Menschlichkeit Österreich</p>
      </div>

      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
            Alle
          </button>
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Wird geladen…</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-5xl block mb-4">📰</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Noch keine Beiträge</h2>
          <p className="text-gray-500 dark:text-gray-400">Bald finden Sie hier aktuelle Nachrichten und Beiträge.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <Link key={article.id} to={`/blog/${article.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all group">
              <div className="h-40 bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
                <span className="text-5xl opacity-80">📝</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">{article.kategorie}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(article.created_at)}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">{article.titel}</h2>
                {article.zusammenfassung && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">{article.zusammenfassung}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Von {article.autor_name}</span>
                </div>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
