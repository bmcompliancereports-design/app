import type { StudioDoc } from '../types';
import { daysBetween } from './dates';

export type BadgeTone = 'neutral' | 'accent' | 'warning' | 'danger' | 'success';

export interface DueBadge {
  label: string;
  tone: BadgeTone;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function isPaid(doc: StudioDoc): boolean {
  return doc.stage === 'receipt' || doc.status === 'paid';
}

export function getDueBadge(doc: StudioDoc, today: string): DueBadge {
  if (isPaid(doc)) return { label: 'Paid', tone: 'success' };

  const days = daysBetween(today, doc.dueDate);

  if (doc.stage === 'quote') {
    if (doc.status === 'accepted') return { label: 'Accepted', tone: 'success' };
    if (days < 0) return { label: 'Expired', tone: 'danger' };
    if (days === 0) return { label: 'Expires today', tone: 'warning' };
    return { label: `Valid for ${plural(days, 'day')}`, tone: days <= 3 ? 'warning' : 'neutral' };
  }

  if (days < 0) return { label: `Overdue by ${plural(-days, 'day')}`, tone: 'danger' };
  if (days === 0) return { label: 'Due today', tone: 'warning' };
  return { label: `Due in ${plural(days, 'day')}`, tone: days <= 3 ? 'warning' : 'accent' };
}

export function isOverdue(doc: StudioDoc, today: string): boolean {
  return doc.stage === 'invoice' && !isPaid(doc) && daysBetween(today, doc.dueDate) < 0;
}
