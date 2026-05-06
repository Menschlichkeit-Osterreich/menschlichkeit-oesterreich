import React from 'react';
import { Outlet } from 'react-router-dom';
import { buildPublicUrl } from '../utils/runtimeHost';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1b4965 0%, #285a79 42%, #d4611e 100%)' }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-2xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30 mb-6">
            <img
              src="/logo.jpg"
              alt="Verein Menschlichkeit Österreich"
              width={960}
              height={960}
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">CRM-Portal</span>
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Menschlichkeit<br />Österreich
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-white/85">
            Mitglieder-Self-Service, Vereinsverwaltung und redaktionelle Pflege auf einer gemeinsamen Arbeitsoberfläche.
          </p>
          <div className="mt-8 flex flex-col gap-2 text-xs text-white/70">
            <span>ZVR: 1182213083</span>
            <span>Gegründet: 28. Mai 2025</span>
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-4 border-b border-secondary-100">
          <a href={buildPublicUrl('/')} className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="Menschlichkeit Österreich"
              width={960}
              height={960}
              decoding="async"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-100"
            />
            <span className="font-bold text-secondary-900 text-sm">Menschlichkeit Österreich</span>
          </a>
        </div>

        <main id="main" className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-secondary-50">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>

        <footer className="text-center text-xs text-secondary-400 py-4 px-6">
          <a href={buildPublicUrl('/')} className="hover:text-primary-600 transition-colors">← Zurück zur Website</a>
          {' · '}
          <a href={buildPublicUrl('/datenschutz')} className="hover:text-primary-600 transition-colors">Datenschutz</a>
          {' · '}
          <a href={buildPublicUrl('/impressum')} className="hover:text-primary-600 transition-colors">Impressum</a>
        </footer>
      </div>
    </div>
  );
}
