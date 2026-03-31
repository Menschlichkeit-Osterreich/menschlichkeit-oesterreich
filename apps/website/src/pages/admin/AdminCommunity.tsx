import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { http } from '../../services/http';

interface BlogArticle {
  id: string;
  titel: string;
  zusammenfassung?: string | null;
  kategorie: string;
  veroeffentlicht: boolean;
  created_at: string;
  updated_at: string;
}

interface ForumCategory {
  id: string;
  name: string;
  beschreibung?: string | null;
  thread_count: number;
  post_count: number;
}

interface ForumThread {
  id: string;
  category_id: string;
  category_name?: string | null;
  titel: string;
  inhalt: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
}

type TabId = 'blog' | 'forum';

export default function AdminCommunity() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabId>('blog');
  const [articles, setArticles] = React.useState<BlogArticle[]>([]);
  const [categories, setCategories] = React.useState<ForumCategory[]>([]);
  const [threads, setThreads] = React.useState<ForumThread[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [articleForm, setArticleForm] = React.useState({
    titel: '',
    zusammenfassung: '',
    kategorie: 'Allgemein',
    inhalt: '',
    seo_title: '',
    seo_description: '',
    veroeffentlicht: true,
  });
  const [categoryForm, setCategoryForm] = React.useState({
    name: '',
    beschreibung: '',
  });
  const [threadForm, setThreadForm] = React.useState({
    category_id: '',
    titel: '',
    inhalt: '',
    is_pinned: false,
    is_locked: false,
  });

  const authOpts = React.useMemo(() => (token ? { token } : undefined), [token]);
  const writeableCategories = React.useMemo(
    () => categories.filter(category => !category.id.startsWith('seed-')),
    [categories],
  );

  const loadData = React.useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [articleResponse, categoryResponse, threadResponse] = await Promise.all([
        http.get<{ data: BlogArticle[] }>('/api/blog/articles?nur_veroeffentlicht=false&page_size=25', authOpts),
        http.get<ForumCategory[]>('/api/forum/categories', authOpts),
        http.get<{ data: ForumThread[] }>('/api/forum/threads?page_size=25', authOpts),
      ]);

      setArticles(articleResponse.data || []);
      setCategories(categoryResponse || []);
      setThreads(threadResponse.data || []);
      setThreadForm(prev => ({
        ...prev,
        category_id: prev.category_id || categoryResponse.find((category: ForumCategory) => !category.id.startsWith('seed-'))?.id || '',
      }));
    } catch {
      setError('Community-Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [authOpts, token]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function createArticle(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setMessage(null);
    setError(null);
    try {
      await http.post(
        '/api/blog/articles',
        articleForm,
        { token },
      );
      setArticleForm({
        titel: '',
        zusammenfassung: '',
        kategorie: 'Allgemein',
        inhalt: '',
        seo_title: '',
        seo_description: '',
        veroeffentlicht: true,
      });
      setMessage('Blogbeitrag wurde angelegt.');
      await loadData();
    } catch {
      setError('Der Blogbeitrag konnte nicht gespeichert werden.');
    }
  }

  async function createCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setMessage(null);
    setError(null);
    try {
      await http.post('/api/forum/categories', categoryForm, { token });
      setCategoryForm({ name: '', beschreibung: '' });
      setMessage('Forum-Kategorie wurde angelegt.');
      await loadData();
    } catch {
      setError('Die Forum-Kategorie konnte nicht gespeichert werden.');
    }
  }

  async function createThread(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setMessage(null);
    setError(null);
    try {
      const created = await http.post<ForumThread>(
        '/api/forum/threads',
        {
          category_id: threadForm.category_id,
          titel: threadForm.titel,
          inhalt: threadForm.inhalt,
        },
        { token },
      );

      if (threadForm.is_pinned || threadForm.is_locked) {
        await http.put(
          `/api/forum/threads/${created.id}`,
          {
            is_pinned: threadForm.is_pinned,
            is_locked: threadForm.is_locked,
          },
          { token },
        );
      }

      setThreadForm({
        category_id: categories[0]?.id || '',
        titel: '',
        inhalt: '',
        is_pinned: false,
        is_locked: false,
      });
      setMessage('Forum-Thread wurde angelegt.');
      await loadData();
    } catch {
      setError('Der Forum-Thread konnte nicht gespeichert werden.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-secondary-900">Community-Redaktion</h1>
        <p className="mt-2 max-w-3xl text-sm text-secondary-500">
          Pflegen Sie Blog, Forum und Startinhalte zentral im CRM-Portal.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <div className="flex gap-2 rounded-full bg-secondary-100 p-1">
        {([
          { id: 'blog', label: 'Blog' },
          { id: 'forum', label: 'Forum' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === tab.id
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900',
            ].join(' ')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-secondary-200 bg-white p-6 text-sm text-secondary-500 shadow-sm">
          Community-Daten werden geladen…
        </div>
      ) : activeTab === 'blog' ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Neue Veröffentlichung</h2>
            <form className="mt-5 space-y-4" onSubmit={createArticle}>
              <input
                className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                placeholder="Titel"
                value={articleForm.titel}
                onChange={event => setArticleForm(prev => ({ ...prev, titel: event.target.value }))}
                required
              />
              <input
                className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                placeholder="Kategorie"
                value={articleForm.kategorie}
                onChange={event => setArticleForm(prev => ({ ...prev, kategorie: event.target.value }))}
              />
              <textarea
                className="min-h-24 w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                placeholder="Zusammenfassung"
                value={articleForm.zusammenfassung}
                onChange={event => setArticleForm(prev => ({ ...prev, zusammenfassung: event.target.value }))}
              />
              <textarea
                className="min-h-56 w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                placeholder="Inhalt"
                value={articleForm.inhalt}
                onChange={event => setArticleForm(prev => ({ ...prev, inhalt: event.target.value }))}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  placeholder="SEO-Titel"
                  value={articleForm.seo_title}
                  onChange={event => setArticleForm(prev => ({ ...prev, seo_title: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  placeholder="SEO-Beschreibung"
                  value={articleForm.seo_description}
                  onChange={event => setArticleForm(prev => ({ ...prev, seo_description: event.target.value }))}
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-secondary-700">
                <input
                  checked={articleForm.veroeffentlicht}
                  onChange={event => setArticleForm(prev => ({ ...prev, veroeffentlicht: event.target.checked }))}
                  type="checkbox"
                />
                Sofort veröffentlichen
              </label>
              <button className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                Beitrag speichern
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Vorhandene Beiträge</h2>
            <div className="mt-5 space-y-3">
              {articles.length === 0 ? (
                <p className="text-sm text-secondary-500">Noch keine Beiträge vorhanden.</p>
              ) : (
                articles.map(article => (
                  <div key={article.id} className="rounded-2xl border border-secondary-200 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-secondary-900">{article.titel}</div>
                        <div className="mt-1 text-sm text-secondary-500">
                          {article.kategorie} · {new Date(article.updated_at).toLocaleDateString('de-AT')}
                        </div>
                      </div>
                      <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
                        {article.veroeffentlicht ? 'Live' : 'Entwurf'}
                      </span>
                    </div>
                    {article.zusammenfassung && (
                      <p className="mt-3 text-sm text-secondary-600">{article.zusammenfassung}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-secondary-900">Kategorie anlegen</h2>
              <form className="mt-5 space-y-4" onSubmit={createCategory}>
                <input
                  className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  placeholder="Name der Kategorie"
                  value={categoryForm.name}
                  onChange={event => setCategoryForm(prev => ({ ...prev, name: event.target.value }))}
                  required
                />
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  placeholder="Kurzbeschreibung"
                  value={categoryForm.beschreibung}
                  onChange={event => setCategoryForm(prev => ({ ...prev, beschreibung: event.target.value }))}
                />
                <button className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                  Kategorie speichern
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-secondary-900">Thread anlegen</h2>
              <form className="mt-5 space-y-4" onSubmit={createThread}>
                <select
                  className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  value={threadForm.category_id}
                  onChange={event => setThreadForm(prev => ({ ...prev, category_id: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Kategorie wählen
                  </option>
                  {writeableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  placeholder="Titel des Threads"
                  value={threadForm.titel}
                  onChange={event => setThreadForm(prev => ({ ...prev, titel: event.target.value }))}
                  required
                />
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-secondary-200 px-4 py-3 text-sm"
                  placeholder="Inhalt"
                  value={threadForm.inhalt}
                  onChange={event => setThreadForm(prev => ({ ...prev, inhalt: event.target.value }))}
                  required
                />
                <div className="flex flex-wrap gap-4 text-sm text-secondary-700">
                  <label className="flex items-center gap-2">
                    <input
                      checked={threadForm.is_pinned}
                      onChange={event => setThreadForm(prev => ({ ...prev, is_pinned: event.target.checked }))}
                      type="checkbox"
                    />
                    Anpinnen
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      checked={threadForm.is_locked}
                      onChange={event => setThreadForm(prev => ({ ...prev, is_locked: event.target.checked }))}
                      type="checkbox"
                    />
                    Direkt sperren
                  </label>
                </div>
                <button
                  className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                  disabled={writeableCategories.length === 0 || !threadForm.category_id}
                >
                  Thread speichern
                </button>
              </form>
              {writeableCategories.length === 0 && (
                <p className="mt-4 text-sm text-secondary-500">
                  Für neue Threads legen Sie zuerst mindestens eine eigene Forum-Kategorie an. Seed-Kategorien dienen nur als öffentliches Startmaterial.
                </p>
              )}
            </section>
          </div>

          <section className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900">Forum-Status</h2>
            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Kategorien</h3>
                <div className="mt-3 space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="rounded-2xl border border-secondary-200 px-4 py-3">
                      <div className="font-medium text-secondary-900">{category.name}</div>
                      <div className="mt-1 text-sm text-secondary-500">
                        {category.thread_count} Threads · {category.post_count} Beiträge
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Aktuelle Threads</h3>
                <div className="mt-3 space-y-2">
                  {threads.length === 0 ? (
                    <p className="text-sm text-secondary-500">Noch keine Threads vorhanden.</p>
                  ) : (
                    threads.map(thread => (
                      <div key={thread.id} className="rounded-2xl border border-secondary-200 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-secondary-900">{thread.titel}</div>
                            <div className="mt-1 text-sm text-secondary-500">
                              {thread.category_name || 'Ohne Kategorie'} ·{' '}
                              {new Date(thread.created_at).toLocaleDateString('de-AT')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {thread.is_pinned && (
                              <span className="rounded-full bg-warning-100 px-2 py-1 text-xs font-semibold text-warning-700">
                                Angepinnt
                              </span>
                            )}
                            {thread.is_locked && (
                              <span className="rounded-full bg-secondary-100 px-2 py-1 text-xs font-semibold text-secondary-700">
                                Gesperrt
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
