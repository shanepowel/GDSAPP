import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Public_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { htmlLang, isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = stored && isLocale(stored) ? stored : 'en';
  return (
    <html
      lang={htmlLang[locale]}
      className={publicSans.variable}
      style={{ ['--viability' as string]: `${DATUM_LINE * 100}%` }}
    >
      <body className={`${publicSans.className} antialiased`}>
        <Providers initialLocale={locale}>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
