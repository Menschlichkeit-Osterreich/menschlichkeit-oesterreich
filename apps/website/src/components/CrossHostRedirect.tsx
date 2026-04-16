import React from 'react';
import { useNavigate } from 'react-router-dom';
import SeoHead from './seo/SeoHead';

interface CrossHostRedirectProps {
  to: string;
  replace?: boolean;
  title?: string;
  description?: string;
  probeUrl?: string;
  failureTitle?: string;
  failureDescription?: string;
  fallbackActions?: Array<{
    href: string;
    label: string;
    primary?: boolean;
  }>;
  autoRedirectDelayMs?: number;
}

export default function CrossHostRedirect({
  to,
  replace = true,
  title = 'Weiterleitung zum Portal',
  description = 'Sie werden automatisch zum zuständigen Bereich weitergeleitet.',
  probeUrl,
  failureTitle = 'Ziel derzeit nicht erreichbar',
  failureDescription = 'Bitte versuchen Sie es in wenigen Minuten erneut oder nutzen Sie die angebotenen Alternativen.',
  fallbackActions = [],
  autoRedirectDelayMs = 900,
}: CrossHostRedirectProps) {
  const navigate = useNavigate();
  const isExternal = /^https?:\/\//i.test(to);
  const allowAutoRedirect =
    typeof window !== 'undefined' &&
    !['127.0.0.1', 'localhost'].includes(window.location.hostname.toLowerCase());
  const [status, setStatus] = React.useState<'checking' | 'ready' | 'failed'>(
    isExternal && probeUrl ? 'checking' : 'ready'
  );

  React.useEffect(() => {
    if (isExternal) {
      return;
    }

    navigate(to, { replace });
  }, [isExternal, navigate, replace, to]);

  React.useEffect(() => {
    if (!isExternal || !probeUrl) {
      setStatus('ready');
      return;
    }

    let active = true;
    const probe = new Image();
    const timeout = window.setTimeout(() => {
      if (active) {
        setStatus('failed');
      }
    }, 3500);

    const settle = (next: 'ready' | 'failed') => {
      if (!active) {
        return;
      }

      window.clearTimeout(timeout);
      setStatus(next);
    };

    probe.onload = () => settle('ready');
    probe.onerror = () => settle('failed');
    probe.src = `${probeUrl}${probeUrl.includes('?') ? '&' : '?'}_probe=${Date.now()}`;

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [isExternal, probeUrl, to]);

  React.useEffect(() => {
    if (!isExternal || status !== 'ready' || !allowAutoRedirect) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      if (replace) {
        window.location.replace(to);
        return;
      }

      window.location.assign(to);
    }, autoRedirectDelayMs);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [allowAutoRedirect, autoRedirectDelayMs, isExternal, replace, status, to]);

  const pending = isExternal && status !== 'failed';
  const actions =
    status === 'failed'
      ? [{ href: to, label: 'Portal erneut öffnen', primary: true }, ...fallbackActions]
      : [{ href: to, label: allowAutoRedirect ? 'Jetzt wechseln' : 'Portal öffnen', primary: true }];
  const liveRole = status === 'failed' ? 'alert' : 'status';
  const statusText =
    status === 'checking'
      ? 'Wir prüfen gerade, ob das Ziel erreichbar ist.'
      : status === 'ready'
        ? allowAutoRedirect
          ? 'Ziel erreichbar. Die Weiterleitung startet automatisch.'
          : 'Ziel erreichbar. Im lokalen Preview bleibt die Seite als manueller Einstieg stehen.'
        : failureDescription;

  return (
    <>
      <SeoHead
        title={status === 'failed' ? failureTitle : title}
        description={status === 'failed' ? failureDescription : description}
      />
      <main id="main" className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-4 py-12">
        <div
          className="w-full rounded-3xl border border-secondary-200 bg-white p-8 text-center shadow-sm"
          role={liveRole}
          aria-live="polite"
        >
          <div
            className={[
              'mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full',
              pending
                ? 'border-4 border-primary-500 border-t-transparent motion-safe:animate-spin'
                : 'bg-warning-100 text-warning-800',
            ].join(' ')}
            aria-hidden="true"
          >
            {pending ? null : '!'}
          </div>
          <h1 className="text-xl font-bold text-secondary-900">
            {status === 'failed' ? failureTitle : title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-secondary-700">
            {status === 'failed' ? failureDescription : description}
          </p>
          <p className="mt-3 text-sm text-secondary-600">{statusText}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {actions.map(action => (
              <a
                key={`${action.href}-${action.label}`}
                className={[
                  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  action.primary
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
                ].join(' ')}
                href={action.href}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
