import type { StudioDoc } from '../../types';
import { STAGE_META } from '../../lib/constants';
import type { StudioActions } from '../../state/studio';
import { TextArea } from './fields';
import { Section } from './Section';

export function PaymentSection({ doc, actions }: { doc: StudioDoc; actions: StudioActions }) {
  const meta = STAGE_META[doc.stage];
  return (
    <Section title="Payment & notes" defaultOpen={false} summary={meta.paymentLabel}>
      <div className="space-y-4">
        <TextArea
          label={meta.paymentLabel}
          rows={4}
          value={doc.paymentInstructions}
          onChange={(paymentInstructions) => actions.patch(doc.id, { paymentInstructions })}
          placeholder="Bank transfer, GCash or Wise details"
        />
        <TextArea
          label="Notes"
          rows={3}
          value={doc.notes}
          onChange={(notes) => actions.patch(doc.id, { notes })}
          placeholder="Terms, timelines or a short thank-you"
        />
      </div>
    </Section>
  );
}
