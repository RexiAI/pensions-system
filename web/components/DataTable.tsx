import type { ReactNode } from 'react';

/** The table's own description: what it is, its column headers, its rows and its absent-value label. */
export interface TableProps {
  caption: string;
  columns: readonly string[];
  rows: ReadonlyArray<ReadonlyArray<string | null>>;
  nullLabel: string;
}

export interface DataTableProps {
  id: string;
  summaryLabel: string;
  /** The table the disclosure hosts, described once and handed over whole. */
  table: TableProps;
  /**
   * Content that belongs with the table inside its disclosure — the age structure's finding
   * sentence and six-value readout (spec 004 T4). One disclosure, one summary: the alternative
   * was nesting a second `<details>` inside this one.
   */
  children?: ReactNode;
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

/** The header row: one column header per column, in the order the columns are given. */
function TableHead({ columns }: { columns: readonly string[] }) {
  return (
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th scope="col" key={`${column}-${index}`}>
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** The table element: one caption, one column header per column and one row header per row. */
function Table({ caption, columns, rows, nullLabel }: TableProps) {
  return (
    <table>
      <caption>{caption}</caption>
      <TableHead columns={columns} />
      <tbody>
        {rows.map((row, rowIndex) => (
          <TableRow row={row} rowIndex={rowIndex} nullLabel={nullLabel} key={`row-${rowIndex}`} />
        ))}
      </tbody>
    </table>
  );
}

/**
 * The accessible representation of every chart (T11): a real table with a caption,
 * column headers and a row header per row, present in the DOM before any disclosure.
 */
export function DataTable({ id, summaryLabel, table, children }: DataTableProps) {
  return (
    <details className="data-table" id={id}>
      <summary>{summaryLabel}</summary>
      {children}
      <div className="data-table__scroll" tabIndex={0} role="region" aria-label={table.caption}>
        <Table {...table} />
      </div>
    </details>
  );
}
