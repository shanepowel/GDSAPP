import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { product, DATUM_LINE } from '@/lib/product.config';

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: `${product.name}: ${product.thesis}`,
    template: `${product.name}: %s`,
  },
  description: product.metaDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={publicSans.variable}
      style={{ ['--viability' as string]: `${DATUM_LINE * 100}%` }}
    >
      <body className={`${publicSans.className} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
