import { FIGURE_ID_KEYS } from '../../content/keys';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { datasetForUrl, publisherForUrl } from '../../sources/labels';

export interface SubjectFactsProps {
  content: CountryLocaleContent;
  figure: DerivedFigure;
}

interface DatedPoint {
  period?: string | number;
  year?: number;
}

/** The years the figure's own series covers, from the points it publishes; absent if it has none. */
function periodOf(figure: DerivedFigure): string | null {
  const points = (figure.value as { points?: readonly DatedPoint[] } | null)?.points;
  if (points === undefined || points.length === 0) return null;
  return span(points[0], points[points.length - 1]);
}

/** The span two dated points describe, or `null` when either publishes no label. */
function span(first: DatedPoint | undefined, last: DatedPoint | undefined): string | null {
  const from = pointsLabel(first);
  const to = pointsLabel(last);
  if (from === '' || to === '') return null;
  return from === to ? from : `${from}-${to}`;
}

/** A dated point's own label, from whichever column the metric publishes. */
function pointsLabel(point: DatedPoint | undefined): string {
  return point === undefined ? '' : String(point.period ?? point.year ?? '');
}

function joined(figure: DerivedFigure, pick: (url: string) => string, separator: string): string {
  return [...new Set(figure.manifest.sourceUrl.map(pick))].join(separator);
}

/** One fact, as the label/value pair a plate is read with. */
interface Fact {
  label: string;
  value: string;
}

/**
 * The four facts as label/value pairs, in reading order. The definition and the period are left
 * out entirely when the figure publishes none — not rendered as an empty row.
 */
function factsOf(content: CountryLocaleContent, figure: DerivedFigure): Fact[] {
  const facts: Fact[] = [];
  const definition = FIGURE_ID_KEYS[figure.figureId]?.definition;
  if (definition !== undefined) {
    facts.push({ label: content.t('hero.definitionLabel'), value: content.t(definition) });
  }
  const period = periodOf(figure);
  if (period !== null) facts.push({ label: content.t('hero.periodLabel'), value: period });
  facts.push(
    { label: content.t('provenance.source'), value: joined(figure, publisherForUrl, ', ') },
    { label: content.t('provenance.dataset'), value: joined(figure, datasetForUrl, ' · ') },
  );
  return facts;
}

/**
 * The four facts a plate is read with — its definition, the period it covers, its publisher and
 * its series — beside the plate they belong to, inside `#figuras` (spec 004 T12).
 *
 * They used to sit in the hero panel at the top of the page, where a reader met them before the
 * number they describe. Same keys, same values, same instrument register; the position is the
 * appendix, next to the chart each one explains.
 */
export function SubjectFacts({ content, figure }: SubjectFactsProps) {
  return (
    <dl className="hero__subject">
      {factsOf(content, figure).map((fact) => (
        <div className="hero__subject-field" key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
