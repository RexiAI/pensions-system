import { LineChart } from '../charts/LineChart';
import { RangeChart } from '../charts/RangeChart';
import { RateBars } from '../charts/RateBars';
import type { ChartFrameAttributes } from '../charts/ChartFrame';
import { DataTable } from '../DataTable';
import { ReadoutStrip } from '../ReadoutStrip';
import type { ChartSpec, PlateView } from './views';

function Chart({ spec, title, view, variant }: { spec: ChartSpec; title: string; view: PlateView; variant: ChartFrameAttributes['variant'] }) {
  const frame = { title, ariaLabelledBy: `fig-0${view.figureNumber}-title`, ariaDescribedBy: view.readoutId, variant };
  if (spec.kind === 'range') {
    return <RangeChart {...frame} rows={spec.rows} formatValue={view.format} />;
  }
  if (spec.kind === 'bars') {
    return <RateBars {...frame} rows={spec.rows} formatValue={view.format} />;
  }
  return (
    <LineChart
      {...frame}
      points={spec.points}
      min={spec.min}
      max={spec.max}
      {...(spec.reference ? { reference: spec.reference } : {})}
      formatTick={spec.format}
      formatPoint={spec.format}
    />
  );
}

export interface PlateBodyProps {
  view: PlateView;
  readoutLabel: string;
  nullLabel: string;
}

/**
 * The visual chart and its non-visual table, produced by one component: a table is emitted if
 * and only if a chart is emitted (T11 as amended by D5). There is no code path that renders
 * one without the other, which is what stops a chart-shaped hole coming back.
 */
function ChartWithTable({ view, nullLabel }: { view: PlateView; nullLabel: string }) {
  if (!view.chart) return null;
  const spec = view.chart;
  return (
    <>
      <div className="chart__variant chart__variant--wide">
        <Chart spec={spec} title={view.title} view={view} variant="wide" />
      </div>
      <div className="chart__variant chart__variant--compact">
        <Chart spec={spec} title={view.title} view={view} variant="compact" />
      </div>
      <DataTable
        id={`fig-0${view.figureNumber}-table`}
        caption={view.caption}
        summaryLabel={view.summary}
        columns={view.columns}
        rows={view.rows}
        nullLabel={nullLabel}
      />
    </>
  );
}

/** The data body of one plate: readout, assumption line, then the chart-and-table pair. */
export function PlateBody({ view, readoutLabel, nullLabel }: PlateBodyProps) {
  return (
    <>
      <ReadoutStrip id={view.readoutId} label={readoutLabel} items={view.readout} />
      {view.assumptionLine ? <p className="plate__assumptions">{view.assumptionLine}</p> : null}
      <ChartWithTable view={view} nullLabel={nullLabel} />
    </>
  );
}
