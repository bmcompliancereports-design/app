import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import type { StudioDoc } from '../../types';
import { computeTotals, lineTotal } from '../../lib/calc';
import { STAGE_META, STATUS_LABEL } from '../../lib/constants';
import { formatDate, todayISO } from '../../lib/dates';
import { formatMoney, formatQty } from '../../lib/money';
import { getDueBadge, isPaid } from '../../lib/status';

interface Props {
  doc: StudioDoc;
  sourceNumber?: string;
}

function Lines({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  if (lines.length === 0) return null;
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{children}</p>;
}

export const DocumentPaper = forwardRef<HTMLElement, Props>(function DocumentPaper({ doc, sourceNumber }, ref) {
  const meta = STAGE_META[doc.stage];
  const totals = computeTotals(doc);
  const money = (n: number) => formatMoney(n, doc.currency);
  const paid = isPaid(doc);
  const badge = getDueBadge(doc, todayISO());
  const status = doc.stage === 'receipt' ? 'paid' : doc.status;
  const items = doc.items.filter((i) => i.description.trim() || i.rate || i.detail.trim());
  const contact = [doc.sender.email, doc.sender.phone].filter(Boolean).join('  ·  ');

  const dateBlock =
    doc.stage === 'receipt'
      ? { label: meta.dateLabel, value: formatDate(doc.paidDate ?? doc.issueDate) }
      : doc.stage === 'invoice' && paid
        ? { label: 'Paid on', value: formatDate(doc.paidDate) }
        : { label: meta.dateLabel, value: formatDate(doc.dueDate) };

  return (
    <article
      ref={ref}
      className="paper relative flex flex-col overflow-hidden bg-white text-ink"
      style={{ width: '210mm', minHeight: '297mm' }}
      aria-label={`${meta.label} ${doc.number}`}
    >
      <div className="h-[4px] w-full shrink-0 bg-accent" />

      <div className="flex flex-1 flex-col px-[18mm] pb-[14mm] pt-[14mm]">
        {/* Header */}
        <header className="flex items-start justify-between gap-10">
          <div className="min-w-0 max-w-[92mm]">
            {doc.sender.logo && (
              <img src={doc.sender.logo} alt="" className="mb-4 max-h-[14mm] max-w-[48mm] object-contain object-left" />
            )}
            <p className="font-serif text-[22px] leading-tight text-ink">{doc.sender.name || 'Your business'}</p>
            <Lines text={doc.sender.address} className="mt-1.5 text-[10.5px] leading-[1.55] text-ink-soft" />
            {contact && <p className="mt-1 text-[10.5px] leading-[1.55] text-ink-soft">{contact}</p>}
          </div>
          <div className="shrink-0 text-right">
            <h1 className="font-serif text-[40px] leading-none tracking-[-0.01em] text-accent">{meta.label}</h1>
            <p className="mt-2.5 font-mono text-[12px] tabular-nums text-ink">{doc.number}</p>
            <div className="mt-2.5 flex justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.06] px-2.5 py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.12em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {STATUS_LABEL[status]}
              </span>
            </div>
          </div>
        </header>

        {/* Meta */}
        <section className="mt-[11mm] grid grid-cols-[1.6fr_1fr_1fr] gap-8 border-y border-hairline py-5">
          <div className="min-w-0">
            <Label>{meta.partyLabel}</Label>
            <p className="text-[12.5px] font-semibold leading-snug text-ink">{doc.client.name || 'Client name'}</p>
            <Lines text={doc.client.address} className="mt-1 text-[10.5px] leading-[1.55] text-ink-soft" />
            {doc.client.email && <p className="mt-0.5 text-[10.5px] leading-[1.55] text-ink-soft">{doc.client.email}</p>}
          </div>
          <div>
            <Label>Issue date</Label>
            <p className="font-mono text-[11.5px] tabular-nums text-ink">{formatDate(doc.issueDate)}</p>
            {sourceNumber && (
              <>
                <div className="h-3.5" />
                <Label>Reference</Label>
                <p className="font-mono text-[11.5px] tabular-nums text-ink">{sourceNumber}</p>
              </>
            )}
          </div>
          <div>
            <Label>{dateBlock.label}</Label>
            <p className="font-mono text-[11.5px] tabular-nums text-ink">{dateBlock.value}</p>
            {!paid && (
              <p
                className={`mt-1 text-[10px] font-medium ${
                  badge.tone === 'danger' ? 'text-red-700' : badge.tone === 'warning' ? 'text-amber-700' : 'text-ink-soft'
                }`}
              >
                {badge.label}
              </p>
            )}
          </div>
        </section>

        {/* Amount banner */}
        <section className="mt-6 flex items-end justify-between">
          <p className="text-[10.5px] text-ink-soft">
            {doc.stage === 'quote'
              ? 'Prices below are fixed for the validity period.'
              : doc.stage === 'invoice'
                ? 'Please quote the invoice number with your payment.'
                : 'This receipt confirms payment in full.'}
          </p>
          <div className="text-right">
            <Label>{meta.totalLabel}</Label>
            <p className="font-mono text-[26px] font-medium leading-none tabular-nums tracking-[-0.02em] text-ink">
              {money(paid && doc.stage === 'invoice' ? 0 : totals.total)}
            </p>
          </div>
        </section>

        {/* Items */}
        <table className="mt-7 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-[1.5px] border-accent">
              <th className="w-[52%] pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">Description</th>
              <th className="pb-2 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">Qty</th>
              <th className="pb-2 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">Rate</th>
              <th className="pb-2 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className="break-inside-avoid border-b border-hairline align-top">
                <td className="py-3 pr-6">
                  <div className="flex gap-3">
                    <span className="pt-[1px] font-mono text-[10px] tabular-nums text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-[11.5px] font-medium leading-snug text-ink">{item.description || 'Untitled item'}</p>
                      {item.detail && <p className="mt-0.5 text-[10px] leading-snug text-ink-soft">{item.detail}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right font-mono text-[11px] tabular-nums text-ink">{formatQty(item.qty)}</td>
                <td className="py-3 pl-4 text-right font-mono text-[11px] tabular-nums text-ink">{money(item.rate)}</td>
                <td className="py-3 pl-4 text-right font-mono text-[11px] tabular-nums text-ink">{money(lineTotal(item))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr className="border-b border-hairline">
                <td colSpan={4} className="py-6 text-center text-[11px] text-ink-faint">
                  Line items will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <section className="mt-5 flex break-inside-avoid items-start justify-between gap-8">
          <div className="pl-[6mm] pt-3">
            {paid && (
              <div
                aria-hidden="true"
                className="inline-block rotate-[-8deg] rounded-md border-[2.5px] border-accent px-5 py-2 text-center text-accent opacity-80 mix-blend-multiply"
              >
                <p className="font-serif text-[40px] uppercase leading-none tracking-[0.12em]">Paid</p>
                <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em]">
                  {formatDate(doc.paidDate ?? doc.issueDate)}
                </p>
              </div>
            )}
          </div>
          <dl className="w-[78mm] space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-mono tabular-nums">{money(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">
                  Discount{doc.discountType === 'percent' ? ` (${doc.discountValue}%)` : ''}
                </dt>
                <dd className="font-mono tabular-nums">−{money(totals.discount)}</dd>
              </div>
            )}
            {totals.taxRate > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">{doc.taxMode === 'vat12' ? 'VAT' : 'Tax'} ({totals.taxRate}%)</dt>
                <dd className="font-mono tabular-nums">{money(totals.tax)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-ink pt-2.5">
              <dt className="text-[11.5px] font-semibold">Total ({doc.currency})</dt>
              <dd className="font-mono text-[14px] font-medium tabular-nums">{money(totals.total)}</dd>
            </div>
            {doc.stage === 'invoice' && paid && (
              <div className="flex justify-between text-accent">
                <dt>Paid</dt>
                <dd className="font-mono tabular-nums">−{money(totals.total)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Payment & notes */}
        {(doc.paymentInstructions.trim() || doc.notes.trim()) && (
          <section className="mt-10 grid break-inside-avoid grid-cols-2 gap-10">
            <div>
              {doc.paymentInstructions.trim() && (
                <>
                  <Label>{meta.paymentLabel}</Label>
                  <Lines text={doc.paymentInstructions} className="space-y-0.5 text-[10.5px] leading-[1.6] text-ink" />
                </>
              )}
            </div>
            <div>
              {doc.notes.trim() && (
                <>
                  <Label>Notes</Label>
                  <Lines text={doc.notes} className="text-[10.5px] leading-[1.6] text-ink-soft" />
                </>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-auto flex items-center justify-between border-t border-hairline pt-4 text-[9px] text-ink-faint">
          <span>{doc.sender.name}</span>
          <span className="font-mono tabular-nums">
            {doc.number} · {formatDate(doc.issueDate)}
          </span>
        </footer>
      </div>

    </article>
  );
});
