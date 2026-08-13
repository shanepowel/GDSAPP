import { CAPACITY_SPLIT } from '@/lib/playbook/keel';
import {
  WALKTHROUGH_DEMAND,
  WALKTHROUGH_PEOPLE,
  longestRun,
  type WalkthroughPerson,
} from '@/lib/teach/walkthrough';

const MONO = 'var(--font-data), ui-monospace, monospace';
const COND = 'var(--font-cond), sans-serif';

export function FigureFrame({
  id,
  caption,
  children,
}: {
  id?: string;
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure id={id} className="teach-figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Figure 1. The same five people, arranged two ways. */
export function EmpoweredFigure({ label }: { label: string }) {
  const mk = (ox: number, title: string, sub: string, mode: 'one' | 'many') => {
    const people = [0, 1, 2, 3, 4]
      .map((i) => {
        const x = ox + 22 + i * 42;
        return `<circle cx="${x}" cy="86" r="13" fill="${mode === 'one' ? 'var(--ink)' : 'none'}" stroke="var(--ink)"/>`;
      })
      .join('');
    const links =
      mode === 'one'
        ? `<rect x="${ox + 6}" y="62" width="222" height="48" fill="none" stroke="var(--datum)" stroke-width="1.5"/>
           <text x="${ox + 117}" y="128" text-anchor="middle" font-family="${MONO}" font-size="9" fill="var(--datum)">one team, one problem, decides for itself</text>`
        : [0, 1, 2, 3, 4]
            .map(
              (i) =>
                `<line x1="${ox + 22 + i * 42}" y1="73" x2="${ox + 22 + i * 42}" y2="40" stroke="var(--survey)" stroke-dasharray="3 3"/>
                 <rect x="${ox + 8 + i * 42}" y="22" width="28" height="18" fill="none" stroke="var(--survey)"/>`,
            )
            .join('') +
          `<text x="${ox + 117}" y="128" text-anchor="middle" font-family="${MONO}" font-size="9" fill="var(--survey)">five people, five managers, nobody decides</text>`;
    return `<text x="${ox + 6}" y="12" font-family="${COND}" font-size="13" font-weight="600">${title}</text>
      <text x="${ox + 6}" y="54" font-family="${MONO}" font-size="9" fill="var(--graphite)">${sub}</text>${links}${people}`;
  };

  return (
    <svg
      viewBox="0 0 520 142"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{
        __html: `${mk(0, 'Empowered', 'every skill needed is inside the team', 'one')}${mk(272, 'Matrixed', 'skills borrowed, decisions escalated', 'many')}`,
      }}
    />
  );
}

/** Figure 2. Delivery clock with gates. */
export function LifecycleFigure({ label }: { label: string }) {
  const phases: Array<[string, string, string]> = [
    ['Discovery', '6 to 10 weeks', 'Gate 1'],
    ['Alpha', '8 to 12 weeks', 'Gate 2'],
    ['Beta', '3 to 9 months', 'Gate 3'],
    ['Live', 'continuous', 'Gate 4'],
  ];
  const w = 620;
  const cw = w / 4;
  const seg = phases
    .map((p, i) => {
      const x = i * cw;
      const active = i === 0;
      return `<rect x="${x + 2}" y="20" width="${cw - 6}" height="30" fill="${active ? 'var(--ink)' : 'none'}" stroke="${active ? 'var(--ink)' : 'var(--rule)'}"/>
      <text x="${x + cw / 2}" y="39" text-anchor="middle" font-family="${COND}" font-size="13" font-weight="600" fill="${active ? 'var(--raised)' : 'var(--ink)'}">${p[0]}</text>
      <text x="${x + cw / 2}" y="64" text-anchor="middle" font-family="${MONO}" font-size="9" fill="var(--graphite)">${p[1]}</text>
      <line x1="${x + cw - 4}" y1="74" x2="${x + cw - 4}" y2="90" stroke="var(--datum)"/>
      <text x="${x + cw - 8}" y="102" text-anchor="end" font-family="${MONO}" font-size="9" fill="var(--datum)">${p[2]}</text>`;
    })
    .join('');

  return (
    <svg
      viewBox={`0 0 ${w} 112`}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{
        __html: `<text x="0" y="12" font-family="${MONO}" font-size="9" fill="var(--graphite)">DELIVERY CLOCK</text>${seg}`,
      }}
    />
  );
}

/** Figure 3. 70 / 20 / 10 capacity split. */
export function CapacityFigure({ label }: { label: string }) {
  const w = 560;
  const y = 14;
  const parts: Array<[string, number, string]> = [
    ['Committed delivery', CAPACITY_SPLIT.committed * 100, 'var(--ink)'],
    ['Discretionary', CAPACITY_SPLIT.discretionary * 100, 'var(--datum)'],
    ['Slack', CAPACITY_SPLIT.slack * 100, 'var(--sunk)'],
  ];
  let x = 0;
  const bars = parts
    .map(([l, pc, c]) => {
      const bw = (w * pc) / 100;
      const el = `<rect x="${x}" y="${y}" width="${bw - 2}" height="22" fill="${c}" ${c === 'var(--sunk)' ? 'stroke="var(--rule)"' : ''}/>
      <text x="${x + 4}" y="${y + 37}" font-family="${MONO}" font-size="9" fill="var(--graphite)">${pc}% ${l}</text>`;
      x += bw;
      return el;
    })
    .join('');

  return (
    <svg
      viewBox={`0 0 ${w} 66`}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: bars }}
    />
  );
}

