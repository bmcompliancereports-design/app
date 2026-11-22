import type { DiscountType, StudioDoc, TaxMode } from '../../types';
import { computeTotals } from '../../lib/calc';
import { CURRENCIES } from '../../lib/constants';
import { formatMoney } from '../../lib/money';
import type { StudioActions } from '../../state/studio';
import { NumberField, Segmented } from './fields';
import { Section } from './Section';

interface Props {
  doc: StudioDoc;
  actions: StudioActions;
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? 'border-t border-hairline pt-2.5' : ''}`}>
      <dt className={strong ? 'text-[13px] font-semibold text-ink' : 'text-[12px] text-ink-soft'}>{label}</dt>
      <dd className={`font-mono tabular-nums ${strong ? 'text-[15px] font-medium text-ink' : 'text-[13px] text-ink'}`}>{value}</dd>
    </div>
  );
}

export function TotalsSection({ doc, actions }: Props) {
  const totals = computeTotals(doc);
  const patch = (p: Partial<StudioDoc>) => actions.patch(doc.id, p);
  const money = (n: number) => formatMoney(n, doc.currency);

  return (
    <Section title="Tax & discount" summary={`Total ${money(totals.total)}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">Tax / VAT</span>
          <Segmented<TaxMode>
            ariaLabel="Tax rate"
            value={doc.taxMode}
            onChange={(taxMode) => patch({ taxMode })}
            className="w-full"
            options={[
              { value: 'none', label: '0%' },
              { value: 'vat12', label: '12% VAT' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
          {doc.taxMode === 'custom' && (
            <NumberField
              label="Custom rate (%)"
              wrapperClassName="mt-3"
              value={doc.customTaxRate}
              onChange={(customTaxRate) => patch({ customTaxRate: Math.min(100, customTaxRate) })}
            />
          )}
        </div>
        <div>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">Discount</span>
          <Segmented<DiscountType>
            ariaLabel="Discount type"
            value={doc.discountType}
            onChange={(discountType) => patch({ discountType })}
            className="w-full"
            options={[
              { value: 'flat', label: `Flat ${CURRENCIES[doc.currency].symbol}` },
              { value: 'percent', label: 'Percent %' },
            ]}
          />
          <NumberField
            label={doc.discountType === 'percent' ? 'Discount (%)' : `Discount (${doc.currency})`}
            wrapperClassName="mt-3"
            value={doc.discountValue}
            onChange={(discountValue) =>
              patch({ discountValue: doc.discountType === 'percent' ? Math.min(100, discountValue) : discountValue })
            }
          />
        </div>
      </div>

      <dl className="mt-5 space-y-1.5 rounded-lg bg-canvas px-4 py-3">
        <Row label="Subtotal" value={money(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Discount" value={`−${money(totals.discount)}`} />}
        {totals.taxRate > 0 && <Row label={`Tax (${totals.taxRate}%)`} value={money(totals.tax)} />}
        <Row label="Grand total" value={money(totals.total)} strong />
      </dl>
    </Section>
  );
}
