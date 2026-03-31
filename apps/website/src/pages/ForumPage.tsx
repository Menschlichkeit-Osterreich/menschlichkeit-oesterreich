import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '../auth/AuthContext';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { buildPortalUrl } from '../utils/runtimeHost';

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

const API_BASE = API_BASE_URL;
const QUICK_LINKS = [
  { to: '/themen', label: 'Themenübersicht' },
  { to: '/veranstaltungen', label: 'Veranstaltungen' },
  { to: '/mitglied-werden', label: 'Mitglied werden' },
  { to: '/kontakt', label: 'Kontakt' },
];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

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
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [selectedCategory]);

  const writableCategories = useMemo(
    () => categories.filter(category => !category.id.startsWith('seed-')),
    [categories],
  );
  const starterCategoriesOnly = categories.length > 0 && writableCategories.length === 0;

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/forum/categories`);
      if (!res.ok) {
        setCategories([]);
        return;
      }

      const data = await res.json();
      const nextCategories = Array.isArray(data) ? data : [];
      setCategories(nextCategories);
      setNewThread(current => {
        if (current.category_id) {
          return current;
        }

        return {
          ...current,
          category_id: nextCategories.find((category: ForumCategory) => !category.id.startsWith('seed-'))?.id || '',
        };
      });
    } catch {
      setCategories([]);
    }
  }

  async function loadThreads() {
    setLoading(true);
    try {
      const params = selectedCategory ? `?category_id=${encodeURIComponent(selectedCategory)}` : '';
      const res = await fetch(`${API_BASE}/api/forum/threads${params}`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.data || []);
      } else {
        setThreads([]);
      }
    } catch {
      setThreads([]);
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  }

  async function handleCreateThread(event: React.FormEvent) {
    event.preventDefault();
    setCreateError('');

    if (!token) {
      setCreateError('Bitte melden Sie sich im Portal an.');
      return;
    }

    const resolvedCategoryId = newThread.category_id || writableCategories[0]?.id || '';
    if (!resolvedCategoryId) {
      setCreateError('Es ist noch keine schreibbare Kategorie freigeschaltet.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/forum/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newThread, category_id: resolvedCategoryId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Thema konnte nicht erstellt werden.');
      }

      setShowCreate(false);
      setNewThread({
        titel: '',
        inhalt: '',
        category_id: writableCategories[0]?.id || '',
      });
      await loadThreads();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Thema konnte nicht erstellt werden.');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHead
        title="Forum – Diskussion und Austausch"
        description="Nehmen Sie an Diskussionen zu Demokratie, Menschenrechten und gesellschaftlichen Themen teil. Das Community-Forum von Menschlichkeit Österreich."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Forum', url: 'https://www.menschlichkeit-oesterreich.at/forum' },
        ]}
      />

      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-secondary-200 bg-[linear-gradient(140deg,#1B4965_0%,#255d81_46%,#D4611E_100%)] px-7 py-8 text-white shadow-[0_28px_70px_rgba(27,73,101,0.18)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
                Community
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Forum für konstruktiven Austausch und gemeinsame Themenarbeit.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/86 sm:text-lg">
                Das Forum verbindet Diskussionen, Rückfragen, Veranstaltungsimpulse und Ideen aus der Community. Öffentliche
                Startthemen bleiben sichtbar, neue Diskussionen werden über das Portal gestartet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {token ? (
                <button
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-secondary-950 transition-colors hover:bg-secondary-50"
                  onClick={() => setShowCreate(open => !open)}
                >
                  Neues Thema
                </button>
              ) : (
                <a
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-secondary-950 transition-colors hover:bg-secondary-50"
                  href={buildPortalUrl('/login')}
                >
                  Im Portal anmelden
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-secondary-950">Kategorien</h2>
              <p className="mt-2 text-sm leading-6 text-secondary-600">
                Filtern Sie nach Themenbereichen oder nutzen Sie die öffentlichen Einstiege in weitere Bereiche.
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
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={[
                      'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
                    ].join(' ')}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-secondary-950">Community-Hinweis</h2>
              <p className="mt-2 text-sm leading-6 text-secondary-600">
                Startthemen mit Seed-Kategorien sind bewusst öffentliche Einstiege. Neue Themen können nur in freigeschalteten,
                echten Kategorien veröffentlicht werden.
              </p>
              {starterCategoriesOnly && (
                <div className="mt-4 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">
                  Es sind aktuell nur öffentliche Startkategorien sichtbar. Neue Diskussionen werden freigeschaltet, sobald
                  die ersten produktiven Community-Kategorien live sind.
                </div>
              )}

              <div className="mt-5 space-y-3">
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
            {showCreate && (
              <section className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-950">Neues Thema erstellen</h2>
                  <p className="mt-1 text-sm text-secondary-600">
                    Neue Diskussionen werden nur in freigeschalteten Community-Kategorien veröffentlicht.
                  </p>
                </div>

                {createError && (
                  <div className="mt-5 rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                    {createError}
                  </div>
                )}

                {starterCategoriesOnly ? (
                  <div className="mt-5 rounded-2xl border border-secondary-200 bg-secondary-50 px-4 py-4 text-sm text-secondary-700">
                    Öffentliche Startthemen sind sichtbar, aber noch nicht schreibbar. Sobald die ersten produktiven
                    Kategorien freigeschaltet sind, kann hier direkt publiziert werden.
                  </div>
                ) : (
                  <form className="mt-5 space-y-4" onSubmit={handleCreateThread}>
                    {writableCategories.length > 0 && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-secondary-800">Kategorie</label>
                        <select
                          className="w-full rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                          onChange={event =>
                            setNewThread(current => ({ ...current, category_id: event.target.value }))
                          }
                          value={newThread.category_id}
                        >
                          {writableCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Titel</label>
                      <input
                        className="w-full rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        onChange={event => setNewThread(current => ({ ...current, titel: event.target.value }))}
                        required
                        type="text"
                        value={newThread.titel}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-secondary-800">Inhalt</label>
                      <textarea
                        className="w-full rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        onChange={event => setNewThread(current => ({ ...current, inhalt: event.target.value }))}
                        required
                        rows={6}
                        value={newThread.inhalt}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                        type="submit"
                      >
                        Thema veröffentlichen
                      </button>
                      <button
                        className="rounded-full bg-secondary-100 px-4 py-2 text-sm font-semibold text-secondary-800 transition-colors hover:bg-secondary-200"
                        onClick={() => setShowCreate(false)}
                        type="button"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {loading && !hasLoaded ? (
              <div className="rounded-[1.75rem] border border-secondary-200 bg-white px-6 py-12 text-center shadow-sm">
                <div
                  className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent motion-safe:animate-spin"
                  aria-hidden="true"
                />
                <p className="text-sm text-secondary-500">Diskussionen werden geladen…</p>
              </div>
            ) : threads.length === 0 ? (
              <div className="rounded-[1.75rem] border border-secondary-200 bg-white px-6 py-12 text-center shadow-sm">
                <h2 className="text-2xl font-semibold text-secondary-950">Noch keine Diskussionen veröffentlicht</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-secondary-600">
                  Sobald erste Themen erscheinen, werden sie hier sichtbar. Bis dahin finden Sie auf unseren Themen- und
                  Veranstaltungsseiten viele inhaltliche Einstiege.
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
              <div className="space-y-4">
                {threads.map(thread => (
                  <Link
                    key={thread.id}
                    className="block rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg"
                    to={`/forum/${thread.id}`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {thread.is_pinned && (
                            <span className="rounded-full bg-warning-100 px-3 py-1 text-xs font-semibold text-warning-800">
                              Angepinnt
                            </span>
                          )}
                          {thread.is_locked && (
                            <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
                              Geschlossen
                            </span>
                          )}
                          {thread.category_name && (
                            <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-800">
                              {thread.category_name}
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl font-semibold text-secondary-950">{thread.titel}</h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-secondary-600">
                          {thread.inhalt}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-secondary-50 px-4 py-3 lg:min-w-[148px] lg:flex-col lg:items-end lg:text-right">
                        <div>
                          <div className="text-2xl font-bold text-secondary-950">{thread.reply_count}</div>
                          <div className="text-xs font-medium uppercase tracking-[0.16em] text-secondary-500">
                            Antworten
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-secondary-500">
                      <span>Von {thread.autor_name}</span>
                      <span>{formatDate(thread.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
