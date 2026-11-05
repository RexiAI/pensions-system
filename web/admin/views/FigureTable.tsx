import { adminT } from '../../content/admin';
import type { DerivedFigure } from '../../ingest/types';

/**
 * One row per figure, in the derived store's own order, with its id and its availability
 * (spec 004 T11). The five figures that left the public page are still the operator's business: a
 * figure with no value is a data problem to see, not a block to render.
 *
 * Nothing here is hard-coded — the ids, the count and the availability values all come from the
 * store — and every visible string resolves from `adminT`, so the list cannot drift from the data
 * it reports or invent a vocabulary of its own.
 */
export function FigureTable({ figures }: { figures: readonly DerivedFigure[] }) {
  return (
    <table className="admin-table">
      <caption>{`${adminT('admin.home.figureList')} (${figures.length})`}</caption>
      <thead>
        <tr>
          <th scope="col">{adminT('admin.review.col.figure')}</th>
          <th scope="col">{adminT('admin.home.figureAvailability')}</th>
        </tr>
      </thead>
      <tbody>
        {figures.map((figure) => (
          <tr key={figure.figureId}>
            <th scope="row">{figure.figureId}</th>
            <td>{figure.availability}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
