import {
  cloneElement,
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';
import { Stack } from '@/components/library/layout';
import { TARGET } from '@/components/library/sizing';
import { roleStyle } from '@/components/library/type';

type ControlProps = {
  id?: string;
  'aria-invalid'?: boolean | undefined;
  'aria-describedby'?: string | undefined;
};

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactElement<ControlProps>;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter((value): value is string => Boolean(value)).join(' ');

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })
    : children;

  return (
    <Stack gap={1}>
      <label htmlFor={id} style={{ ...roleStyle('label', 'var(--ink)'), fontWeight: 600 }}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} style={roleStyle('body', 'var(--graphite)')}>
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} role="alert" style={roleStyle('label', 'var(--verdict-not-met)')}>
          {error}
        </p>
      ) : null}
    </Stack>
  );
}

const CONTROL =
  'w-full rounded-asm border border-asm-line-strong bg-asm-surface px-3.5 py-2.5 text-asm-ink placeholder:text-asm-ink-3 aria-[invalid=true]:border-asm-risk';

/** Single-line input. Wrap in <Field>, which supplies id, label and described-by. */
export function TextInput({ style, className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(CONTROL, className)}
      style={{ minHeight: TARGET.control, fontSize: 'var(--type-body-size)', fontFamily: 'var(--font-ui)', ...style }}
    />
  );
}

/** Multi-line input. Wrap in <Field>. */
export function TextArea({ style, className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={cn(CONTROL, className)}
      style={{ fontSize: 'var(--type-body-size)', fontFamily: 'var(--font-ui)', ...style }}
    />
  );
}

/** Native select. Wrap in <Field>. */
export function SelectInput({ style, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(CONTROL, className)}
      style={{ minHeight: TARGET.control, fontSize: 'var(--type-body-size)', fontFamily: 'var(--font-ui)', ...style }}
    >
      {children}
    </select>
  );
}
