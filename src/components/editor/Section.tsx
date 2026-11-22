import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { IconChevron } from '../Icons';

interface SectionProps {
  title: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Section({ title, summary, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section className="border-b border-hairline">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-center gap-3 px-5 py-3.5 text-left sm:px-6"
        >
          <span className="text-[13px] font-semibold text-ink">{title}</span>
          {summary && <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">{summary}</span>}
          <IconChevron
            className={`ml-auto shrink-0 text-ink-faint transition-transform group-hover:text-ink ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>
      <div id={bodyId} hidden={!open} className="px-5 pb-5 sm:px-6">
        {children}
      </div>
    </section>
  );
}
