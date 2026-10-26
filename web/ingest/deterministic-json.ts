/**
 * Deterministic JSON: object keys sorted at every depth, two-space indent, trailing
 * newline. Committed derived files must be diffable — a re-run with the same inputs
 * must produce a byte-identical file.
 */
export function stableStringify(value: unknown): string {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value === null || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) sorted[key] = sortValue(record[key]);
  return sorted;
}
