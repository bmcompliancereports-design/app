import type { CurrencyCode } from '../types';
import { CURRENCIES } from './constants';

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatAmount(value: number): string {
  return amountFormatter.format(roundMoney(value));
}

export function formatMoney(value: number, currency: CurrencyCode): string {
  const sign = value < 0 ? '−' : '';
  return `${sign}${CURRENCIES[currency].symbol}${formatAmount(Math.abs(value))}`;
}

export function formatQty(value: number): string {
  return Number.isInteger(value) ? String(value) : String(roundMoney(value));
}
