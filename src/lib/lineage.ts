import type { Stage, StudioDoc } from '../types';

/** Returns the quote → invoice → receipt chain the given document belongs to, keyed by stage. */
export function getLineage(docs: StudioDoc[], doc: StudioDoc): Partial<Record<Stage, StudioDoc>> {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const chain: Partial<Record<Stage, StudioDoc>> = { [doc.stage]: doc };

  let back = doc.sourceId ? byId.get(doc.sourceId) : undefined;
  while (back && !chain[back.stage]) {
    chain[back.stage] = back;
    back = back.sourceId ? byId.get(back.sourceId) : undefined;
  }

  let forward = docs.find((d) => d.sourceId === doc.id);
  while (forward && !chain[forward.stage]) {
    chain[forward.stage] = forward;
    const current: StudioDoc = forward;
    forward = docs.find((d) => d.sourceId === current.id);
  }
  return chain;
}
