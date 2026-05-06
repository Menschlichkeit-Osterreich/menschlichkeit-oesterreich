import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '../auth/AuthContext';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { PUBLIC_PORTAL_ENTRY_PATH } from '../utils/runtimeHost';

interface Thread {
  id: string;
  titel: string;
  inhalt: string;
  autor_name: string;
  category_name: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  created_at: string;
}

interface Post {
  id: string;
  inhalt: string;
  autor_name: string;
  created_at: string;
}

const API_BASE = API_BASE_URL;

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

export default function ForumThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const { token } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (!threadId) {
      setLoading(false);
      return;
    }

    void Promise.all([loadThread(threadId), loadPosts(threadId)]);
  }, [threadId]);

  async function loadThread(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/threads/${id}`);
      if (res.ok) {
        setThread(await res.json());
      } else {
        setThread(null);
      }
    } catch {
      setThread(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/forum/threads/${id}/posts`);
      if (res.ok) {
        setPosts(await res.json());
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    }
  }

  async function handleReply(event: React.FormEvent) {
    event.preventDefault();

    if (!token) {
      setReplyError('Bitte melden Sie sich im Portal an.');
      return;
    }

    setReplyError('');
    setReplying(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ thread_id: threadId, inhalt: replyContent }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Antwort konnte nicht gesendet werden.');
      }

      setReplyContent('');
      if (threadId) {
        await Promise.all([loadPosts(threadId), loadThread(threadId)]);
      }
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : 'Antwort konnte nicht gesendet werden.');
    } finally {
      setReplying(false);
    }
  }

  const isSeedThread = useMemo(() => Boolean(thread?.id?.startsWith('seed-')), [thread?.id]);
  const canReply = Boolean(token) && Boolean(thread) && !thread?.is_locked && !isSeedThread;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent motion-safe:animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-secondary-500">Diskussion wird geladen…</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-secondary-950">Thread nicht gefunden</h1>
        <p className="mt-3 text-sm text-secondary-600">
          Dieser Diskussionsbeitrag ist nicht verfügbar oder wurde verschoben.
        </p>
        <Link className="mt-5 inline-flex text-sm font-semibold text-primary-700 hover:underline" to="/forum">
          Zurück zum Forum
        </Link>
      </div>
    );
  }

  const description = thread.inhalt.length > 180 ? `${thread.inhalt.slice(0, 177)}...` : thread.inhalt;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <SeoHead
        title={`${thread.titel} – Forum`}
        description={description}
        canonical={`/forum/${thread.id}`}
        ogType="article"
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Forum', url: 'https://www.menschlichkeit-oesterreich.at/forum' },
          { name: thread.titel, url: `https://www.menschlichkeit-oesterreich.at/forum/${thread.id}` },
        ]}
      />

      <div className="space-y-8">
        <Link className="inline-flex text-sm font-semibold text-primary-700 hover:underline" to="/forum">
          Zurück zum Forum
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-secondary-200 bg-[linear-gradient(140deg,#1B4965_0%,#255d81_46%,#D4611E_100%)] px-7 py-8 text-white shadow-[0_28px_70px_rgba(27,73,101,0.18)] sm:px-10 sm:py-10">
          <div className="mb-4 flex flex-wrap gap-2">
            {thread.is_pinned && (
              <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold text-white/92">
                Angepinnt
              </span>
            )}
            {thread.is_locked && (
              <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold text-white/92">
                Geschlossen
              </span>
            )}
            {thread.category_name && (
              <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold text-white/92">
                {thread.category_name}
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{thread.titel}</h1>
          <p className="mt-5 max-w-3xl whitespace-pre-wrap text-base leading-8 text-white/86">{thread.inhalt}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <span>{thread.autor_name}</span>
            <span>{formatDate(thread.created_at)}</span>
            <span>{thread.reply_count} Antworten</span>
          </div>
        </section>

        {posts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-secondary-950">Antworten</h2>
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
                {posts.length} Beiträge
              </span>
            </div>

            {posts.map(post => (
              <article
                key={post.id}
                className="rounded-[1.5rem] border border-secondary-200 bg-white p-6 shadow-sm"
              >
                <div className="whitespace-pre-wrap text-sm leading-7 text-secondary-700">{post.inhalt}</div>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-secondary-200 pt-4 text-xs text-secondary-500">
                  <span>{post.autor_name}</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </article>
            ))}
          </section>
        )}

        {thread.is_locked && (
          <section className="rounded-[1.75rem] border border-secondary-200 bg-secondary-50 px-6 py-5 text-sm text-secondary-700 shadow-sm">
            Dieser Thread ist geschlossen. Öffentliche Startbeiträge bleiben sichtbar, neue Antworten können nur in offenen
            Diskussionen veröffentlicht werden.
          </section>
        )}

        {isSeedThread && !thread.is_locked && (
          <section className="rounded-[1.75rem] border border-warning-200 bg-warning-50 px-6 py-5 text-sm text-warning-800 shadow-sm">
            Dieser Beitrag stammt aus der Startredaktion. Antworten werden erst freigeschaltet, sobald die produktiven
            Community-Kategorien live sind.
          </section>
        )}

        {canReply && (
          <section className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-secondary-950">Antwort schreiben</h2>
            <p className="mt-1 text-sm text-secondary-600">
              Schreiben Sie sachlich, nachvollziehbar und respektvoll. Ihr Beitrag erscheint direkt im Thread.
            </p>

            {replyError && (
              <div className="mt-5 rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                {replyError}
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleReply}>
              <textarea
                className="w-full rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                onChange={event => setReplyContent(event.target.value)}
                placeholder="Ihre Antwort…"
                required
                rows={5}
                value={replyContent}
              />
              <button
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                disabled={replying}
                type="submit"
              >
                {replying ? 'Wird gesendet…' : 'Antwort senden'}
              </button>
            </form>
          </section>
        )}

        {!token && !thread.is_locked && (
          <section className="rounded-[1.75rem] border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-secondary-950">Im Portal anmelden</h2>
            <p className="mt-2 text-sm leading-7 text-secondary-600">
              Für neue Antworten und eigene Diskussionen nutzen Sie bitte das CRM-Portal.
            </p>
            <Link
              className="mt-5 inline-flex rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              to={PUBLIC_PORTAL_ENTRY_PATH}
            >
              Zum Portal-Login
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
