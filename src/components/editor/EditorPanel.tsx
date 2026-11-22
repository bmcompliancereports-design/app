import type { StudioDoc } from '../../types';
import type { StudioActions } from '../../state/studio';
import { DocumentSection } from './DocumentSection';
import { ItemsSection } from './ItemsSection';
import { ClientSection, SenderSection } from './PartiesSection';
import { PaymentSection } from './PaymentSection';
import { TotalsSection } from './TotalsSection';

interface Props {
  doc: StudioDoc;
  docs: StudioDoc[];
  actions: StudioActions;
}

export function EditorPanel({ doc, docs, actions }: Props) {
  return (
    <div key={doc.id}>
      <DocumentSection doc={doc} docs={docs} actions={actions} />
      <ClientSection doc={doc} actions={actions} />
      <ItemsSection doc={doc} actions={actions} />
      <TotalsSection doc={doc} actions={actions} />
      <PaymentSection doc={doc} actions={actions} />
      <SenderSection doc={doc} actions={actions} />
    </div>
  );
}
