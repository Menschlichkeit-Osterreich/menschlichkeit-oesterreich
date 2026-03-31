import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CrossHostRedirectProps {
  to: string;
  replace?: boolean;
  title?: string;
  description?: string;
}

export default function CrossHostRedirect({
  to,
  replace = true,
  title = 'Weiterleitung zum Portal',
  description = 'Sie werden automatisch zum zuständigen Bereich weitergeleitet.',
}: CrossHostRedirectProps) {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (/^https?:\/\//i.test(to)) {
      if (replace) {
        window.location.replace(to);
      } else {
        window.location.assign(to);
      }
      return;
    }

    navigate(to, { replace });
  }, [navigate, replace, to]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-4">
      <div className="rounded-3xl border border-secondary-200 bg-white p-8 text-center shadow-sm">
        <div
          className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent motion-safe:animate-spin"
          aria-hidden="true"
        />
        <h1 className="text-xl font-bold text-secondary-900">{title}</h1>
        <p className="mt-2 text-sm text-secondary-500">{description}</p>
        <a className="mt-5 inline-flex text-sm font-semibold text-primary-700 hover:underline" href={to}>
          Jetzt wechseln
        </a>
      </div>
    </div>
  );
}
