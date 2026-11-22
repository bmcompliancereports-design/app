import type {
  AccentKey,
  CurrencyCode,
  DiscountType,
  DocStatus,
  LineItem,
  Stage,
  StudioDoc,
  StudioState,
  TaxMode,
} from '../types';
import { ACCENTS, BACKUP_APP_ID, BACKUP_VERSION, CURRENCIES, STORAGE_KEY } from './constants';
import { isISODate, todayISO } from './dates';
import { uid } from './id';
import { reconcileCounters } from './numbering';

type Unknown = Record<string, unknown>;

const isObj = (v: unknown): v is Unknown => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  typeof v === 'string' && (options as readonly string[]).includes(v) ? (v as T) : fallback;

const STAGES: Stage[] = ['quote', 'invoice', 'receipt'];
const STATUSES: DocStatus[] = ['draft', 'sent', 'accepted', 'paid'];
const TAX_MODES: TaxMode[] = ['none', 'vat12', 'custom'];
const DISCOUNTS: DiscountType[] = ['flat', 'percent'];
const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];
const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

function sanitizeItem(raw: unknown): LineItem | null {
  if (!isObj(raw)) return null;
  return {
    id: str(raw.id) || uid(),
    description: str(raw.description),
    detail: str(raw.detail),
    qty: num(raw.qty, 1),
    rate: num(raw.rate, 0),
  };
}

function sanitizeDoc(raw: unknown): StudioDoc | null {
  if (!isObj(raw) || typeof raw.number !== 'string') return null;
  const stage = oneOf(raw.stage, STAGES, 'invoice');
  const sender = isObj(raw.sender) ? raw.sender : {};
  const client = isObj(raw.client) ? raw.client : {};
  const today = todayISO();
  const issueDate = isISODate(raw.issueDate) ? raw.issueDate : today;
  return {
    id: str(raw.id) || uid(),
    stage,
    number: raw.number,
    status: stage === 'receipt' ? 'paid' : oneOf(raw.status, STATUSES, 'draft'),
    issueDate,
    dueDate: isISODate(raw.dueDate) ? raw.dueDate : issueDate,
    paidDate: isISODate(raw.paidDate) ? raw.paidDate : null,
    currency: oneOf(raw.currency, CURRENCY_CODES, 'PHP'),
    sender: {
      name: str(sender.name),
      address: str(sender.address),
      email: str(sender.email),
      phone: str(sender.phone),
      logo: typeof sender.logo === 'string' && sender.logo.startsWith('data:image/') ? sender.logo : null,
    },
    client: { name: str(client.name), address: str(client.address), email: str(client.email) },
    items: Array.isArray(raw.items) ? raw.items.map(sanitizeItem).filter((i): i is LineItem => i !== null) : [],
    taxMode: oneOf(raw.taxMode, TAX_MODES, 'none'),
    customTaxRate: num(raw.customTaxRate),
    discountType: oneOf(raw.discountType, DISCOUNTS, 'flat'),
    discountValue: num(raw.discountValue),
    paymentInstructions: str(raw.paymentInstructions),
    notes: str(raw.notes),
    sourceId: typeof raw.sourceId === 'string' ? raw.sourceId : null,
    createdAt: num(raw.createdAt, Date.now()),
    updatedAt: num(raw.updatedAt, Date.now()),
  };
}

/** Validates any parsed JSON into a safe studio state, or returns null if it is unusable. */
export function sanitizeState(raw: unknown): StudioState | null {
  if (!isObj(raw) || !Array.isArray(raw.docs)) return null;
  const docs = raw.docs.map(sanitizeDoc).filter((d): d is StudioDoc => d !== null);
  if (docs.length === 0) return null;
  const settings = isObj(raw.settings) ? raw.settings : {};
  const rawCounters = isObj(raw.counters) ? raw.counters : {};
  const counters = reconcileCounters(
    { quote: num(rawCounters.quote), invoice: num(rawCounters.invoice), receipt: num(rawCounters.receipt) },
    docs,
  );
  const activeId = docs.some((d) => d.id === raw.activeId) ? (raw.activeId as string) : docs[0].id;
  return {
    docs,
    activeId,
    settings: { accent: oneOf(settings.accent, ACCENT_KEYS, 'navy') },
    counters,
  };
}

export function loadState(): StudioState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveState(state: StudioState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(state: StudioState): void {
  const payload = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paperledger-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readBackupFile(file: File): Promise<StudioState> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (isObj(parsed) && parsed.app !== undefined && parsed.app !== BACKUP_APP_ID) {
    throw new Error('That file is not a PaperLedger backup.');
  }
  const state = sanitizeState(parsed);
  if (!state) throw new Error('No documents were found in that backup.');
  return state;
}
