import { adminT } from '../../content/admin';
import type { AuditEntry } from '../audit/log';
import { verifyAuditChain } from '../audit/log';
import { ChainStatus } from './ChainStatus';

function AuditHead() {
  return (
    <thead>
      <tr>
        <th scope="col">{adminT('admin.audit.col.time')}</th>
        <th scope="col">{adminT('admin.audit.col.identity')}</th>
        <th scope="col">{adminT('admin.audit.col.action')}</th>
        <th scope="col">{adminT('admin.audit.col.target')}</th>
        <th scope="col">{adminT('admin.audit.col.change')}</th>
        <th scope="col">{adminT('admin.audit.col.request')}</th>
      </tr>
    </thead>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const before = entry.before ?? adminT('admin.review.unchanged');
  return (
    <tr>
      <th scope="row">
        <time dateTime={entry.at}>{entry.at}</time>
      </th>
      <td>{entry.identity}</td>
      <td>{entry.action}</td>
      <td>{entry.target}</td>
      <td>{`${before} → ${entry.after ?? ''}`}</td>
      <td>
        <code>{entry.requestId}</code>
      </td>
    </tr>
  );
}

export interface AuditTableProps {
  entries: readonly AuditEntry[];
  filterLabel?: string;
  verifiedAt?: string | null;
}

/**
 * The audit table accepts no `actions` prop, has no checkboxes and no row menu: it is
 * structurally incapable of offering an edit. The caption restates the filter in force and
 * the entry count, so a filtered view cannot be mistaken for the complete record.
 */
export function AuditTable({ entries, filterLabel = '', verifiedAt = null }: AuditTableProps) {
  const chain = verifyAuditChain(entries, verifiedAt);
  return (
    <section className="audit" aria-labelledby="audit-heading">
      <h1 id="audit-heading">{adminT('admin.audit.title')}</h1>
      <ChainStatus verifiedAt={chain.valid ? verifiedAt : null} />
      <table className="audit__table">
        <caption>{`${filterLabel} (${entries.length})`}</caption>
        <AuditHead />
        <tbody>
          {entries.map((entry) => (
            <AuditRow key={entry.seq} entry={entry} />
          ))}
        </tbody>
      </table>
      {entries.length === 0 ? <p>{adminT('admin.audit.empty')}</p> : null}
      <p className="audit__append-only">{adminT('admin.audit.appendOnly')}</p>
    </section>
  );
}
