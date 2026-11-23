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

/** Title and description follow the language the person has chosen. */
export async function generateMetadata(): Promise<Metadata> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const welsh = stored === 'cy';
  return {
    title: {
      default: `${product.name}: ${welsh ? product.thesisCy : product.thesis}`,
      template: `${product.name}: %s`,
    },
    description: welsh ? product.metaDescriptionCy : product.metaDescription,
  };
}

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
