import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Assemble',
  description: 'Team readiness and service standard assessment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
