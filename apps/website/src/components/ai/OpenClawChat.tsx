/**
 * OpenClaw WebChat-Widget
 * Verbindet die Website mit dem OpenClaw Multi-Agent-System
 * Unterstützt: Mitglieder-Anfragen, Event-Info, Demokratiespiel-Hilfe
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CONTACT_EMAIL } from '../../config/siteConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  taskId?: string;
  status?: 'sending' | 'done' | 'error';
}

interface OpenClawChatProps {
  bridgeUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark' | 'auto';
  welcomeMessage?: string;
}

import { OPENCLAW_BRIDGE_URL } from '@/constants/api';
const BRIDGE_URL = OPENCLAW_BRIDGE_URL;

const QUICK_ACTIONS = [
  { label: '🗓️ Nächste Events', query: 'Welche Events sind als nächstes geplant?' },
  { label: '🎮 Spiel starten', query: 'Wie kann ich das Demokratiespiel spielen?' },
  { label: '👥 Mitglied werden', query: 'Wie werde ich Mitglied bei Menschlichkeit Österreich?' },
  { label: '💰 Spenden', query: 'Wie kann ich spenden?' },
];

export const OpenClawChat: React.FC<OpenClawChatProps> = ({
  bridgeUrl = BRIDGE_URL,
  position = 'bottom-right',
  theme: _theme = 'auto',
  welcomeMessage = 'Hallo! Ich bin der KI-Assistent von Menschlichkeit Österreich. Wie kann ich Ihnen helfen?',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
      status: 'done',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Health-Check beim Start
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fokus beim Öffnen
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const checkHealth = async () => {
    try {
      const resp = await fetch(`${bridgeUrl}/health`, { signal: AbortSignal.timeout(3000) });
      setIsOnline(resp.ok);
    } catch {
      setIsOnline(false);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      status: 'done',
    };

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Task an Agent-Runtime senden
      const response = await fetch(`${bridgeUrl}/agent/task/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: text.trim().substring(0, 100),
          objective: text.trim(),
          role: 'research',
          inputs: { query: text.trim(), source: 'website_chat' },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Polling für Task-Ergebnis
      const result = await pollTaskResult(data.task_id);

      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id
          ? { ...m, content: result, status: 'done', taskId: data.task_id }
          : m
      ));
    } catch (_error) {
      // Fallback: Lokale Antworten für häufige Fragen
      const fallback = getFallbackResponse(text);
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id
          ? { ...m, content: fallback, status: 'done' }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, bridgeUrl]);

  const pollTaskResult = async (taskId: string, maxAttempts = 20): Promise<string> => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const resp = await fetch(`${bridgeUrl}/agent/task/${taskId}`);
        const task = await resp.json();
        if (task.status === 'DONE' && task.result_summary) {
          return task.result_summary;
        }
        if (task.status === 'DEADLETTER') {
          throw new Error(task.error_message);
        }
      } catch { /* weiter versuchen */ }
    }
    throw new Error('Timeout');
  };

  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('mitglied') || q.includes('beitreten')) {
      return 'Um Mitglied bei Menschlichkeit Österreich zu werden, besuchen Sie bitte unsere [Mitgliedschaft-Seite](/mitglied-werden). Der Jahresbeitrag beträgt ab € 36 (Standard) bzw. € 18 (Ermäßigt).';
    }
    if (q.includes('event') || q.includes('veranstaltung')) {
      return `Unsere aktuellen Veranstaltungen finden Sie auf der [Events-Seite](/veranstaltungen). Für Fragen schreiben Sie uns an ${CONTACT_EMAIL}`;
    }
    if (q.includes('spiel') || q.includes('demokratie')) {
      return 'Das Demokratiespiel "Brücken Bauen" können Sie direkt [hier spielen](/spiel). Es hat 100 Level mit verschiedenen demokratischen Szenarien!';
    }
    if (q.includes('spende') || q.includes('unterstützen')) {
      return 'Vielen Dank für Ihr Interesse! Sie können uns via Banküberweisung, SEPA oder Kreditkarte unterstützen. Details auf unserer [Spenden-Seite](/spenden).';
    }
    return `Vielen Dank für Ihre Anfrage. Unser KI-Assistent ist gerade nicht verfügbar. Bitte kontaktieren Sie uns direkt unter ${CONTACT_EMAIL}.`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const positionClass = position === 'bottom-right'
    ? 'bottom-6 right-6'
    : 'bottom-6 left-6';

  return (
    <div className={`fixed ${positionClass} z-50 flex flex-col items-end gap-3`}>
      {/* Chat-Fenster */}
      {isOpen && (
        <div className="w-96 h-[520px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
              MÖ
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">KI-Assistent</div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-white/70 text-xs">
                  {isOnline ? 'Online' : 'Offline – Basis-Antworten aktiv'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Chat schließen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nachrichten */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {msg.status === 'sending' ? (
                    <div className="flex gap-1 py-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <span dangerouslySetInnerHTML={{
                      __html: msg.content.replace(
                        /\[([^\]]+)\]\(([^)]+)\)/g,
                        (_match, text, url) => {
                          // Security: only allow safe URL protocols; block javascript:, data:, vbscript:
                          const safeUrl = /^(https?:\/\/|\/|#)/.test(url) ? url : '#';
                          // Escape HTML in the link text to prevent injection
                          const safeText = text.replace(/[<>"&]/g, (c: string) =>
                            ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c] ?? c)
                          );
                          return `<a href="${safeUrl}" class="underline hover:no-underline" target="_self" rel="noopener noreferrer">${safeText}</a>`;
                        }
                      )
                    }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 flex gap-2 flex-wrap bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.query)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-full transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Eingabe */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ihre Frage..."
              disabled={isLoading}
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              aria-label="Senden"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle-Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Chat schließen' : 'Chat öffnen'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Unread-Badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
};

export default OpenClawChat;
