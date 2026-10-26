import type { BarRow, ChartBox } from '../../charts/geometry';
import { barGeometry } from '../../charts/geometry';
import { ChartFrame } from './ChartFrame';
import type { ChartFrameAttributes, ChartVariant } from './ChartFrame';

const ROW_HEIGHT = 56;

const BOXES: Readonly<Record<ChartVariant, ChartBox>> = {
  wide: { width: 1000, height: 80, paddingX: 180, paddingY: 24 },
  compact: { width: 320, height: 80, paddingX: 96, paddingY: 20 },
};

type Bar = ReturnType<typeof barGeometry>[number];

function RateBar({ box, bar, formatValue }: { box: ChartBox; bar: Bar; formatValue: (value: number) => string }) {
  return (
    <g>
      <text className="chart__row-label" x={0} y={bar.y + bar.height / 2 + 4}>
        {bar.label}
      </text>
      <rect
        className={bar.value < 0 ? 'chart__bar chart__bar--negative' : 'chart__bar'}
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
      />
      <text className="chart__value" x={box.width} y={bar.y + bar.height / 2 + 4} textAnchor="end">
        {formatValue(bar.value)}
      </text>
    </g>
  );
}

export interface RateBarsProps extends ChartFrameAttributes {
  rows: readonly BarRow[];
  formatValue: (value: number) => string;
}

/** Rate ladder: one bar per discount rate on a shared axis, negative bars left of zero. */
export function RateBars({ rows, formatValue, ...frame }: RateBarsProps) {
  const base = BOXES[frame.variant];
  const box = { ...base, height: base.height + rows.length * ROW_HEIGHT };
  const geometry = barGeometry(rows, box);
  const zero = box.paddingX + (box.width - box.paddingX * 2) / 2;
  return (
    <ChartFrame {...frame} box={box}>
      <line className="chart__ref" x1={zero} x2={zero} y1={box.paddingY} y2={box.height - box.paddingY} />
      {geometry.map((bar) => (
        <RateBar key={bar.label} box={box} bar={bar} formatValue={formatValue} />
      ))}
    </ChartFrame>
  );
}
