import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { product, DATUM_LINE } from '@/lib/product.config';

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
  title: `${product.name}: ${product.thesis}`,
  description: product.metaDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${ibmPlexSans.variable} ${ibmPlexCondensed.variable} ${ibmPlexMono.variable}`}
      style={{ ['--viability' as string]: `${DATUM_LINE * 100}%` }}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
