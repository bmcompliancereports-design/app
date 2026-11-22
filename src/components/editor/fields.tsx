import { useEffect, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export const inputClass =
  'block w-full rounded-md border border-hairline bg-white px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint ' +
  'transition-colors hover:border-slate-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';

interface FieldShellProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ label, htmlFor, hint, className = '', children }: FieldShellProps) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">
          {label}
        </label>
        {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  wrapperClassName?: string;
};

export function TextField({ label, value, onChange, hint, wrapperClassName, className = '', ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} className={wrapperClassName}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wrapperClassName?: string;
};

export function TextArea({ label, value, onChange, wrapperClassName, rows = 3, ...rest }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} className={wrapperClassName}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-relaxed`}
        {...rest}
      />
    </FieldShell>
  );
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').trim();
  if (cleaned === '' || cleaned === '.' || cleaned === '-') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

/** Text-backed numeric input: keeps partial entries like "12." while typing and commits clean numbers. */
export function NumberInput({ value, onChange, min = 0, className = '', onBlur, ...rest }: NumberInputProps) {
  const [draft, setDraft] = useState(() => String(value));

  useEffect(() => {
    setDraft((current) => (parseNumber(current) === value ? current : String(value)));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        if (!/^-?[\d,]*\.?\d*$/.test(next)) return;
        setDraft(next);
        const parsed = parseNumber(next);
        if (parsed !== null) onChange(Math.max(min, parsed));
      }}
      onBlur={(e) => {
        setDraft(String(value));
        onBlur?.(e);
      }}
      className={`${inputClass} font-mono tabular-nums ${className}`}
      {...rest}
    />
  );
}

type NumberFieldProps = NumberInputProps & { label: string; hint?: ReactNode; wrapperClassName?: string };

export function NumberField({ label, hint, wrapperClassName, ...rest }: NumberFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} className={wrapperClassName}>
      <NumberInput id={id} {...rest} />
    </FieldShell>
  );
}

export function DateField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className={`${inputClass} font-mono tabular-nums`}
      />
    </FieldShell>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'md',
  className = '',
}: SegmentedProps<T>) {
  const pad = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]';
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`inline-flex rounded-md border border-hairline bg-canvas p-0.5 ${className}`}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={`flex-1 whitespace-nowrap rounded-[5px] font-medium transition-colors ${pad} ${
              selected ? 'bg-white text-ink shadow-[0_0_0_1px_#E2E8F0]' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
