import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type PerfSample = {
  at: string;
  route: string;
  ok: boolean;
  latencyMs: number;
};

const DIR = join(process.cwd(), '.data');
const FILE = join(DIR, 'perf-samples.json');
const MAX = 200;

function readSamples(): PerfSample[] {
  try {
    if (!existsSync(FILE)) return [];
    return JSON.parse(readFileSync(FILE, 'utf8')) as PerfSample[];
  } catch {
    return [];
  }
}

function writeSamples(samples: PerfSample[]) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(samples.slice(-MAX), null, 2));
}

/** Record a dogfood sample for Point 10 / performance page. */
export function recordPerfSample(sample: Omit<PerfSample, 'at'> & { at?: string }) {
  const samples = readSamples();
  samples.push({ at: sample.at ?? new Date().toISOString(), ...sample });
  writeSamples(samples);
}

export function getPerfSummary() {
  const samples = readSamples();
  const last24h = samples.filter(
    (s) => Date.now() - new Date(s.at).getTime() < 24 * 60 * 60 * 1000,
  );
  const pool = last24h.length ? last24h : samples;
  const okCount = pool.filter((s) => s.ok).length;
  const latencies = pool.map((s) => s.latencyMs).sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.5)]! : null;
  const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)]! : null;
  return {
    sampleCount: pool.length,
    uptimePercent: pool.length ? Math.round((okCount / pool.length) * 1000) / 10 : null,
    p50Ms: p50,
    p95Ms: p95,
    recent: samples.slice(-12).reverse(),
  };
}
