/**
 * Single source for product identity and the datum line.
 * Scoring and UI both read DATUM_LINE from here so the rule cannot drift.
 * Datum in this file is the 0.60 line, not the product name.
 */

export const product = {
  name: 'Assemble',
  owner: 'Turner & Townsend',
  thesis: 'how Turner & Townsend sets up, runs and assures delivery teams',
  thesisCy: 'sut mae Turner & Townsend yn sefydlu, yn rhedeg ac yn sicrhau timau cyflawni',
  metaDescriptionCy:
    'Mae Assemble yn eich helpu i staffio, sefydlu a sicrhau timau cyflawni, o’r cynnig i’r ôl-ofal, gyda thrylwyredd y sector cyhoeddus wedi’i gynnwys.',
  strapline: 'Assemble great delivery teams, then keep them great.',
  metaDescription:
    'Assemble helps you staff, set up and assure delivery teams, from bid to aftercare, with public sector rigour built in.',
  /** The datum. Below this, a role is not safely filled. */
  datumLine: 0.6,
} as const;

export const DATUM_LINE = product.datumLine;

export function formatDatumLine(value: number = DATUM_LINE): string {
  return value.toFixed(2);
}
