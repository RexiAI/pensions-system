import { AGE_BANDS, bandLabel } from '../../series/age-bands';
import type { BandShare, YearStructure } from '../../series/age-structure';
import { formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { LocaleKey } from '../../content/keys';

/**
 * One demography panel and its chart (spec 006 T10 split the plate by responsibility).
 *
 * The panel geometry, the bars, the axis and the projected series' form cue live here; the plate
 * composes three of these beside one disclosure. Age increases upward; all three panels share one
 * hue, and the observed/projected distinction is carried by a pattern and a printed word.
 */
const VIEW_WIDTH = 360;
const VIEW_HEIGHT = 320;
const CENTRE = 201;
const SIDE = 150;
const PITCH = 14;
const BAR_HEIGHT = 10;
const TOP = 10;
const LABEL_X = 38;

/** The axis's vertical extent: every rule spans the band stack plus the same 4 px cap. */
const AXIS_TOP = TOP - 4;
const AXIS_BOTTOM = TOP + AGE_BANDS.length * PITCH;

/** The two ticks a panel draws on each side, in percent points. */
const AXIS_TICKS = [2, 4] as const;

/** What every component in this file reads: the year, its content model, the shared axis. */
interface PanelProps {
  year: YearStructure;
  content: CountryLocaleContent;
  axisMax: number;
}

/* Spec 006 T10: the projected series' form cue. SVG attributes cannot read custom properties, so
   the rhythm is expressed as component constants beside PITCH/BAR_HEIGHT, matching
   `--dash-projection`'s 6-over-4: a 6 px stripe in a 10 px period. The stripe's *colour* comes
   from the `demography__hatch-ink` class, so no colour literal enters the file. */
const HATCH_PERIOD = 10;
const HATCH_STROKE = 6;

/** The band the first and last panels point at: the wide foot, before and after the bulge. */
const BASE_BAND = AGE_BANDS[0] as number;

/** Coordinates are rounded to one decimal at build time (design §Chart strategy). */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function barY(index: number): number {
  return TOP + (AGE_BANDS.length - 1 - index) * PITCH;
}

function sideLength(share: number, axisMax: number): number {
  return round1(Math.max(0, Math.min(1, share / axisMax)) * SIDE);
}

function Bar({
  band,
  index,
  hue,
  axisMax,
  annotated,
}: {
  band: BandShare;
  index: number;
  hue: YearStructure['hue'];
  axisMax: number;
  annotated: boolean;
}) {
  const y = barY(index);
  const male = sideLength(band.male, axisMax);
  const female = sideLength(band.female, axisMax);
  return (
    <g
      className={`demography__bar-group demography__bar-group--${hue}`}
      data-annotated={annotated ? 'true' : undefined}
    >
      <rect className="demography__bar" x={CENTRE - male} y={y} width={male} height={BAR_HEIGHT} />
      <rect className="demography__bar" x={CENTRE} y={y} width={female} height={BAR_HEIGHT} />
    </g>
  );
}

/** The shared scale: ticks at 2 and 4 per side, on a 0 to 4.5 axis in every panel. */
function Tick({
  tick,
  axisMax,
  content,
}: {
  tick: number;
  axisMax: number;
  content: CountryLocaleContent;
}) {
  const offset = CENTRE + sideLength(tick, axisMax);
  return (
    <g>
      <line className="demography__grid" x1={offset} y1={AXIS_TOP} x2={offset} y2={AXIS_BOTTOM} />
      <text className="demography__tick" x={offset} y={VIEW_HEIGHT - 2} textAnchor="middle">
        {`${formatValue(tick, 'integer', content.locale, '')}\u00A0%`}
      </text>
    </g>
  );
}

function Axis({ axisMax, content }: { axisMax: number; content: CountryLocaleContent }) {
  return (
    <g className="demography__axis">
      <line
        className="demography__baseline"
        x1={CENTRE}
        y1={AXIS_TOP}
        x2={CENTRE}
        y2={AXIS_BOTTOM}
      />
      {AXIS_TICKS.map((tick) => (
        <Tick key={tick} tick={tick} axisMax={axisMax} content={content} />
      ))}
    </g>
  );
}

/** The band a panel's annotation points the eye at: the wide foot, or the bulge that retires. */
function annotatedBand(year: YearStructure): number {
  if (year.hue !== 'measured') return BASE_BAND;
  const largest = [...year.bands].sort((a, b) => b.total - a.total)[0];
  return largest === undefined ? BASE_BAND : largest.band;
}

const ANNOTATION_KEYS: Readonly<Record<YearStructure['hue'], LocaleKey>> = {
  reference: 'steps.why.annotation.reference',
  measured: 'steps.why.annotation.measured',
  projected: 'steps.why.annotation.projected',
};

/** The projected series' form cue: a 45° hatch, defined beside the bars it paints. */
function ProjectionHatch() {
  return (
    <defs>
      <pattern
        id="projection-hatch"
        width={HATCH_PERIOD}
        height={HATCH_PERIOD}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line className="demography__hatch-ink" x1={0} y1={0} x2={0} y2={HATCH_PERIOD} strokeWidth={HATCH_STROKE} />
      </pattern>
    </defs>
  );
}

/** The age gutter: one label per band, the decadal ones weighted. */
function AgeLabels({ year }: { year: YearStructure }) {
  return (
    <>
      {year.bands.map((band, index) => (
        <text
          className={band.band % 20 === 0 ? 'demography__age demography__age--major' : 'demography__age'}
          x={LABEL_X}
          y={barY(index) + BAR_HEIGHT}
          textAnchor="end"
          key={`label-${band.band}`}
        >
          {bandLabel(band.band)}
        </text>
      ))}
    </>
  );
}

/**
 * The panel's chart: one shared axis, one bar group per band and the age labels, in one SVG. The
 * panel's accessible name is the SVG's own `<title>`, and the readout is its description.
 */
function PanelChart({ year, content, axisMax, stateWord }: PanelProps & { stateWord: string }) {
  const annotated = annotatedBand(year);
  const titleId = `demography-${year.year}-title`;
  return (
    <svg className="demography__svg" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} role="img" aria-labelledby={titleId} aria-describedby="demography-readout">
      <title id={titleId}>{`${year.year} · ${stateWord}`}</title>
      {year.state === 'projected' ? <ProjectionHatch /> : null}
      <Axis axisMax={axisMax} content={content} />
      {year.bands.map((band, index) => (
        <Bar band={band} index={index} hue={year.hue} axisMax={axisMax} annotated={band.band === annotated} key={band.band} />
      ))}
      <AgeLabels year={year} />
    </svg>
  );
}

/** The panel's year and state, as one line above the chart. */
function PanelHead({ year, stateWord }: { year: YearStructure; stateWord: string }) {
  return (
    <p className="demography__panel-head">
      <span className="demography__panel-year">{year.year}</span>{' '}
      <span className="demography__panel-state">{stateWord}</span>
    </p>
  );
}

/**
 * One panel: its year and state, the chart, and exactly one annotation (spec 004 T4). The
 * annotation is visible text naming a published band in words, so the meaning of the mark is
 * carried by a sentence, a form and an outline, never by hue alone.
 */
export function Panel({ year, content, axisMax }: PanelProps) {
  const stateWord = content.t(
    year.state === 'observed' ? 'demography.year.observed' : 'demography.year.projected',
  );
  return (
    <div
      className={`demography__panel demography__panel--${year.hue}`}
      data-projection={year.state === 'projected' ? 'projected' : 'observed'}
    >
      <PanelHead year={year} stateWord={stateWord} />
      <PanelChart year={year} content={content} axisMax={axisMax} stateWord={stateWord} />
      <p className="demography__annotation">
        {content.t(ANNOTATION_KEYS[year.hue], { band: bandLabel(annotatedBand(year)) })}
      </p>
    </div>
  );
}
