import type { Counters, Stage, StudioDoc } from '../types';
import { STAGE_META } from './constants';

export function formatDocNumber(stage: Stage, sequence: number, year = new Date().getFullYear()): string {
  return `${STAGE_META[stage].prefix}-${year}-${String(sequence).padStart(3, '0')}`;
}

/** Reserves the next sequence for a stage. Counters only ever move forward. */
export function reserveNumber(counters: Counters, stage: Stage): { number: string; counters: Counters } {
  const sequence = counters[stage] + 1;
  return { number: formatDocNumber(stage, sequence), counters: { ...counters, [stage]: sequence } };
}

function sequenceOf(number: string): number {
  const match = /-(\d+)$/.exec(number);
  return match ? Number(match[1]) : 0;
}

/** Ensures counters are never behind the highest number already in use. */
export function reconcileCounters(counters: Counters, docs: StudioDoc[]): Counters {
  const next: Counters = { ...counters };
  for (const doc of docs) {
    next[doc.stage] = Math.max(next[doc.stage], sequenceOf(doc.number));
  }
  return next;
}
