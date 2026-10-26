export interface DataTableProps {
  id: string;
  caption: string;
  summaryLabel: string;
  columns: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<string | null>>;
  nullLabel: string;
}

function TableRow({ row, rowIndex, nullLabel }: { row: ReadonlyArray<string | null>; rowIndex: number; nullLabel: string }) {
  return (
    <tr>
      {row.map((cell, cellIndex) => {
        const value = cell ?? nullLabel;
        const key = `cell-${rowIndex}-${cellIndex}`;
        return cellIndex === 0 ? (
          <th scope="row" key={key}>
            {value}
          </th>
        ) : (
          <td key={key}>{value}</td>
        );
      })}
    </tr>
  );
}

/**
 * The accessible representation of every chart (T11): a real table with a caption,
 * column headers and a row header per row, present in the DOM before any disclosure.
 */
export function DataTable({ id, caption, summaryLabel, columns, rows, nullLabel }: DataTableProps) {
  return (
    <details className="data-table" id={id}>
      <summary>{summaryLabel}</summary>
      <div className="data-table__scroll" tabIndex={0} role="region" aria-label={caption}>
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th scope="col" key={`${column}-${index}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <TableRow row={row} rowIndex={rowIndex} nullLabel={nullLabel} key={`row-${rowIndex}`} />
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
