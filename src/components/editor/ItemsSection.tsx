import { useState } from 'react';
import type { LineItem, StudioDoc } from '../../types';
import { lineTotal } from '../../lib/calc';
import { uid } from '../../lib/id';
import { formatMoney } from '../../lib/money';
import type { StudioActions } from '../../state/studio';
import { IconArrowDown, IconArrowUp, IconCopy, IconGrip, IconPlus, IconTrash } from '../Icons';
import { inputClass, NumberInput } from './fields';
import { Section } from './Section';

interface Props {
  doc: StudioDoc;
  actions: StudioActions;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const iconButton =
  'flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas hover:text-ink disabled:pointer-events-none disabled:opacity-30';

export function ItemsSection({ doc, actions }: Props) {
  const { items, currency } = doc;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const update = (id: string, patch: Partial<LineItem>) =>
    actions.setItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = () => actions.setItems([...items, { id: uid(), description: '', detail: '', qty: 1, rate: 0 }]);

  const duplicate = (index: number) => {
    const copy = { ...items[index], id: uid() };
    actions.setItems([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
  };

  const remove = (id: string) => actions.setItems(items.filter((item) => item.id !== id));

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <Section title="Line items" summary={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}>
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li
            key={item.id}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) actions.setItems(move(items, dragIndex, index));
              endDrag();
            }}
            className={`rounded-lg border bg-white p-3 transition-colors ${
              overIndex === index && dragIndex !== index ? 'border-accent' : 'border-hairline'
            } ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-2">
              <span
                draggable
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', item.id);
                }}
                onDragEnd={endDrag}
                title="Drag to reorder"
                className="mt-1.5 hidden cursor-grab text-ink-faint hover:text-ink active:cursor-grabbing sm:block"
              >
                <IconGrip />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  aria-label={`Item ${index + 1} description`}
                  value={item.description}
                  onChange={(e) => update(item.id, { description: e.target.value })}
                  placeholder="Description"
                  className={`${inputClass} font-medium`}
                />
                <input
                  aria-label={`Item ${index + 1} details`}
                  value={item.detail}
                  onChange={(e) => update(item.id, { detail: e.target.value })}
                  placeholder="Details (optional)"
                  className={`${inputClass} text-[12px] text-ink-soft`}
                />
                <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1.2fr)] items-end gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.06em] text-ink-faint">Qty</span>
                    <NumberInput value={item.qty} onChange={(qty) => update(item.id, { qty })} aria-label={`Item ${index + 1} quantity`} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.06em] text-ink-faint">Unit rate</span>
                    <NumberInput value={item.rate} onChange={(rate) => update(item.id, { rate })} aria-label={`Item ${index + 1} unit rate`} />
                  </label>
                  <div className="pb-1.5 text-right">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.06em] text-ink-faint">Line total</span>
                    <span className="block truncate font-mono text-[13px] tabular-nums text-ink">
                      {formatMoney(lineTotal(item), currency)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <button type="button" className={iconButton} disabled={index === 0} onClick={() => actions.setItems(move(items, index, index - 1))} aria-label="Move up" title="Move up">
                  <IconArrowUp width={14} height={14} />
                </button>
                <button type="button" className={iconButton} disabled={index === items.length - 1} onClick={() => actions.setItems(move(items, index, index + 1))} aria-label="Move down" title="Move down">
                  <IconArrowDown width={14} height={14} />
                </button>
                <button type="button" className={iconButton} onClick={() => duplicate(index)} aria-label="Duplicate item" title="Duplicate">
                  <IconCopy width={14} height={14} />
                </button>
                <button
                  type="button"
                  className={`${iconButton} hover:!text-red-700`}
                  onClick={() => remove(item.id)}
                  aria-label="Delete item"
                  title="Delete"
                >
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-hairline px-4 py-6 text-center text-[13px] text-ink-soft">
          No items yet. Add the first one below.
        </p>
      )}
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
      >
        <IconPlus width={14} height={14} /> Add line item
      </button>
    </Section>
  );
}
