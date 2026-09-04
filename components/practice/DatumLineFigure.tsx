'use client';

import { fillCopy } from '@/lib/copy';
import { formatDatumLine } from '@/lib/product.config';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function DatumLineFigure() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const line = formatDatumLine();
  return (
    <section id="datum-line" className="datum-line-section">
      <h2 className="mb-2 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.datumLine.title}
      </h2>
      <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">
        {fillCopy(copy.datumLine.body, { line })}
      </p>
      <figure>
        <svg
          viewBox="0 0 320 88"
          className="datum-line-figure"
          role="img"
          aria-label={fillCopy(copy.datumLine.figureLabel, { line })}
        >
          <rect x="8" y="28" width="304" height="8" fill="var(--sunk)" />
          <rect x="8" y="28" width="182" height="8" fill="var(--navy)" />
          <rect x="190" y="20" width="2" height="24" fill="var(--blue)" />
          <text x="8" y="18" className="datum-fig-label">
            {copy.datumLine.below}
          </text>
          <text x="196" y="18" className="datum-fig-label">
            {copy.datumLine.above}
          </text>
          <text x="196" y="62" className="datum-fig-label">
            {fillCopy(copy.datumLine.why, { line })}
          </text>
        </svg>
      </figure>
    </section>
  );
}
