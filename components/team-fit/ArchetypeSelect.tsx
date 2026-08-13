'use client';

export type ArchetypeOption = {
  id: string;
  name: string;
  version: number;
};

export function ArchetypeSelect({
  label,
  value,
  options,
  onChange,
  loading = false,
  loadingLabel,
  id = 'archetype',
}: {
  label: string;
  value: string;
  options: ArchetypeOption[];
  onChange: (id: string) => void;
  loading?: boolean;
  loadingLabel?: string;
  id?: string;
}) {
  const selected = options.some((o) => o.id === value) ? value : '';

  return (
    <label className="block min-w-[16rem] max-w-[28rem] flex-1" htmlFor={id}>
      <span className="mb-1 block font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
        {label}
      </span>
      <span className="datum-select-wrap">
        <select
          id={id}
          className="datum-select"
          value={selected}
          aria-busy={loading || undefined}
          onChange={(e) => {
            const next = e.target.value;
            if (next) onChange(next);
          }}
        >
          {loading && options.length === 0 ? (
            <option value="" disabled>
              {loadingLabel ?? label}
            </option>
          ) : null}
          {!loading && options.length === 0 ? (
            <option value="" disabled>
              {label}
            </option>
          ) : null}
          {options.length > 0 && !selected ? (
            <option value="" disabled>
              {label}
            </option>
          ) : null}
          {options.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · v{a.version}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
