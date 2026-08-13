import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { copy } from '@/lib/copy';
import { VIABILITY_THRESHOLD } from '@/lib/scoring/fit';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-sans',
  weight: ['400', '500', '600'],
});

const ibmPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-sans-condensed',
  weight: ['500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: `${copy.product.name} — ${copy.product.thesis}`,
  description: copy.product.strapline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${ibmPlexSans.variable} ${ibmPlexCondensed.variable} ${ibmPlexMono.variable}`}
      style={{ ['--viability' as string]: `${VIABILITY_THRESHOLD * 100}%` }}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
