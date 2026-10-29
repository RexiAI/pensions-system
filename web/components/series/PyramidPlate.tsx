import { AGE_BANDS, bandLabel } from '../../series/age-bands';
import type { BandShare, PyramidValue, YearStructure } from '../../series/age-structure';
import { formatValue } from '../../content/format';
import { datasetForUrl, publisherForUrl } from '../../sources/labels';
import type { CountryLocaleContent } from '../../content/types';
import { DataTable } from '../DataTable';
import { ProvenanceStrip } from '../ProvenanceStrip';
import type { DerivedSeries } from '../../ingest/series-types';

export interface PyramidPlateProps {
  content: CountryLocaleContent;
  series: DerivedSeries;
  freshnessWindowDays: number;
}

/** The panel geometry. Age increases upward; one hue per panel; both sexes share that hue. */
const VIEW_WIDTH = 360;
const VIEW_HEIGHT = 320;
const CENTRE = 201;
const SIDE = 150;
const PITCH = 14;
const BAR_HEIGHT = 10;
const TOP = 10;
const LABEL_X = 38;

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

function Bar({ band, index, hue, axisMax }: { band: BandShare; index: number; hue: YearStructure['hue']; axisMax: number }) {
  const y = barY(index);
  const male = sideLength(band.male, axisMax);
  const female = sideLength(band.female, axisMax);
  return (
    <g className={`demography__bar-group demography__bar-group--${hue}`}>
      <rect className="demography__bar" x={CENTRE - male} y={y} width={male} height={BAR_HEIGHT} />
      <rect className="demography__bar" x={CENTRE} y={y} width={female} height={BAR_HEIGHT} />
    </g>
  );
}

