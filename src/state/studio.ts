import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { AccentKey, CurrencyCode, LineItem, Party, Sender, Stage, StudioDoc, StudioState } from '../types';
import { ACCENTS, STAGE_META } from '../lib/constants';
import { addDays, todayISO } from '../lib/dates';
import { uid } from '../lib/id';
import { reserveNumber } from '../lib/numbering';
import { createDemoState, DEFAULT_PAYMENT_INSTRUCTIONS, DEFAULT_SENDER } from '../lib/seed';
import { loadState, saveState } from '../lib/storage';

type Action =
  | { type: 'select'; id: string }
  | { type: 'patch'; id: string; patch: Partial<StudioDoc> }
  | { type: 'patchSender'; patch: Partial<Sender> }
  | { type: 'patchClient'; patch: Partial<Party> }
  | { type: 'setItems'; items: LineItem[] }
  | { type: 'setAccent'; accent: AccentKey }
  | { type: 'create'; stage: Stage }
  | { type: 'duplicate'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'promote'; id: string }
  | { type: 'replace'; state: StudioState };


function touch(doc: StudioDoc, patch: Partial<StudioDoc>): StudioDoc {
  return { ...doc, ...patch, updatedAt: Date.now() };
}

function updateDoc(state: StudioState, id: string, fn: (d: StudioDoc) => StudioDoc): StudioState {
  return { ...state, docs: state.docs.map((d) => (d.id === id ? fn(d) : d)) };
}

function activeDoc(state: StudioState): StudioDoc {
  return state.docs.find((d) => d.id === state.activeId) ?? state.docs[0];
}

function defaultDueDate(stage: Stage, issueDate: string): string {
  if (stage === 'quote') return addDays(issueDate, 30);
  if (stage === 'invoice') return addDays(issueDate, 14);
  return issueDate;
}

