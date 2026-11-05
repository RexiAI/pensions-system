import { formatValue, formatWholePercent, formatYear } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedSeries } from '../../ingest/series-types';
import { displayPercent, drawnFraction } from '../../series/fuse';
import type { FuseValue } from '../../series/fuse';

/** The SVG's own coordinate width: the line is stretched to the step, so this is a scale only. */
const VIEW_W = 1000;
const BURNT_H = 6;

/** Where the cord ends and the burnt segment begins, in viewBox units (clamped geometry only). */
export function burnPoint(consumedPercent: number): number {
  return Math.round(VIEW_W * (1 - drawnFraction(consumedPercent)) * 100) / 100;
}

/**
 * The drawn line: a 1px cord from the inline start to the burn point, then the 6px burnt
 * segment flush to the inline end — a cord burned from its far end, not a bar that fills.
 * Geometry is attributes computed here, on the server: no `style`, no script, no transition.
 */
export function FuseLine({ consumedPercent }: { consumedPercent: number }) {
  const at = burnPoint(consumedPercent);
  return (
    <svg
      className="fuse__line"
      viewBox={`0 0 ${VIEW_W} ${BURNT_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="fuse__cord" x={0} y={BURNT_H / 2} width={at} height={1} />
      <rect className="fuse__burnt" x={at} y={0} width={VIEW_W - at} height={BURNT_H} />
    </svg>
  );
}

/**
 * The technical label: the percentage, the ratio it is a share of, its observation year and the
 * threshold. It is methodological precision, so it renders inside `#metodo` — the story states
 * the percentage alone, in words that name its denominator (spec 004 T5).
 */
export function fuseLabelOf(content: CountryLocaleContent, value: FuseValue): string {
  const { locale } = content;
  return content.t('fuse.label', {
    percent: formatWholePercent(displayPercent(value.consumedPercent), locale),
    ratio: formatValue(value.observedRatio, 'ratio', locale, ''),
    year: formatYear(value.observedYear, locale),
    threshold: formatValue(value.threshold, 'integer', locale, ''),
  });
}

/** A computed fuse value, or `undefined` when nothing observed exists to draw (AC-003-18). */
export function fuseValueOf(series: DerivedSeries | undefined): FuseValue | undefined {
  if (series === undefined || series.availability !== 'computed' || series.value === null) return undefined;
  return series.value as FuseValue;
}
