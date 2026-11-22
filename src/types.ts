export type Stage = 'quote' | 'invoice' | 'receipt';
export type DocStatus = 'draft' | 'sent' | 'accepted' | 'paid';
export type CurrencyCode = 'PHP' | 'USD' | 'EUR';
export type AccentKey = 'navy' | 'teal' | 'terracotta' | 'charcoal';
export type TaxMode = 'none' | 'vat12' | 'custom';
export type DiscountType = 'flat' | 'percent';

export interface Party {
  name: string;
  address: string;
  email: string;
}

export interface Sender extends Party {
  phone: string;
  logo: string | null;
}

export interface LineItem {
  id: string;
  description: string;
  detail: string;
  qty: number;
  rate: number;
}

export interface StudioDoc {
  id: string;
  stage: Stage;
  number: string;
  status: DocStatus;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  currency: CurrencyCode;
  sender: Sender;
  client: Party;
  items: LineItem[];
  taxMode: TaxMode;
  customTaxRate: number;
  discountType: DiscountType;
  discountValue: number;
  paymentInstructions: string;
  notes: string;
  sourceId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type Counters = Record<Stage, number>;

export interface Settings {
  accent: AccentKey;
}

export interface StudioState {
  docs: StudioDoc[];
  activeId: string;
  settings: Settings;
  counters: Counters;
}
