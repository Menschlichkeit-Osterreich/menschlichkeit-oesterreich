import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import SeoHead from '../components/seo/SeoHead';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';

interface ForumCategory {
  id: string;
  name: string;
  beschreibung: string | null;
  thread_count: number;
  post_count: number;
}

interface ForumThread {
  id: string;
  category_id: string;
  category_name: string | null;
  titel: string;
  inhalt: string;
  autor_name: string;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const QUICK_LINKS = [
  { to: '/themen', label: 'Themenübersicht' },
  { to: '/veranstaltungen', label: 'Veranstaltungen' },
  { to: '/mitglied-werden', label: 'Mitglied werden' },
  { to: '/kontakt', label: 'Kontakt' },
];

export default function ForumPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newThread, setNewThread] = useState({ titel: '', inhalt: '', category_id: '' });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadCategories();
    loadThreads();
  }, []);

  useEffect(() => {
    loadThreads();
  }, [selectedCategory]);

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/forum/categories`);
      if (res.ok) setCategories(await res.json());
    } catch { /* ignore */ }
  }

  async function loadThreads() {
    setLoading(true);
    try {
      const params = selectedCategory ? `?category_id=${selectedCategory}` : '';
      const res = await fetch(`${API_BASE}/api/forum/threads${params}`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.data || []);
      }
    } catch { /* ignore */ }
    setHasLoaded(true);
    setLoading(false);
  }

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    if (!token) { setCreateError('Bitte melden Sie sich an'); return; }
    if (!newThread.category_id && categories.length > 0) {
      newThread.category_id = categories[0].id;
    }
    try {
      const res = await fetch(`${API_BASE}/api/forum/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newThread),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || 'Fehler beim Erstellen');
      }
      setShowCreate(false);
      setNewThread({ titel: '', inhalt: '', category_id: '' });
      loadThreads();
    } catch (err: any) {
      setCreateError(err.message);
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SeoHead
        title="Forum – Diskussion und Austausch"
        description="Nehmen Sie an Diskussionen zu Demokratie, Menschenrechten und gesellschaftlichen Themen teil. Das Community-Forum von Menschlichkeit Österreich."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Forum', url: 'https://www.menschlichkeit-oesterreich.at/forum' },
      ]} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forum</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Diskussionen und Austausch zu Demokratie, Menschenrechten, sozialer Gerechtigkeit und Vereinsarbeit.
          </p>
        </div>
        {token && (
          <button onClick={() => setShowCreate(!showCreate)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
            Neues Thema
          </button>
        )}
      </div>

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Wofür das Forum gedacht ist</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Das Forum bündelt Diskussionen, Rückfragen und thematische Beiträge aus der Community. Es ergänzt unsere
          Themen-, Bildungs- und Veranstaltungsseiten um direkten Austausch.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="font-medium text-primary-700 hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Neues Thema erstellen</h2>
          {createError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg mb-4">{createError}</div>
          )}
          <form onSubmit={handleCreateThread} className="space-y-4">
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label>
                <select value={newThread.category_id} onChange={e => setNewThread(p => ({ ...p, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
              <input type="text" required value={newThread.titel} onChange={e => setNewThread(p => ({ ...p, titel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inhalt</label>
              <textarea required rows={5} value={newThread.inhalt} onChange={e => setNewThread(p => ({ ...p, inhalt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Erstellen</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            Alle
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === c.id ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {c.name} ({c.thread_count})
            </button>
          ))}
        </div>
      )}

      {loading && !hasLoaded ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Wird geladen…</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-5xl block mb-4">💬</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Noch keine Themen</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
            Sobald erste Diskussionen veröffentlicht sind, erscheinen sie hier. Bis dahin finden Sie auf unseren Themen-
            und Veranstaltungsseiten viele Einstiegsangebote.
          </p>
          <div className="mb-5 flex flex-wrap justify-center gap-3 text-sm">
            {QUICK_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="font-medium text-primary-600 hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
          {token && (
            <button onClick={() => setShowCreate(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Erstes Thema erstellen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <Link key={thread.id} to={`/forum/${thread.id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.is_pinned && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">📌 Angepinnt</span>}
                    {thread.is_locked && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">🔒 Gesperrt</span>}
                    {thread.category_name && <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{thread.category_name}</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{thread.titel}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{thread.inhalt.substring(0, 200)}{thread.inhalt.length > 200 ? '…' : ''}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{thread.reply_count}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Antworten</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>Von {thread.autor_name}</span>
                <span>{formatDate(thread.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
