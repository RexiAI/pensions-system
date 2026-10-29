import type { ChartBox, LadderRow } from '../../charts/geometry';
import { ladderSpan, xForValue } from '../../charts/geometry';
import { ChartFrame } from './ChartFrame';
import type { ChartFrameAttributes, ChartVariant } from './ChartFrame';

const ROW_HEIGHT = 56;

/** Widest label a range row can carry before the plot starts, per variant. */
const BOXES: Readonly<Record<ChartVariant, ChartBox>> = {
  wide: { width: 1000, height: 60, paddingX: 180, paddingY: 24 },
  compact: { width: 320, height: 60, paddingX: 96, paddingY: 20 },
};

function RangeRow({
  box,
  row,
  index,
  span,
  formatValue,
}: {
  box: ChartBox;
  row: LadderRow;
  index: number;
  span: { min: number; max: number };
  formatValue: (value: number) => string;
}) {
  const y = box.paddingY + index * ROW_HEIGHT;
  return (
    <g>
      <text className="chart__row-label" x={0} y={y + 4}>
        {row.label}
      </text>
      <line
        className="chart__whisker"
        x1={xForValue(row.min, span.min, span.max, box)}
        x2={xForValue(row.max, span.min, span.max, box)}
        y1={y}
        y2={y}
      />
      <circle className="chart__dot" cx={xForValue(row.central, span.min, span.max, box)} cy={y} r={6} />
      <text className="chart__value" x={box.width} y={y + 4} textAnchor="end">
        {formatValue(row.central)}
      </text>
    </g>
  );
}

export interface RangeChartProps extends ChartFrameAttributes {
  rows: readonly LadderRow[];
  formatValue: (value: number) => string;
}

/** Range ladder: one row per cohort, whisker over [min, max] with a central tick. */
export function RangeChart({ rows, formatValue, ...frame }: RangeChartProps) {
  const base = BOXES[frame.variant];
  const box = { ...base, height: base.height + rows.length * ROW_HEIGHT };
  const span = ladderSpan(rows);
  return (
    <ChartFrame {...frame} box={box}>
      {rows.map((row, index) => (
        <RangeRow key={row.label} box={box} row={row} index={index} span={span} formatValue={formatValue} />
      ))}
    </ChartFrame>
  );
}
