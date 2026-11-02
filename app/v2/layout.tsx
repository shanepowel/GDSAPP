import type { Metadata } from 'next';

/**
 * Assemble v2 (Agile WOW redesign). Public preview on demo data.
 * Not indexed until it replaces the live screens. See docs/redesign/README.md.
 */
export const metadata: Metadata = {
  title: { default: 'Assemble', template: 'Assemble: %s' },
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className="asm-root font-sans text-asm-ink">{children}</div>;
}
