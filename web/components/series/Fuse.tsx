import { formatValue, formatWholePercent, formatYear } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedSeries } from '../../ingest/series-types';
import { displayPercent, drawnFraction } from '../../series/fuse';
import type { FuseValue } from '../../series/fuse';
import { ProvenanceStrip } from '../ProvenanceStrip';

export interface FuseProps {
  content: CountryLocaleContent;
  series: DerivedSeries;
  freshnessWindowDays: number;
}

/** The SVG's own coordinate width: the line is stretched to the band, so this is a scale only. */
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
function FuseLine({ consumedPercent }: { consumedPercent: number }) {
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

function labelOf(content: CountryLocaleContent, value: FuseValue): string {
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

/** The drawn line, its label and the definition of the ratio: the figure a reader sees. */
function FuseFace({ content, value }: { content: CountryLocaleContent; value: FuseValue }) {
  return (
    <figure className="fuse">
      <FuseLine consumedPercent={value.consumedPercent} />
      <figcaption className="fuse__label">{labelOf(content, value)}</figcaption>
      <p className="fuse__definition">{content.t('fuse.definition')}</p>
    </figure>
  );
}

/** The published command's own entry point, beside the fuse it belongs to. */
function ReproduceLink({ content }: { content: CountryLocaleContent }) {
  return (
    <a className="fuse__reproduce" href="#reproducir">
      {content.t('fuse.reproduce')}
    </a>
  );
}

/**
 * The fuse (spec 003 T2): the observed ratio over the threshold, drawn once and stated as text.
 * The meaning is the label — the percentage, the ratio, its observation year and the threshold;
 * the graphic is `aria-hidden`, and it carries no `role="progressbar"`, no value attribute and no
 * date, because it is not progress toward anything (AC-003-21).
 *
 * What a reader sees is the line, its label, the definition of the ratio and the way to its
 * reproduce panel. The provenance, the digest and the reproduce command sit in the
 * `Cómo se calcula` disclosure (D1, AC-003-51): the band's job above the fold is the countdown and
 * the way to share it, and nine lines of manifest between the fuse and the share row spent the
 * viewport on the audit trail. Collapsed, not removed — the same manifest, the same hash, the same
 * published command, one click away.
 */
export function Fuse({ content, series, freshnessWindowDays }: FuseProps) {
  const value = fuseValueOf(series);
  if (value === undefined) return null;
  return (
    <div className="fuse-group">
      <FuseFace content={content} value={value} />
      <ReproduceLink content={content} />
      <ProvenanceStrip
        manifest={series.manifest}
        figureId={series.seriesId}
        freshnessWindowDays={freshnessWindowDays}
        content={content}
        derivedPath="data/derived/series"
        collapsed
      />
    </div>
  );
}
