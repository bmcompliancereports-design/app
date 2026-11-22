import type { ReactNode } from 'react';
import type { DocStatus } from '../types';
import { STATUS_LABEL } from '../lib/constants';
import type { BadgeTone } from '../lib/status';

const STATUS_TONE: Record<DocStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'accent',
  accepted: 'accent',
  paid: 'success',
};

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'border-hairline bg-canvas text-ink-soft',
  accent: 'border-accent/25 bg-accent/[0.06] text-accent',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const DOT_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-ink-faint',
  accent: 'bg-accent',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
  success: 'bg-emerald-600',
};

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${TONE_CLASS[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[tone]}`} />
      {children}
    </span>
  );
}

export function StatusPill({ status, className }: { status: DocStatus; className?: string }) {
  return (
    <Badge tone={STATUS_TONE[status]} className={className}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
