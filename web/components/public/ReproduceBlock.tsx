import { FIGURE_ID_KEYS, SERIES_TITLE_KEYS } from '../../content/keys';
import { formatCount, formatDate } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import type { DerivedSeries } from '../../ingest/series-types';
import { reproduceCommand, seriesReproduceCommand } from '../reproduce-command';

export interface ReproduceBlockProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  series?: readonly DerivedSeries[];
}

interface Row {
  id: string;
  title: string;
  formulaId: string;
  fetchedAt: string;
  inputHash: string;
  command: string;
}

/**
 * The harness made visible: formula id, snapshot date, full digest, and the command — for the
 * artefacts that exist, and only those.
 *
 * R6's measured defect was here: mapping over every derived figure advertised a digest and a
 * command for five figures that publish no value. A row now exists only for a `computed`
 * figure or series, the counts are derived from the data, and the omitted line disappears when
 * there is nothing to omit — so the sentence can never become false.
 */
export function ReproduceBlock({ content, figures, series = [] }: ReproduceBlockProps) {
  const computedFigures = figures.filter((figure) => figure.availability === 'computed');
  const computedSeries = series.filter((entry) => entry.availability === 'computed');
  const unavailable = figures.length - computedFigures.length;
  const figureRows: Row[] = computedFigures.map((figure) => ({
    id: figure.figureId,
    title: figureLabel(content, figure.figureId),
    formulaId: figure.formulaId,
    fetchedAt: figure.manifest.fetchedAt,
    inputHash: figure.manifest.inputHash,
    command: reproduceCommand(figure.manifest, figure.figureId),
  }));
  const seriesRows: Row[] = computedSeries.map((entry) => ({
    id: entry.seriesId,
    title: seriesLabel(content, entry.seriesId),
    formulaId: entry.formulaId,
    fetchedAt: entry.manifest.fetchedAt,
    inputHash: entry.manifest.inputHash,
    command: seriesReproduceCommand(entry.manifest, entry.seriesId),
  }));
  return (
    <section className="reproduce" id="reproducir" aria-labelledby="reproduce-heading" data-operator="true">
      <h2 id="reproduce-heading">{content.t('reproduce.heading')}</h2>
      <p>{content.t('reproduce.body')}</p>
      <p className="reproduce__count">
        {countLabel(content, 'figures', computedFigures.length)}
        {' · '}
        {countLabel(content, 'series', computedSeries.length)}
      </p>
      {figureRows.map((row) => (
        <ReproduceRow content={content} row={row} key={row.id} />
      ))}
      {seriesRows.map((row) => (
        <ReproduceRow content={content} row={row} key={row.id} />
      ))}
      {unavailable > 0 ? (
        <p className="reproduce__omitted">
          {content.t('reproduce.omitted', {
            unavailable: formatCount(unavailable, content.locale),
            total: formatCount(figures.length, content.locale),
          })}
        </p>
      ) : null}
    </section>
  );
}

/**
 * The label behind an id, by lookup. Never arithmetic on the last character of the id: that
 * works only while every id is numbered `fig-0N`, and silently picks the wrong title the moment
 * a non-numbered artefact enters the section.
 */
function figureLabel(content: CountryLocaleContent, figureId: string): string {
  const keys = FIGURE_ID_KEYS[figureId];
  return keys ? content.t(keys.title) : figureId;
}

function seriesLabel(content: CountryLocaleContent, seriesId: string): string {
  const key = SERIES_TITLE_KEYS[seriesId];
  return key ? content.t(key) : seriesId;
}

/** `1 figura calculada` / `2 figuras calculadas`, from the data, never an authored plural. */
function countLabel(
  content: CountryLocaleContent,
  kind: 'figures' | 'series',
  count: number,
): string {
  const singularKey = kind === 'figures' ? 'reproduce.count.figure' : 'reproduce.count.serie';
  const pluralKey = kind === 'figures' ? 'reproduce.count.figures' : 'reproduce.count.series';
  return content.t(count === 1 ? singularKey : pluralKey, { count: formatCount(count, content.locale) });
}

function ReproduceRow({ content, row }: { content: CountryLocaleContent; row: Row }) {
  return (
    <div className="reproduce__row">
      <span>{row.title}</span>
      <code>{row.formulaId}</code>
      <time dateTime={row.fetchedAt}>{formatDate(row.fetchedAt, content.locale)}</time>
      <code className="hash hash--full">{row.inputHash}</code>
      <code>{row.command}</code>
    </div>
  );
}
