'use client';

type Props = {
  id?: string;
  name?: string;
  label?: string;
  /** Accessible name when the visible label is not enough (e.g. a row of people). */
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function DatumSelect({
  id,
  name,
  label,
  ariaLabel,
  value,
  onChange,
  disabled,
  children,
  className,
}: Props) {
  const select = (
    <span className="datum-select-wrap min-w-[12rem]">
      <select
        id={id}
        name={name}
        className="datum-select"
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </span>
  );

  if (!label) return <div className={className}>{select}</div>;

  return (
    <label className={className} htmlFor={id}>
      <span className="mb-1 block font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
        {label}
      </span>
      {select}
    </label>
  );
}
