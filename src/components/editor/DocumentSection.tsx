import type { DocStatus, StudioDoc } from '../../types';
import { STAGE_META, STAGE_ORDER, STATUS_LABEL } from '../../lib/constants';
import { formatDate, todayISO } from '../../lib/dates';
import { getLineage } from '../../lib/lineage';
import { getDueBadge } from '../../lib/status';
import type { StudioActions } from '../../state/studio';
import { Badge } from '../StatusPill';
import { IconArrowRight, IconCheck } from '../Icons';
import { DateField, Segmented, TextField } from './fields';
import { Section } from './Section';

interface Props {
  doc: StudioDoc;
  docs: StudioDoc[];
  actions: StudioActions;
}

export function DocumentSection({ doc, docs, actions }: Props) {
  const meta = STAGE_META[doc.stage];
  const today = todayISO();
  const badge = getDueBadge(doc, today);
  const lineage = getLineage(docs, doc);
  const patch = (p: Partial<StudioDoc>) => actions.patch(doc.id, p);

  const setStatus = (status: DocStatus) => {
    if (status === 'paid') patch({ status, paidDate: doc.paidDate ?? today });
    else patch({ status, paidDate: null });
  };

  return (
    <Section title="Document" summary={`${meta.label} · ${doc.number}`}>
      <ol className="mb-5 grid grid-cols-3 gap-1.5" aria-label="Document lifecycle">
        {STAGE_ORDER.map((stage, index) => {
          const linked = lineage[stage];
          const current = stage === doc.stage;
          const done = Boolean(linked) && !current;
          return (
            <li key={stage}>
              <button
                type="button"
                disabled={!linked || current}
                onClick={() => linked && actions.select(linked.id)}
                aria-current={current ? 'step' : undefined}
                className={`w-full rounded-md border px-2.5 py-2 text-left transition-colors ${
                  current
                    ? 'border-accent bg-accent/[0.05]'
                    : done
                      ? 'border-hairline bg-white hover:border-slate-300'
                      : 'border-dashed border-hairline bg-white'
                }`}
              >
                <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  {done ? <IconCheck width={12} height={12} className="text-accent" /> : <span className="font-mono">0{index + 1}</span>}
                  {STAGE_META[stage].short}
                </span>
                <span className={`mt-0.5 block truncate font-mono text-[11px] ${linked ? 'text-ink' : 'text-ink-faint'}`}>
                  {linked ? linked.number : 'Not issued'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {meta.next && (
        <button
          type="button"
          onClick={() => actions.promote(doc.id)}
          className="mb-5 flex w-full items-center justify-between rounded-md border border-hairline bg-canvas px-3 py-2.5 text-left text-[13px] transition-colors hover:border-accent/40"
        >
          <span>
            <span className="font-medium text-ink">
              {lineage[meta.next] ? `Open ${STAGE_META[meta.next].label.toLowerCase()}` : `Convert to ${STAGE_META[meta.next].label.toLowerCase()}`}
            </span>
            <span className="block text-[12px] text-ink-soft">
              {lineage[meta.next]
                ? `${lineage[meta.next]?.number} was issued from this ${meta.short.toLowerCase()}.`
                : doc.stage === 'quote'
                  ? 'Marks this quote accepted and issues a new invoice with the same items.'
                  : 'Marks this invoice paid and issues an official receipt.'}
            </span>
          </span>
          <IconArrowRight className="shrink-0 text-accent" />
        </button>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label={`${meta.short} number`}
          value={doc.number}
          onChange={(number) => patch({ number })}
          className="font-mono tabular-nums"
          spellCheck={false}
        />
        <div>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">Status</span>
          {meta.statuses.length > 1 ? (
            <Segmented
              ariaLabel="Status"
              value={doc.status}
              onChange={setStatus}
              className="w-full"
              options={meta.statuses.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
            />
          ) : (
            <p className="flex h-[34px] items-center text-[13px] text-ink-soft">Paid in full</p>
          )}
        </div>
        <DateField label="Issue date" value={doc.issueDate} onChange={(issueDate) => patch({ issueDate })} />
        {doc.stage === 'receipt' ? (
          <DateField
            label={meta.dateLabel}
            value={doc.paidDate ?? doc.issueDate}
            onChange={(paidDate) => patch({ paidDate, dueDate: paidDate })}
          />
        ) : (
          <DateField
            label={meta.dateLabel}
            value={doc.dueDate}
            onChange={(dueDate) => patch({ dueDate })}
            hint={<Badge tone={badge.tone}>{badge.label}</Badge>}
          />
        )}
        {doc.stage === 'invoice' && doc.status === 'paid' && (
          <DateField
            label="Paid on"
            value={doc.paidDate ?? today}
            onChange={(paidDate) => patch({ paidDate })}
            hint={formatDate(doc.paidDate)}
          />
        )}
      </div>
    </Section>
  );
}
