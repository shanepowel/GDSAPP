import { cloneElement, isValidElement, type InputHTMLAttributes, type ReactElement } from 'react';
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
      <label htmlFor={id} style={roleStyle('label', 'var(--ink)')}>
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

export function TextInput({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        minHeight: TARGET.control,
        paddingInline: 'var(--space-3)',
        paddingBlock: 'var(--space-2)',
        borderRadius: 'var(--radius)',
        border: 'var(--rule-w) solid var(--rule)',
        background: 'var(--raised)',
        color: 'var(--ink)',
        fontSize: 'var(--type-body-size)',
        fontFamily: 'var(--font-ui)',
        ...style,
      }}
    />
  );
}
