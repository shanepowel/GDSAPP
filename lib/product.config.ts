/**
 * Single source for product identity and the datum line.
 * Scoring and UI both read DATUM_LINE from here so the rule cannot drift.
 * Datum in this file is the 0.60 line, not the product name.
 */

export const product = {
  name: 'Assemble',
  owner: 'Turner & Townsend',
  thesis: 'the team is the delivery plan',
  strapline: 'Assemble the team, then prove it will pass.',
  metaDescription:
    'Assemble picks the right people for a public sector delivery, scores every role against what the work needs, and shows where a service assessment or gateway review would push back, before it does.',
  /** The datum. Below this, a role is not safely filled. */
  datumLine: 0.6,
} as const;

export const DATUM_LINE = product.datumLine;

export function formatDatumLine(value: number = DATUM_LINE): string {
  return value.toFixed(2);
}
