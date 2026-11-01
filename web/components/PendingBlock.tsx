import { FIGURE_KEYS, figureReasonKey } from '../content/keys';
import { formatCount } from '../content/format';
import type { CountryLocaleContent } from '../content/types';
import type { DerivedFigure } from '../ingest/types';
import { FigureStatusRow } from './FigureStatusRow';
import { figureNumberOf } from './metrics/views';

export interface PendingBlockProps {
  content: CountryLocaleContent;
  /** The figures whose availability is not `computed`, in figure order. */
  figures: readonly DerivedFigure[];
}

/** The figures the block collects: every one the data does not publish as `computed`. */
export function pendingFigures(figures: readonly DerivedFigure[]): DerivedFigure[] {
  return figures.filter((figure) => figure.availability !== 'computed');
}

/**
 * "En preparación" (spec 003 T5): every figure without a computed value, in one block, headed
 * with the count taken from the data and the state chip stated once. Each row keeps what
 * AC-001-77/84/87 require — the figure's name and anchor, its published definition, its reason
 * and its method link — and nothing a value would carry: no chart, no table, no digest, no
 * reproduce command, no substitute number. No unavailable figure, no block.
 */
export function PendingBlock({ content, figures }: PendingBlockProps) {
  if (figures.length === 0) return null;
  const headingKey = figures.length === 1 ? 'pending.heading.one' : 'pending.heading.other';
  return (
    <section className="pending" aria-labelledby="pending-heading">
      <h2 className="pending__heading" id="pending-heading">
        {content.t(headingKey, { count: formatCount(figures.length, content.locale) })}{' '}
        <span className="figure-row__chip">{content.t('figure.unavailable.chip')}</span>
      </h2>
      {figures.map((figure) => {
        const number = figureNumberOf(figure);
        return (
          <FigureStatusRow
            key={figure.figureId}
            figureNumber={number}
            content={content}
            state="unavailable"
            definition={content.t(FIGURE_KEYS[number].definition)}
            reason={content.t(figureReasonKey(number))}
            nested
          />
        );
      })}
    </section>
  );
}
