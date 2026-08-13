import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RETIRED_STRINGS } from '@/lib/copy';

const ROOTS = ['app', 'components', 'lib'];
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.md']);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if ([...TEXT_EXT].some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
}

describe('retired marketing phrases', () => {
  it('do not appear outside RETIRED_STRINGS in lib/copy.ts', () => {
    const files = ROOTS.flatMap((r) => walk(join(process.cwd(), r)));
    const hits: string[] = [];
    for (const file of files) {
      const rel = relative(process.cwd(), file);
      if (rel === 'lib/copy.ts') continue;
      const src = readFileSync(file, 'utf8');
      for (const phrase of RETIRED_STRINGS) {
        if (src.includes(phrase)) hits.push(`${rel}: ${phrase}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
