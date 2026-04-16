import type { Metadata } from 'next';
import { Nunito_Sans, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const nunitoSans = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Brücken Bauen - Demokratiespiel | Menschlichkeit Österreich',
  description:
    'Verein Menschlichkeit Österreich — Demokratie, Menschenrechte, soziale Gerechtigkeit und gesellschaftlicher Zusammenhalt.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-AT" className={`${nunitoSans.variable} ${sourceSans3.variable}`}>
      <body>
        <a
          href="#game-canvas"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-orange-500 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
        >
          Zum Spiel springen
        </a>
        {children}
      </body>
    </html>
  );
}
