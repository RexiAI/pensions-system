import { FIGURE_IDS } from '../../ingest/types';
import type { DerivedFigure } from '../../ingest/types';
import type { CountryLocaleContent } from '../../content/types';
import { FigureLedgerNote } from '../FigureLedgerNote';
import { MetricPlate } from '../metrics/MetricPlate';
import { figureNumberOf, viewStateFor } from '../metrics/views';
import { isLedgerState } from '../metrics/figure-state';
import { SubjectFacts } from './SubjectFacts';

export interface FiguresRegionProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  freshnessWindowDays: number;
}

/** The figures this region publishes: the ones the data says are computed, in `FIGURE_IDS` order. */
function publishedFigures(figures: readonly DerivedFigure[]): DerivedFigure[] {
  return FIGURE_IDS.map((figureId) => figures.find((figure) => figure.figureId === figureId)).filter(
    (figure): figure is DerivedFigure => figure !== undefined && figure.availability === 'computed',
  );
}

/** One figure's slot: the ledger note where it belongs, then the plate and the facts it is read with. */
function FigureSlot({
  figure,
  content,
  freshnessWindowDays,
  leadingLedgerNote,
}: {
  figure: DerivedFigure;
  content: CountryLocaleContent;
  freshnessWindowDays: number;
  leadingLedgerNote: boolean;
}) {
  return (
    <div className="figure-slot">
      {leadingLedgerNote ? <FigureLedgerNote content={content} /> : null}
      <MetricPlate
        figureNumber={figureNumberOf(figure)}
        figure={figure}
        content={content}
        freshnessWindowDays={freshnessWindowDays}
      />
      <SubjectFacts content={content} figure={figure} />
    </div>
  );
}

/**
 * The appendix (spec 004 T10): one plate per computed figure, in figure order, and nothing else.
 *
 * A figure whose availability is not `computed` never reaches this region — no pending block, no
 * "sin calcular" chip, no reason line, no greyed-out plate. The region heading is outside the
 * `#figuras` element (so the anchor lands on the first plate) and it does not render when there is
 * nothing to head. `FigureStatusRow` is still reachable: a figure that claims `computed` while
 * carrying no value or a broken manifest is promoted to `withheld` by `figureState`, which is a
 * data-integrity failure and must not be hidden.
 */
export function FiguresRegion({ content, figures, freshnessWindowDays }: FiguresRegionProps) {
  const published = publishedFigures(figures);
  const firstLedger = published.find((figure) => isLedgerState(viewStateFor({ figure, content })))?.figureId;
  return (
    <>
      {published.length === 0 ? null : <h2 className="region__heading">{content.t('nav.figures')}</h2>}
      <div id="figuras">
        {published.map((figure) => (
          <FigureSlot
            key={figure.figureId}
            figure={figure}
            content={content}
            freshnessWindowDays={freshnessWindowDays}
            leadingLedgerNote={figure.figureId === firstLedger}
          />
        ))}
      </div>
    </>
  );
}
