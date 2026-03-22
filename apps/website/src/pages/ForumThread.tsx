import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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

import { API_BASE_URL } from '@/constants/api';
const API_BASE = API_BASE_URL;

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
    if (threadId) {
      loadThread();
      loadPosts();
    }
  }, [threadId]);

  async function loadThread() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/threads/${threadId}`);
      if (res.ok) setThread(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function loadPosts() {
    try {
      const res = await fetch(`${API_BASE}/api/forum/threads/${threadId}/posts`);
      if (res.ok) setPosts(await res.json());
    } catch { /* ignore */ }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setReplyError('Bitte melden Sie sich an'); return; }
    setReplyError('');
    setReplying(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ thread_id: threadId, inhalt: replyContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || 'Fehler');
      }
      setReplyContent('');
      loadPosts();
      loadThread();
    } catch (err: any) {
      setReplyError(err.message);
    } finally {
      setReplying(false);
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Wird geladen…</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thread nicht gefunden</h1>
        <Link to="/forum" className="text-red-600 hover:underline">Zurück zum Forum</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/forum" className="text-red-600 hover:underline text-sm mb-4 inline-block">← Zurück zum Forum</Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {thread.is_pinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌 Angepinnt</span>}
          {thread.is_locked && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🔒 Gesperrt</span>}
          {thread.category_name && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{thread.category_name}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{thread.titel}</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{thread.inhalt}</div>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
          <span className="font-medium">{thread.autor_name}</span>
          <span>{formatDate(thread.created_at)}</span>
          <span>{thread.reply_count} Antworten</span>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Antworten ({posts.length})</h2>
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.inhalt}</div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className="font-medium">{post.autor_name}</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {token && !thread.is_locked && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Antwort schreiben</h3>
          {replyError && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg mb-3">{replyError}</div>
          )}
          <form onSubmit={handleReply} className="space-y-3">
            <textarea required rows={4} value={replyContent} onChange={e => setReplyContent(e.target.value)}
              placeholder="Ihre Antwort…"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <button type="submit" disabled={replying}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {replying ? 'Wird gesendet…' : 'Antwort senden'}
            </button>
          </form>
        </div>
      )}

      {!token && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-3">Melden Sie sich an, um zu antworten.</p>
          <Link to="/login" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-block">Anmelden</Link>
        </div>
      )}
    </div>
  );
}
