'use client';

type Req = { id: string; title: string; phase: string };

export function RequirementSelector({
  requirements,
  value,
  onChange,
}: {
  requirements: Req[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  if (requirements.length <= 1) return null;

  return (
    <label className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-text-muted">Requirement</span>
      <select
        className="rounded-md border border-border bg-surface px-3 py-1.5"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {requirements.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title} ({r.phase})
          </option>
        ))}
      </select>
    </label>
  );
}
