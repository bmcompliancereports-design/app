import type { Sender, StudioDoc, StudioState } from '../types';
import { addDays, todayISO } from './dates';
import { uid } from './id';

export const DEFAULT_SENDER: Sender = {
  name: 'Narra Digital Studio',
  address: '4/F Salcedo Tower, 169 H.V. dela Costa St.\nMakati City 1227, Philippines',
  email: 'hello@narradigital.studio',
  phone: '+63 917 555 0142',
  logo: null,
};

export const DEFAULT_PAYMENT_INSTRUCTIONS = [
  'Bank transfer — BPI · Narra Digital Studio Inc. · 3081-2245-67',
  'GCash — 0917 555 0142 · N. Reyes',
  'Wise (USD / EUR) — billing@narradigital.studio',
].join('\n');

function item(description: string, detail: string, qty: number, rate: number) {
  return { id: uid(), description, detail, qty, rate };
}

/** Three realistic, linked-looking documents dated relative to today so countdowns read naturally. */
export function createDemoState(): StudioState {
  const today = todayISO();
  const now = Date.now();

  const invoice: StudioDoc = {
    id: uid(),
    stage: 'invoice',
    number: 'INV-2026-014',
    status: 'sent',
    issueDate: addDays(today, -7),
    dueDate: addDays(today, 7),
    paidDate: null,
    currency: 'USD',
    sender: { ...DEFAULT_SENDER },
    client: {
      name: 'Harborline Coffee Roasters',
      address: '88 Pier Road, Port Area\nIloilo City 5000, Philippines',
      email: 'accounts@harborline.coffee',
    },
    items: [
      item('Brand Website Redesign', 'Six-page responsive site, CMS setup and launch support', 1, 4800),
      item('Offline Menu PWA Setup', 'Installable menu that works without signal, synced daily', 1, 2200),
      item('Staff Handover Guide', 'Written guide plus two recorded walkthroughs', 6, 120),
    ],
    taxMode: 'none',
    customTaxRate: 0,
    discountType: 'percent',
    discountValue: 5,
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    notes: 'Thank you for choosing Narra. A 5% returning-client discount has been applied.',
    sourceId: null,
    createdAt: now - 7 * 86_400_000,
    updatedAt: now - 2 * 3_600_000,
  };

  const quote: StudioDoc = {
    id: uid(),
    stage: 'quote',
    number: 'QT-2026-019',
    status: 'accepted',
    issueDate: addDays(today, -3),
    dueDate: addDays(today, 27),
    paidDate: null,
    currency: 'PHP',
    sender: { ...DEFAULT_SENDER },
    client: {
      name: 'Solstice Dental Clinic',
      address: '2F Verdana Commons, Alabang–Zapote Road\nMuntinlupa City 1780, Philippines',
      email: 'admin@solsticedental.ph',
    },
    items: [
      item('Patient Self-Service Portal — Discovery', 'Workshops, patient journey map and clickable prototype', 1, 85000),
      item('Portal Build', 'Online booking, visit history, e-receipts and reminders', 1, 240000),
      item('Hosting & Care Plan', 'Monthly hosting, backups and priority fixes', 12, 6500),
    ],
    taxMode: 'vat12',
    customTaxRate: 0,
    discountType: 'flat',
    discountValue: 0,
    paymentInstructions: '50% down payment to begin, 50% on launch.\n' + DEFAULT_PAYMENT_INSTRUCTIONS,
    notes: 'Quotation valid for 30 days. Timeline: 10 weeks from signed approval.',
    sourceId: null,
    createdAt: now - 3 * 86_400_000,
    updatedAt: now - 26 * 3_600_000,
  };

  const receipt: StudioDoc = {
    id: uid(),
    stage: 'receipt',
    number: 'OR-2026-008',
    status: 'paid',
    issueDate: addDays(today, -12),
    dueDate: addDays(today, -12),
    paidDate: addDays(today, -12),
    currency: 'PHP',
    sender: { ...DEFAULT_SENDER },
    client: {
      name: 'Kestrel Architecture Group',
      address: '11 Rizal Drive, Bonifacio Global City\nTaguig 1634, Philippines',
      email: 'finance@kestrel-arch.com',
    },
    items: [
      item('Project Portfolio Website', 'Case-study templates and image-led project archive', 1, 120000),
      item('Photography Retouching', 'Per image, colour-matched for web and print', 24, 1200),
    ],
    taxMode: 'vat12',
    customTaxRate: 0,
    discountType: 'flat',
    discountValue: 0,
    paymentInstructions: 'BPI bank transfer · Ref. KAG-55120',
    notes: 'Received in full. Thank you for your business.',
    sourceId: null,
    createdAt: now - 12 * 86_400_000,
    updatedAt: now - 12 * 86_400_000,
  };

  return {
    docs: [invoice, quote, receipt],
    activeId: invoice.id,
    settings: { accent: 'navy' },
    counters: { quote: 19, invoice: 14, receipt: 8 },
  };
}
