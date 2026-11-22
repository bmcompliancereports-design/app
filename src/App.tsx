import { useCallback, useState } from 'react';
import { EditorPanel } from './components/editor/EditorPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MobileActionBar } from './components/MobileActionBar';
import { DocumentPaper } from './components/preview/DocumentPaper';
import { PreviewPane } from './components/preview/PreviewPane';
import { Badge } from './components/StatusPill';
import { TopBar, type View } from './components/TopBar';
import { STAGE_META } from './lib/constants';
import { todayISO } from './lib/dates';
import { getDueBadge } from './lib/status';
import { findSuccessor, useStudio } from './state/studio';

export default function App() {
  const { state, doc, actions, saveStatus } = useStudio();
  const [view, setView] = useState<View>('edit');
  const [historyOpen, setHistoryOpen] = useState(false);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  const meta = STAGE_META[doc.stage];
  const source = doc.sourceId ? state.docs.find((d) => d.id === doc.sourceId) : undefined;
  const successor = findSuccessor(state.docs, doc);
  const badge = getDueBadge(doc, todayISO());

  const convertLabel = !meta.next
    ? 'Final stage'
    : successor
      ? `Open ${STAGE_META[meta.next].short}`
      : `Convert to ${STAGE_META[meta.next].short}`;

  const handlePrint = () => {
    const previous = document.title;
    document.title = [doc.number, doc.client.name].filter(Boolean).join(' — ');
    const restore = () => {
      document.title = previous;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Restore the three demo documents? Your current documents in this browser will be replaced.')) {
      actions.resetDemo();
    }
  };

  return (
    <>
      <div className="app-shell flex min-h-[100dvh] flex-col bg-canvas lg:h-[100dvh]">
        <TopBar
          currency={doc.currency}
          onCurrency={actions.setCurrency}
          accent={state.settings.accent}
          onAccent={actions.setAccent}
          docCount={state.docs.length}
          onHistory={() => setHistoryOpen(true)}
          onReset={handleReset}
          onPrint={handlePrint}
          saveStatus={saveStatus}
          view={view}
          onView={setView}
        />

        <main className="flex-1 lg:grid lg:min-h-0 lg:grid-cols-[44fr_56fr]">
          <div
            className={`${view === 'edit' ? 'block' : 'hidden'} border-hairline bg-white pb-28 lg:block lg:overflow-y-auto lg:border-r lg:pb-12`}
          >
            <EditorPanel doc={doc} docs={state.docs} actions={actions} />
            <p className="px-5 pt-6 text-[11px] text-ink-faint sm:px-6">
              Changes save automatically to this browser. Nothing is uploaded.
            </p>
          </div>

          <div
            className={`${view === 'preview' ? 'block' : 'hidden'} px-4 pb-28 pt-5 sm:px-8 lg:block lg:overflow-y-auto lg:px-10 lg:pb-12 lg:pt-8`}
          >
            <div className="mx-auto mb-4 flex max-w-[794px] flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-soft">Live preview</span>
              <span className="text-[11px] text-ink-faint">A4 · 210 × 297 mm</span>
              <span className="ml-auto">
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </span>
            </div>
            <PreviewPane doc={doc} sourceNumber={source?.number} />
          </div>
        </main>

        <MobileActionBar
          convertLabel={convertLabel}
          canConvert={Boolean(meta.next)}
          onConvert={() => actions.promote(doc.id)}
          onPrint={handlePrint}
        />
      </div>

      <div className="print-root">
        <DocumentPaper doc={doc} sourceNumber={source?.number} />
      </div>

      <HistoryDrawer open={historyOpen} onClose={closeHistory} state={state} actions={actions} />
    </>
  );
}
