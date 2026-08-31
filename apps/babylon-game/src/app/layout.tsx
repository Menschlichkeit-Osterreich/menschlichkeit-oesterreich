import type { Metadata } from 'next';
import { Familjen_Grotesk, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-familjen-grotesk',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
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
    <html
      lang="de-AT"
      className={`${familjenGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <a
          href="#game-canvas"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-moe-ink-tief focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-moe-paper"
        >
          Zum Spiel springen
        </a>
        {children}
      </body>
    </html>
  );
}