function blankDoc(stage: Stage, number: string, template: StudioDoc | undefined): StudioDoc {
  const today = todayISO();
  const now = Date.now();
  return {
    id: uid(),
    stage,
    number,
    status: stage === 'receipt' ? 'paid' : 'draft',
    issueDate: today,
    dueDate: defaultDueDate(stage, today),
    paidDate: stage === 'receipt' ? today : null,
    currency: template?.currency ?? 'PHP',
    sender: template ? { ...template.sender } : { ...DEFAULT_SENDER },
    client: { name: '', address: '', email: '' },
    items: [{ id: uid(), description: '', detail: '', qty: 1, rate: 0 }],
    taxMode: template?.taxMode ?? 'none',
    customTaxRate: template?.customTaxRate ?? 0,
    discountType: 'flat',
    discountValue: 0,
    paymentInstructions: template?.paymentInstructions ?? DEFAULT_PAYMENT_INSTRUCTIONS,
    notes: '',
    sourceId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function findSuccessor(docs: StudioDoc[], doc: StudioDoc): StudioDoc | undefined {
  return docs.find((d) => d.sourceId === doc.id);
}

function reducer(state: StudioState, action: Action): StudioState {
  switch (action.type) {
    case 'select':
      return state.docs.some((d) => d.id === action.id) ? { ...state, activeId: action.id } : state;

    case 'patch':
      return updateDoc(state, action.id, (d) => touch(d, action.patch));

    case 'patchSender':
      return updateDoc(state, state.activeId, (d) => touch(d, { sender: { ...d.sender, ...action.patch } }));

    case 'patchClient':
      return updateDoc(state, state.activeId, (d) => touch(d, { client: { ...d.client, ...action.patch } }));

    case 'setItems':
      return updateDoc(state, state.activeId, (d) => touch(d, { items: action.items }));

    case 'setAccent':
      return { ...state, settings: { ...state.settings, accent: action.accent } };

    case 'create': {
      const { number, counters } = reserveNumber(state.counters, action.stage);
      const doc = blankDoc(action.stage, number, activeDoc(state));
      return { ...state, counters, docs: [doc, ...state.docs], activeId: doc.id };
    }

    case 'duplicate': {
      const source = state.docs.find((d) => d.id === action.id);
      if (!source) return state;
      const { number, counters } = reserveNumber(state.counters, source.stage);
      const today = todayISO();
      const now = Date.now();
      const copy: StudioDoc = {
        ...source,
        id: uid(),
        number,
        status: source.stage === 'receipt' ? 'paid' : 'draft',
        issueDate: today,
        dueDate: defaultDueDate(source.stage, today),
        paidDate: source.stage === 'receipt' ? today : null,
        items: source.items.map((i) => ({ ...i, id: uid() })),
        sourceId: null,
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, counters, docs: [copy, ...state.docs], activeId: copy.id };
    }

    case 'remove': {
      if (state.docs.length <= 1) return state;
      const docs = state.docs
        .filter((d) => d.id !== action.id)
        .map((d) => (d.sourceId === action.id ? { ...d, sourceId: null } : d));
      const activeId = state.activeId === action.id ? docs[0].id : state.activeId;
      return { ...state, docs, activeId };
    }

    case 'promote': {
      const source = state.docs.find((d) => d.id === action.id);
      if (!source) return state;
      const nextStage = STAGE_META[source.stage].next;
      if (!nextStage) return state;
      const existing = findSuccessor(state.docs, source);
      if (existing) return { ...state, activeId: existing.id };

      const { number, counters } = reserveNumber(state.counters, nextStage);
      const today = todayISO();
      const now = Date.now();
      const promoted: StudioDoc = {
        ...source,
        id: uid(),
        stage: nextStage,
        number,
        status: nextStage === 'receipt' ? 'paid' : 'draft',
        issueDate: today,
        dueDate: defaultDueDate(nextStage, today),
        paidDate: nextStage === 'receipt' ? today : null,
        items: source.items.map((i) => ({ ...i, id: uid() })),
        paymentInstructions:
          nextStage === 'receipt' ? `Payment in full against ${source.number}` : source.paymentInstructions,
        notes: nextStage === 'receipt' ? 'Received in full. Thank you for your business.' : source.notes,
        sourceId: source.id,
        createdAt: now,
        updatedAt: now,
      };
      const settled: Partial<StudioDoc> =
        source.stage === 'quote' ? { status: 'accepted' } : { status: 'paid', paidDate: today };
      const docs = state.docs.map((d) => (d.id === source.id ? touch(d, settled) : d));
      return { ...state, counters, docs: [promoted, ...docs], activeId: promoted.id };
    }

    case 'replace':
      return action.state;
  }
}

function init(): StudioState {
  return loadState() ?? createDemoState();
}

export type SaveStatus = { ok: boolean; at: number };

export function useStudio() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ ok: true, at: Date.now() });
  useEffect(() => {
    // Write-through on every change so nothing is lost if the tab closes mid-edit.
    const ok = saveState(state);
    setSaveStatus((prev) => (prev.ok === ok ? prev : { ok, at: Date.now() }));
  }, [state]);

  useEffect(() => {
    const accent = ACCENTS[state.settings.accent];
    const root = document.documentElement;
    root.style.setProperty('--accent', accent.hex);
    root.style.setProperty('--accent-rgb', accent.rgb);
  }, [state.settings.accent]);

  const doc = activeDoc(state);

  const actions = useMemo(
    () => ({
      select: (id: string) => dispatch({ type: 'select', id }),
      patch: (id: string, patch: Partial<StudioDoc>) => dispatch({ type: 'patch', id, patch }),
      patchSender: (patch: Partial<Sender>) => dispatch({ type: 'patchSender', patch }),
      patchClient: (patch: Partial<Party>) => dispatch({ type: 'patchClient', patch }),
      setItems: (items: LineItem[]) => dispatch({ type: 'setItems', items }),
      setAccent: (accent: AccentKey) => dispatch({ type: 'setAccent', accent }),
      create: (stage: Stage) => dispatch({ type: 'create', stage }),
      duplicate: (id: string) => dispatch({ type: 'duplicate', id }),
      remove: (id: string) => dispatch({ type: 'remove', id }),
      promote: (id: string) => dispatch({ type: 'promote', id }),
      replace: (next: StudioState) => dispatch({ type: 'replace', state: next }),
      resetDemo: () => dispatch({ type: 'replace', state: createDemoState() }),
    }),
    [],
  );

  const setCurrency = useCallback(
    (currency: CurrencyCode) => dispatch({ type: 'patch', id: state.activeId, patch: { currency } }),
    [state.activeId],
  );

  return { state, doc, actions: { ...actions, setCurrency }, saveStatus };
}

export type StudioActions = ReturnType<typeof useStudio>['actions'];
