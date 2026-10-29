export interface ChartPoint {
  label: string;
  value: number | null;
}

export interface ChartBox {
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
}

export const DEFAULT_BOX: ChartBox = { width: 1000, height: 320, paddingX: 48, paddingY: 24 };

/** Round a maximum up to a readable step so a ratio axis lands on 0.10 increments. */
export function niceMax(value: number, step = 0.1): number {
  if (value <= 0) return step;
  return Math.ceil(value / step) * step;
}

export function plotWidth(box: ChartBox): number {
  return box.width - box.paddingX * 2;
}

export function plotHeight(box: ChartBox): number {
  return box.height - box.paddingY * 2;
}

export function xAt(index: number, count: number, box: ChartBox): number {
  if (count <= 1) return box.paddingX;
  return box.paddingX + (index / (count - 1)) * plotWidth(box);
}

export function yAt(value: number, min: number, max: number, box: ChartBox): number {
  const span = max - min === 0 ? 1 : max - min;
  return box.paddingY + (1 - (value - min) / span) * plotHeight(box);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Builds one path per contiguous run of non-null values, so a missing month is a visible
 * gap rather than an interpolation (design §Task 3 watch items).
 */
export function toSegments(
  points: readonly ChartPoint[],
  min: number,
  max: number,
  box: ChartBox = DEFAULT_BOX,
): string[] {
  const segments: string[] = [];
  let current: string[] = [];
  points.forEach((point, index) => {
    if (point.value === null) {
      if (current.length > 0) segments.push(current.join(' '));
      current = [];
      return;
    }
    const x = round1(xAt(index, points.length, box));
    const y = round1(yAt(point.value, min, max, box));
    current.push(`${current.length === 0 ? 'M' : 'L'}${x},${y}`);
  });
  if (current.length > 0) segments.push(current.join(' '));
  return segments;
}

export interface LadderRow {
  label: string;
  min: number;
  max: number;
  central: number;
}

export function ladderSpan(rows: readonly LadderRow[]): { min: number; max: number } {
  if (rows.length === 0) return { min: 0, max: 1 };
  const min = Math.min(...rows.map((row) => row.min));
  const max = Math.max(...rows.map((row) => row.max));
  if (min === max) return { min: min - 0.01, max: max + 0.01 };
  return { min, max };
}

export interface BarRow {
  label: string;
  value: number;
}

/** Bar geometry around a zero baseline; negative values extend left, never clamped. */
export function barGeometry(
  rows: readonly BarRow[],
  box: ChartBox = DEFAULT_BOX,
): Array<{ label: string; value: number; x: number; width: number; y: number; height: number }> {
  const magnitude = Math.max(...rows.map((row) => Math.abs(row.value)), 1);
  const zero = box.paddingX + plotWidth(box) / 2;
  const scale = (plotWidth(box) / 2) / magnitude;
  const rowHeight = rows.length === 0 ? 0 : plotHeight(box) / rows.length;
  return rows.map((row, index) => {
    const rawWidth = Math.abs(row.value) * scale;
    return {
      label: row.label,
      value: row.value,
      x: row.value >= 0 ? zero : zero - rawWidth,
      width: rawWidth,
      y: box.paddingY + index * rowHeight,
      height: Math.max(8, rowHeight - 16),
    };
  });
}

/** Position of an arbitrary value on a shared linear x axis (used by ladder charts). */
export function xForValue(value: number, min: number, max: number, box: ChartBox): number {
  const span = max - min === 0 ? 1 : max - min;
  return box.paddingX + ((value - min) / span) * plotWidth(box);
}

/** Evenly spaced axis ticks between min and max. */
export function tickValues(min: number, max: number, count: number): number[] {
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, index) => min + step * index);
}