/** Figure 4. Continuity — The Keel made visible. */
export function ContinuityFigure({
  label,
  people = WALKTHROUGH_PEOPLE,
}: {
  label: string;
  people?: WalkthroughPerson[];
}) {
  const w = 560;
  const x0 = 150;
  const colw = (w - x0 - 20) / 4;
  const heads = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']
    .map(
      (h, i) =>
        `<text x="${x0 + colw * i + colw / 2}" y="16" text-anchor="middle" font-family="${MONO}" font-size="9" fill="var(--graphite)">${h}</text>`,
    )
    .join('');
  const rows = people
    .map((p, i) => {
      const y = 32 + i * 26;
      const bars = p.phases
        .map((on, j) =>
          on
            ? `<rect x="${x0 + colw * j + 2}" y="${y}" width="${colw - 4}" height="13" fill="var(--ink)"/>`
            : `<rect x="${x0 + colw * j + 2}" y="${y}" width="${colw - 4}" height="13" fill="none" stroke="var(--rule)" stroke-dasharray="3 3"/>`,
        )
        .join('');
      const run = longestRun(p.phases);
      const tag = run >= 3 ? 'stable' : run === 2 ? '' : 'fragmented';
      return `<text x="0" y="${y + 11}" font-family="${MONO}" font-size="10" fill="var(--ink)">${p.name}</text>${bars}
        <text x="${w - 14}" y="${y + 11}" text-anchor="end" font-family="${MONO}" font-size="9" fill="${tag === 'fragmented' ? 'var(--survey)' : 'var(--graphite)'}">${tag}</text>`;
    })
    .join('');

  return (
    <svg
      viewBox={`0 0 ${w} ${32 + people.length * 26 + 6}`}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: `${heads}${rows}` }}
    />
  );
}

export type SquadShapeNode = {
  title: string;
  fte: number;
  label: string;
  state: 'open' | 'ok' | 'weak';
};

/** Figure 5. Circle size is FTE. Dashed is empty. Amber is below the datum. */
export function SquadShapeFigure({ label, nodes }: { label: string; nodes: SquadShapeNode[] }) {
  const cx = [90, 235, 380, 525, 140, 310, 470];
  const cy = [70, 70, 70, 70, 175, 175, 175];
  const drawn = nodes
    .map((r, i) => {
      const rad = 18 + r.fte * 20;
      const open = r.state === 'open';
      const weak = r.state === 'weak';
      const fill = open ? 'none' : weak ? 'var(--sunk)' : 'var(--ink)';
      const stroke = open ? 'var(--survey)' : weak ? 'var(--amber)' : 'var(--ink)';
      const txt = open || weak ? 'var(--ink)' : 'var(--raised)';
      const shortTitle = r.title.replace('Lead ', '');
      return `<g>
        <circle cx="${cx[i]}" cy="${cy[i]}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${open ? 1.5 : 1}" ${open ? 'stroke-dasharray="4 3"' : ''}/>
        <text x="${cx[i]}" y="${cy[i] + 4}" text-anchor="middle" font-family="${MONO}" font-size="10" fill="${txt}">${r.label}</text>
        <text x="${cx[i]}" y="${cy[i] + rad + 14}" text-anchor="middle" font-family="${MONO}" font-size="9" fill="var(--graphite)">${shortTitle}</text>
        <text x="${cx[i]}" y="${cy[i] + rad + 25}" text-anchor="middle" font-family="${MONO}" font-size="9" fill="var(--graphite)">${r.fte.toFixed(1)} FTE</text>
      </g>`;
    })
    .join('');

  return (
    <svg
      viewBox="0 0 620 250"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: drawn }}
    />
  );
}

/** Figure 6. Demand against capability held. */
export function DemandFigure({ label }: { label: string }) {
  const w = 560;
  const x0 = 180;
  const max = 3.2;
  const sc = (w - x0 - 40) / max;
  const bars = WALKTHROUGH_DEMAND.map((r, i) => {
    const y = 18 + i * 32;
    return `<text x="0" y="${y + 10}" font-family="${MONO}" font-size="10">${r.role}</text>
    <rect x="${x0}" y="${y}" width="${r.need * sc}" height="6" fill="var(--survey)"/>
    <rect x="${x0}" y="${y + 8}" width="${r.hold * sc}" height="6" fill="var(--ink)"/>
    <text x="${x0 + Math.max(r.need, r.hold) * sc + 6}" y="${y + 11}" font-family="${MONO}" font-size="9" fill="var(--graphite)">need ${r.need.toFixed(1)} · hold ${r.hold.toFixed(1)}</text>`;
  }).join('');

  return (
    <svg
      viewBox={`0 0 ${w} ${18 + WALKTHROUGH_DEMAND.length * 32}`}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: bars }}
    />
  );
}
