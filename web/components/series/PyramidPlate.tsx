import { AGE_BANDS, bandLabel } from '../../series/age-bands';
import type { BandShare, PyramidValue } from '../../series/age-structure';
import { formatValue } from '../../content/format';
import { publisherForUrl } from '../../sources/labels';
import type { CountryLocaleContent } from '../../content/types';
import { DataTable } from '../DataTable';
import type { DerivedSeries } from '../../ingest/series-types';
import { Panel } from './PyramidPanel';

export interface PyramidPlateProps {
  content: CountryLocaleContent;
  series: DerivedSeries;
}

/** A share as the published percentage point, with the content model's own null label. */
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
  return value.years.map(
    (year) => year.bands.find((entry) => entry.band === band) ?? { band, male: 0, female: 0, total: 0 },
  );
}

function tableRows(value: PyramidValue, content: CountryLocaleContent): string[][] {
  return AGE_BANDS.map((band) => [
    bandLabel(band),
    ...bandByYear(value, band).flatMap((entry) => [
      percentPoints(content, entry.male),
      percentPoints(content, entry.female),
    ]),
  ]);
}

function tableCaption(
  value: PyramidValue,
  series: DerivedSeries,
  content: CountryLocaleContent,
): string {
  return content.t('demography.table.caption', {
    heading: content.t('demography.heading'),
    years: value.years.map((year) => year.year).join(', '),
    source: [...new Set(series.manifest.sourceUrl.map(publisherForUrl))].join(', '),
    // The caption sits inside the story, so it names the series by its public title: the dataset
    // identifiers belong to the operator register and to `#metodo`, never above the fold (T9).
    series: content.t('series.pyramid.title'),
    variant: content.t('demography.variant'),
    // The shares are read against these totals, so the caption carries them: a table can be read
    // out of context, and a share without its denominator is an unverifiable claim.
    totals: value.years
      .map((year) => `${year.year}: ${formatValue(year.population, 'integer', content.locale, '')}`)
      .join(' · '),
    scope: content.country.name,
  });
}

/** The disclosure that hosts the finding sentence, the six-value readout and the data table. */
function PyramidTable({
  value,
  series,
  content,
}: {
  value: PyramidValue;
  series: DerivedSeries;
  content: CountryLocaleContent;
}) {
  return (
    <DataTable
      id="demography-table"
      summaryLabel={content.t('demography.table.summary', { count: AGE_BANDS.length })}
      table={{
        caption: tableCaption(value, series, content),
        columns: tableColumns(value, content),
        rows: tableRows(value, content),
        nullLabel: content.t('table.notDefined'),
      }}
    >
      <p className="demography__finding">{findingSentence(value, content)}</p>
      <Readout value={value} content={content} />
    </DataTable>
  );
}

/**
 * The age structure (T17, R1; re-composed by spec 004 T4): three panels side by side, one
 * annotation each, and one disclosure that hosts the finding sentence, the six-value readout and
 * the data table.
 *
 * Two rules the re-composition turns into structure rather than restraint: the face of the chart
 * carries no percentage (the ten numerals the block used to open with are inside the disclosure),
 * and the component renders nothing at all when the series has no computed value — no "en
 * preparación" row, no method link, no heading (AC-004-19). The table is still emitted by this
 * component and only together with the charts (AC-001-97).
 */
export function PyramidPlate({ content, series }: PyramidPlateProps) {
  const value = series.value as PyramidValue | null;
  if (series.availability !== 'computed' || value === null) return null;
  return (
    <div className="demography" id="demografia">
      <div className="demography__panels">
        {value.years.map((year) => (
          <Panel year={year} content={content} axisMax={value.axisMaxPercent} key={year.year} />
        ))}
      </div>
      <PyramidTable value={value} series={series} content={content} />
    </div>
  );
}
