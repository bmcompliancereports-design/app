import type { AccentKey, CurrencyCode, DocStatus, Stage } from '../types';

export interface StageMeta {
  label: string;
  short: string;
  prefix: string;
  dateLabel: string;
  totalLabel: string;
  partyLabel: string;
  paymentLabel: string;
  statuses: DocStatus[];
  next: Stage | null;
}

export const STAGE_ORDER: Stage[] = ['quote', 'invoice', 'receipt'];

export const STAGE_META: Record<Stage, StageMeta> = {
  quote: {
    label: 'Quotation',
    short: 'Quote',
    prefix: 'QT',
    dateLabel: 'Valid until',
    totalLabel: 'Quotation total',
    partyLabel: 'Prepared for',
    paymentLabel: 'Payment terms',
    statuses: ['draft', 'sent', 'accepted'],
    next: 'invoice',
  },
  invoice: {
    label: 'Invoice',
    short: 'Invoice',
    prefix: 'INV',
    dateLabel: 'Due date',
    totalLabel: 'Amount due',
    partyLabel: 'Billed to',
    paymentLabel: 'How to pay',
    statuses: ['draft', 'sent', 'paid'],
    next: 'receipt',
  },
  receipt: {
    label: 'Official Receipt',
    short: 'Receipt',
    prefix: 'OR',
    dateLabel: 'Payment date',
    totalLabel: 'Amount received',
    partyLabel: 'Received from',
    paymentLabel: 'Payment received via',
    statuses: ['paid'],
    next: null,
  },
};

export const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  paid: 'Paid',
};

export interface AccentMeta {
  label: string;
  hex: string;
  rgb: string;
}

export const ACCENTS: Record<AccentKey, AccentMeta> = {
  navy: { label: 'Deep Navy', hex: '#0F2D59', rgb: '15 45 89' },
  teal: { label: 'Deep Teal', hex: '#0F766E', rgb: '15 118 110' },
  terracotta: { label: 'Terracotta', hex: '#9A3412', rgb: '154 52 18' },
  charcoal: { label: 'Charcoal', hex: '#18181B', rgb: '24 24 27' },
};

export const ACCENT_ORDER: AccentKey[] = ['navy', 'teal', 'terracotta', 'charcoal'];

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  PHP: { code: 'PHP', symbol: '₱' },
  USD: { code: 'USD', symbol: '$' },
  EUR: { code: 'EUR', symbol: '€' },
};

export const CURRENCY_ORDER: CurrencyCode[] = ['PHP', 'USD', 'EUR'];

export const VAT_RATE = 12;
export const STORAGE_KEY = 'paperledger:studio:v1';
export const BACKUP_APP_ID = 'paperledger';
export const BACKUP_VERSION = 1;