/** The shared scale: ticks at 2 and 4 per side, on a 0 to 4.5 axis in every panel. */
function Axis({ axisMax, content }: { axisMax: number; content: CountryLocaleContent }) {
  const ticks = [2, 4];
  return (
    <g className="demography__axis">
      <line className="demography__baseline" x1={CENTRE} y1={TOP - 4} x2={CENTRE} y2={TOP + AGE_BANDS.length * PITCH} />
      {ticks.map((tick) => {
        const offset = sideLength(tick, axisMax);
        return (
          <g key={tick}>
            <line className="demography__grid" x1={CENTRE + offset} y1={TOP - 4} x2={CENTRE + offset} y2={TOP + AGE_BANDS.length * PITCH} />
            <text className="demography__tick" x={CENTRE + offset} y={VIEW_HEIGHT - 2} textAnchor="middle">
              {`${formatValue(tick, 'integer', content.locale, '')}\u00A0%`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Panel({ year, content, axisMax }: { year: YearStructure; content: CountryLocaleContent; axisMax: number }) {
  const stateWord = content.t(year.state === 'observed' ? 'demography.year.observed' : 'demography.year.projected');
  const titleId = `demography-${year.year}-title`;
  return (
    <div className={`demography__panel demography__panel--${year.hue}`} data-projection={year.state === 'projected' ? 'projected' : 'observed'}>
      <p className="demography__panel-head">
        <span className="demography__panel-year">{year.year}</span> <span className="demography__panel-state">{stateWord}</span>
      </p>
      <svg
        className="demography__svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-labelledby={titleId}
        aria-describedby="demography-readout"
      >
        <title id={titleId}>{`${year.year} · ${stateWord}`}</title>
        <Axis axisMax={axisMax} content={content} />
        {year.bands.map((band, index) => (
          <Bar band={band} index={index} hue={year.hue} axisMax={axisMax} key={band.band} />
        ))}
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
      </svg>
    </div>
  );
}

function percentPoints(content: CountryLocaleContent, value: number): string {
  return formatValue(value, 'percentPoints', content.locale, content.t('table.notDefined'));
}

/** The six values the block's claim rests on: `65+` and `<20` for each of the three years. */
function Readout({ value, content }: { value: PyramidValue; content: CountryLocaleContent }) {
  return (
    <dl className="demography__readout" id="demography-readout">
      {value.years.flatMap((year) => [
        <div className="demography__readout-item" key={`${year.year}-over65`}>
          <dt>{`${content.t('demography.readout.over65')} · ${year.year}`}</dt>
          <dd>{percentPoints(content, year.readout.over65)}</dd>
        </div>,
        <div className="demography__readout-item" key={`${year.year}-under20`}>
          <dt>{`${content.t('demography.readout.under20')} · ${year.year}`}</dt>
          <dd>{percentPoints(content, year.readout.under20)}</dd>
        </div>,
      ])}
    </dl>
  );
}

/** One generated sentence stating the claim the three shapes are evidence for. */
function findingSentence(value: PyramidValue, content: CountryLocaleContent): string {
  const first = value.years[0];
  const last = value.years[value.years.length - 1];
  if (!first || !last) return '';
  return content.t('demography.finding', {
    first: first.year,
    last: last.year,
    over65First: percentPoints(content, first.readout.over65),
    over65Last: percentPoints(content, last.readout.over65),
    under20First: percentPoints(content, first.readout.under20),
    under20Last: percentPoints(content, last.readout.under20),
  });
}

function tableColumns(value: PyramidValue, content: CountryLocaleContent): string[] {
  const male = content.t('demography.sex.male');
  const female = content.t('demography.sex.female');
  return [
    '',
    ...value.years.flatMap((year) => [`${male} ${year.year}`, `${female} ${year.year}`]),
  ];
}

function bandByYear(value: PyramidValue, band: number): BandShare[] {
  return value.years.map((year) => year.bands.find((entry) => entry.band === band) ?? { band, male: 0, female: 0, total: 0 });
}

function tableRows(value: PyramidValue, content: CountryLocaleContent): string[][] {
  return AGE_BANDS.map((band) => [
    bandLabel(band),
    ...bandByYear(value, band).flatMap((entry) => [percentPoints(content, entry.male), percentPoints(content, entry.female)]),
  ]);
}

/** The statement the block makes when the series has never been computed in this deployment. */
function UnavailableRow({ content }: { content: CountryLocaleContent }) {
  return (
    <section className="demography demography--unavailable" id="demografia" aria-labelledby="demography-heading" data-state="unavailable">
      <h2 id="demography-heading">{content.t('demography.heading')}</h2>
      <p>{content.t('figure.unavailable.reason')}</p>
      <a href="#metodo">{content.t('figure.methodLink')}</a>
    </section>
  );
}

/**
 * The age structure (T17, R1): a three-panel instrument, server-rendered, readable with no
 * JavaScript, carrying its own manifest. The table is emitted by the same component as the
 * chart, so there is no code path that renders one without the other (AC-001-97).
 */
export function PyramidPlate({ content, series, freshnessWindowDays }: PyramidPlateProps) {
  const value = series.value as PyramidValue | null;
  if (series.availability !== 'computed' || value === null) return <UnavailableRow content={content} />;
  const caption = content.t('demography.table.caption', {
    heading: content.t('demography.heading'),
    years: value.years.map((year) => year.year).join(', '),
    source: [...new Set(series.manifest.sourceUrl.map(publisherForUrl))].join(', '),
    series: [...new Set(series.manifest.sourceUrl.map(datasetForUrl))].join(' · '),
    variant: content.t('demography.variant'),
    // The shares are read against these totals, so the caption carries them: a table can be read
    // out of context, and a share without its denominator is an unverifiable claim.
    totals: value.years
      .map((year) => `${year.year}: ${formatValue(year.population, 'integer', content.locale, '')}`)
      .join(' · '),
    scope: content.country.name,
  });
  return (
    <section className="demography" id="demografia" aria-labelledby="demography-heading">
      <figure className="demography__figure">
        <figcaption className="demography__caption">
          <p className="plate__label">{content.t('demography.eyebrow')}</p>
          <h2 id="demography-heading">{content.t('demography.heading')}</h2>
          <p className="demography__finding">{findingSentence(value, content)}</p>
        </figcaption>
        <Readout value={value} content={content} />
        <div className="demography__panels">
          {value.years.map((year) => (
            <Panel year={year} content={content} axisMax={value.axisMaxPercent} key={year.year} />
          ))}
        </div>
        <DataTable
          id="demography-table"
          caption={caption}
          summaryLabel={content.t('demography.table.summary', { count: AGE_BANDS.length })}
          columns={tableColumns(value, content)}
          rows={tableRows(value, content)}
          nullLabel={content.t('table.notDefined')}
        />
      </figure>
      <ProvenanceStrip
        manifest={series.manifest}
        figureId={series.seriesId}
        freshnessWindowDays={freshnessWindowDays}
        content={content}
        derivedPath="data/derived/series"
      />
    </section>
  );
}
