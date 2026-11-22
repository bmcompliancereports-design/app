import { useEffect, useMemo, useRef, useState } from 'react';
import type { Stage, StudioDoc, StudioState } from '../types';
import { computeTotals } from '../lib/calc';
import { STAGE_META, STAGE_ORDER } from '../lib/constants';
import { formatDate, formatRelativeTime, todayISO } from '../lib/dates';
import { formatMoney } from '../lib/money';
import { isOverdue } from '../lib/status';
import { downloadBackup, readBackupFile } from '../lib/storage';
import type { StudioActions } from '../state/studio';
import { Badge, StatusPill } from './StatusPill';
import { IconClose, IconCopy, IconDownload, IconPlus, IconSearch, IconTrash, IconUpload } from './Icons';
import { inputClass, Segmented } from './editor/fields';

interface Props {
  open: boolean;
  onClose: () => void;
  state: StudioState;
  actions: StudioActions;
}

type Filter = 'all' | Stage;

function matches(doc: StudioDoc, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [doc.number, doc.client.name, ...doc.items.map((i) => i.description)].some((v) => v.toLowerCase().includes(q));
}

export function HistoryDrawer({ open, onClose, state, actions }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const today = todayISO();

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    // Keep the off-screen drawer out of the tab order and away from assistive tech.
    if (panelRef.current) panelRef.current.inert = !open;
    if (!open) setNotice(null);
  }, [open]);

  const docs = useMemo(
    () =>
      state.docs
        .filter((d) => (filter === 'all' || d.stage === filter) && matches(d, query.trim()))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [state.docs, filter, query],
  );

  const open_ = (id: string) => {
    actions.select(id);
    onClose();
  };

  const create = (stage: Stage) => {
    actions.create(stage);
    onClose();
  };

  const remove = (doc: StudioDoc) => {
    if (state.docs.length <= 1) return;
    if (window.confirm(`Delete ${doc.number}? This cannot be undone.`)) actions.remove(doc.id);
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = await readBackupFile(file);
      if (window.confirm(`Replace the ${state.docs.length} documents in this browser with ${next.docs.length} from the backup?`)) {
        actions.replace(next);
        setNotice({ tone: 'ok', text: `Imported ${next.docs.length} documents.` });
      }
    } catch (e) {
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : 'Import failed.' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/20 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Document history"
        ref={panelRef}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-hairline bg-white shadow-drawer transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <h2 className="font-serif text-[24px] leading-none text-ink">Documents</h2>
            <p className="mt-1 text-[12px] text-ink-soft">Saved in this browser · {state.docs.length} total</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-canvas hover:text-ink"
          >
            <IconClose />
          </button>
        </div>

        <div className="space-y-3 border-b border-hairline px-5 py-4">
          <div className="grid grid-cols-3 gap-2">
            {STAGE_ORDER.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => create(stage)}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-hairline py-2 text-[12px] font-medium text-ink transition-colors hover:border-accent/40 hover:text-accent"
              >
                <IconPlus width={13} height={13} /> {STAGE_META[stage].short}
              </button>
            ))}
          </div>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search number, client or item"
              aria-label="Search documents"
              className={`${inputClass} pl-8`}
            />
          </div>
          <Segmented<Filter>
            ariaLabel="Filter by type"
            size="sm"
            value={filter}
            onChange={setFilter}
            className="w-full"
            options={[
              { value: 'all', label: 'All' },
              { value: 'quote', label: 'Quotes' },
              { value: 'invoice', label: 'Invoices' },
              { value: 'receipt', label: 'Receipts' },
            ]}
          />
        </div>

        <ul className="flex-1 overflow-y-auto">
          {docs.map((doc) => {
            const active = doc.id === state.activeId;
            const total = computeTotals(doc).total;
            return (
              <li key={doc.id} className="group relative border-b border-hairline">
                <button
                  type="button"
                  onClick={() => open_(doc.id)}
                  className={`block w-full px-5 py-3.5 text-left transition-colors hover:bg-canvas/70 ${active ? 'bg-canvas' : ''}`}
                  aria-current={active ? 'true' : undefined}
                >
                  {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-accent" />}
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[12px] tabular-nums text-ink">{doc.number}</span>
                    <span className="text-[11px] text-ink-faint">{STAGE_META[doc.stage].short}</span>
                    <span className="ml-auto flex gap-1.5">
                      {isOverdue(doc, today) && <Badge tone="danger">Overdue</Badge>}
                      <StatusPill status={doc.stage === 'receipt' ? 'paid' : doc.status} />
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-[13px] font-medium text-ink">{doc.client.name || 'Untitled client'}</span>
                    <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink">{formatMoney(total, doc.currency)}</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-faint">
                    Issued {formatDate(doc.issueDate)} · Edited {formatRelativeTime(doc.updatedAt)}
                  </span>
                </button>
                <div className="absolute right-3 top-[52px] hidden gap-0.5 rounded-md border border-hairline bg-white p-0.5 group-focus-within:flex group-hover:flex">
                  <button
                    type="button"
                    onClick={() => {
                      actions.duplicate(doc.id);
                      onClose();
                    }}
                    title="Duplicate"
                    aria-label={`Duplicate ${doc.number}`}
                    className="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-canvas hover:text-ink"
                  >
                    <IconCopy width={13} height={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(doc)}
                    disabled={state.docs.length <= 1}
                    title="Delete"
                    aria-label={`Delete ${doc.number}`}
                    className="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
                  >
                    <IconTrash width={13} height={13} />
                  </button>
                </div>
              </li>
            );
          })}
          {docs.length === 0 && <li className="px-5 py-10 text-center text-[13px] text-ink-soft">No documents match.</li>}
        </ul>

        <div className="border-t border-hairline px-5 py-4">
          {notice && (
            <p className={`mb-3 text-[12px] ${notice.tone === 'ok' ? 'text-emerald-700' : 'text-red-700'}`} role="status">
              {notice.text}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => downloadBackup(state)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-hairline py-2 text-[12px] font-medium text-ink hover:border-slate-300"
            >
              <IconDownload /> Export JSON Backup
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-hairline py-2 text-[12px] font-medium text-ink hover:border-slate-300"
            >
              <IconUpload /> Import JSON
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
            Everything stays on this device. Export a backup before clearing browser data.
          </p>
        </div>
      </aside>
    </div>
  );
}
