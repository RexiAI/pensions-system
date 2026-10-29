import type { ChartBox, ChartPoint } from '../../charts/geometry';
import { tickValues, toSegments, yAt } from '../../charts/geometry';
import { ChartFrame } from './ChartFrame';
import type { ChartFrameAttributes, ChartVariant } from './ChartFrame';

/** Wide plot at desktop width; compact plot whose viewBox is the 320px floor. */
const BOXES: Readonly<Record<ChartVariant, ChartBox>> = {
  wide: { width: 1000, height: 320, paddingX: 48, paddingY: 24 },
  compact: { width: 320, height: 260, paddingX: 34, paddingY: 20 },
};

function right(box: ChartBox): number {
  return box.width - box.paddingX;
}

function GridTicks({ box, min, max, format }: { box: ChartBox; min: number; max: number; format: (value: number) => string }) {
  return (
    <>
      {tickValues(min, max, 4).map((tick) => (
        <g key={tick}>
          <line className="chart__grid" x1={box.paddingX} x2={right(box)} y1={yAt(tick, min, max, box)} y2={yAt(tick, min, max, box)} />
          <text className="chart__tick" x={0} y={yAt(tick, min, max, box) + 4}>
            {format(tick)}
          </text>
        </g>
      ))}
    </>
  );
}

function ReferenceLine({ box, value, label, min, max }: { box: ChartBox; value: number; label: string; min: number; max: number }) {
  const y = yAt(value, min, max, box);
  return (
    <g>
      <line className="chart__ref" x1={box.paddingX} x2={right(box)} y1={y} y2={y} strokeDasharray="6 4" />
      <text className="chart__ref-label" x={right(box)} y={y - 6} textAnchor="end">
        {label}
      </text>
    </g>
  );
}

function Endpoint({ box, point, min, max, format }: { box: ChartBox; point: ChartPoint; min: number; max: number; format: (value: number) => string }) {
  if (point.value === null) return null;
  return (
    <g>
      <circle className="chart__dot" cx={right(box)} cy={yAt(point.value, min, max, box)} r={5} />
      <text className="chart__value" x={right(box)} y={yAt(point.value, min, max, box) - 12} textAnchor="end">
        {format(point.value)}
      </text>
    </g>
  );
}

function lastDrawable(points: readonly ChartPoint[]): ChartPoint | null {
  return [...points].reverse().find((point) => point.value !== null) ?? null;
}

function axisLabels(points: readonly ChartPoint[]): { first: string; last: string } {
  return { first: points[0]?.label ?? '', last: points[points.length - 1]?.label ?? '' };
}

export interface LineChartProps extends ChartFrameAttributes {
  points: readonly ChartPoint[];
  min: number;
  max: number;
  reference?: { value: number; label: string };
  formatTick: (value: number) => string;
  formatPoint: (value: number) => string;
}

/** Single-series line, server-rendered. Nothing in it exists only on hover. */
export function LineChart({
  points,
  min,
  max,
  reference,
  formatTick,
  formatPoint,
  ...frame
}: LineChartProps) {
  const box = BOXES[frame.variant];
  const lastPoint = lastDrawable(points);
  const labels = axisLabels(points);
  return (
    <ChartFrame {...frame} box={box}>
      <GridTicks box={box} min={min} max={max} format={formatTick} />
      {reference ? <ReferenceLine box={box} value={reference.value} label={reference.label} min={min} max={max} /> : null}
      {toSegments(points, min, max, box).map((d) => (
        <path className="chart__series" d={d} key={d.slice(0, 24)} />
      ))}
      {lastPoint ? <Endpoint box={box} point={lastPoint} min={min} max={max} format={formatPoint} /> : null}
      <text className="chart__tick" x={box.paddingX} y={box.height - 4}>
        {labels.first}
      </text>
      <text className="chart__tick" x={right(box)} y={box.height - 4} textAnchor="end">
        {labels.last}
      </text>
    </ChartFrame>
  );
}
