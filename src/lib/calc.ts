import type { LineItem, StudioDoc } from '../types';
import { VAT_RATE } from './constants';
import { roundMoney } from './money';

export interface Totals {
  subtotal: number;
  discount: number;
  taxable: number;
  taxRate: number;
  tax: number;
  total: number;
}

export function lineTotal(item: LineItem): number {
  return roundMoney((Number(item.qty) || 0) * (Number(item.rate) || 0));
}

export function effectiveTaxRate(doc: Pick<StudioDoc, 'taxMode' | 'customTaxRate'>): number {
  if (doc.taxMode === 'vat12') return VAT_RATE;
  if (doc.taxMode === 'custom') return Math.max(0, Number(doc.customTaxRate) || 0);
  return 0;
}

export function computeTotals(doc: StudioDoc): Totals {
  const subtotal = roundMoney(doc.items.reduce((sum, item) => sum + lineTotal(item), 0));
  const rawDiscount =
    doc.discountType === 'percent'
      ? (subtotal * Math.min(100, Math.max(0, doc.discountValue || 0))) / 100
      : Math.max(0, doc.discountValue || 0);
  const discount = roundMoney(Math.min(subtotal, rawDiscount));
  const taxable = roundMoney(subtotal - discount);
  const taxRate = effectiveTaxRate(doc);
  const tax = roundMoney((taxable * taxRate) / 100);
  return { subtotal, discount, taxable, taxRate, tax, total: roundMoney(taxable + tax) };
}
