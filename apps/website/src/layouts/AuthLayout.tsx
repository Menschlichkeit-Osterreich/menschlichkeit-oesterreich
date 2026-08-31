import { Outlet } from 'react-router-dom';
import { buildPublicUrl } from '../utils/runtimeHost';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main id="main" className="flex flex-1 items-start justify-center px-5 py-12 sm:py-16">
        <div className="w-full max-w-[480px]">
          <div className="border border-paper-rule bg-white p-6 sm:p-9">
            <a
              href={buildPublicUrl('/')}
              className="mb-7 flex w-fit items-center gap-2.5"
              aria-label="Zur Website von Menschlichkeit Österreich"
            >
              <img
                src="/logo.jpg"
                alt=""
                width={960}
                height={960}
                decoding="async"
                className="h-[34px] w-[34px] object-cover"
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                Mitglieder-Portal
              </span>
            </a>
            <Outlet />
          </div>
        </div>
      </main>

      <footer className="px-5 pb-10 text-center text-[13px] text-ink-muted">
        <a
          href={buildPublicUrl('/')}
          className="transition-colors hover:text-primary-600 hover:underline hover:underline-offset-4"
        >
          Zurück zur Website
        </a>
        {' · '}
        <a
          href={buildPublicUrl('/datenschutz')}
          className="transition-colors hover:text-primary-600 hover:underline hover:underline-offset-4"
        >
          Datenschutz
        </a>
        {' · '}
        <a
          href={buildPublicUrl('/impressum')}
          className="transition-colors hover:text-primary-600 hover:underline hover:underline-offset-4"
        >
          Impressum
        </a>
      </footer>
    </div>
  );
}
