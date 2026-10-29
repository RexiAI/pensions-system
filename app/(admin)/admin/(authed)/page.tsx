import { adminT } from '@/web/content/admin';
import { DEFAULT_FRESHNESS_WINDOW_DAYS, loadAdminConfig } from '@/web/admin/config';
import { pageSession } from '@/web/admin/page-session';
import { createFileRevisionStore, readAudit } from '@/web/admin/persistence';
import { pendingFor } from '@/web/admin/revisions/pending-store';
import type { PendingRevision } from '@/web/admin/revisions/types';
import { createFileDerivedStore } from '@/web/derived/store';
import type { DerivedFigure } from '@/web/ingest/types';

interface PanelData {
  csrf: string;
  figures: DerivedFigure[];
  pending: PendingRevision[];
  auditCount: number;
  publishedId: string;
  publishedCommit: string;
  window: number;
}

function optional<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback;
}

async function csrfOf(): Promise<string> {
  const auth = await pageSession();
  return auth.ok ? auth.session.csrf : '';
}

function revisionsState() {
  const revisions = createFileRevisionStore();
  const published = [...revisions.list()].reverse().find((revision) => revision.status === 'published');
  return {
    pending: pendingFor(revisions),
    publishedId: optional(published?.id, '-'),
    publishedCommit: optional(published?.publishedCommit, '-'),
  };
}

function windowOf(): number {
  const config = loadAdminConfig(process.env);
  return config.ok ? config.config.freshnessWindowDays : DEFAULT_FRESHNESS_WINDOW_DAYS;
}

async function panelData(): Promise<PanelData> {
  const state = revisionsState();
  return {
    csrf: await csrfOf(),
    figures: createFileDerivedStore().readAll(),
    pending: state.pending,
    auditCount: readAudit().length,
    publishedId: state.publishedId,
    publishedCommit: state.publishedCommit,
    window: windowOf(),
  };
}

function PendingTable({ pending }: { pending: readonly PendingRevision[] }) {
  if (pending.length === 0) return <p>{adminT('admin.home.empty')}</p>;
  return (
    <table className="admin-table">
      <caption>{`${adminT('admin.home.pending')} (${pending.length})`}</caption>
      <thead>
        <tr>
          <th scope="col">{adminT('admin.review.col.figure')}</th>
          <th scope="col">{adminT('admin.home.snapshot')}</th>
          <th scope="col">{adminT('admin.audit.col.action')}</th>
        </tr>
      </thead>
      <tbody>
        {pending.map((revision) => (
          <tr key={revision.id}>
            <th scope="row">
              <a href={`/admin/revisions/${encodeURIComponent(revision.id)}`}>{revision.id}</a>
            </th>
            <td>{revision.snapshotHash.slice(0, 12)}</td>
            <td>{adminT('admin.status.pending')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function PanelHome() {
  const data = await panelData();
  const snapshot = data.figures[0]?.manifest.fetchedAt ?? '-';
  return (
    <section>
      <h1>{adminT('admin.home.published')}</h1>
      <p>
        <span>{`${adminT('admin.home.revision')} `}</span>
        <strong>{data.publishedId}</strong>
      </p>
      <dl>
        <dt>{adminT('admin.home.figures')}</dt>
        <dd>{data.figures.length}</dd>
        <dt>{adminT('admin.home.snapshot')}</dt>
        <dd>{snapshot}</dd>
        <dt>{adminT('admin.home.window')}</dt>
        <dd>{data.window}</dd>
        <dt>{adminT('admin.home.commit')}</dt>
        <dd>{data.publishedCommit}</dd>
      </dl>
      <p>
        <a href="/">{adminT('admin.home.publicSite')}</a>
      </p>

      <form action="/api/admin/refresh" method="post">
        <input type="hidden" name="csrf" value={data.csrf} />
        <button className="admin-btn" type="submit">
          {adminT('admin.home.refresh')}
        </button>
      </form>
      <p>{data.pending.length > 0 ? adminT('admin.home.refreshDisabled') : adminT('admin.home.refreshNote')}</p>

      <h2>{adminT('admin.home.pending')}</h2>
      <PendingTable pending={data.pending} />
      <p>
        <a href="/admin/audit">{`${adminT('admin.home.audit')} (${data.auditCount})`}</a>
      </p>
    </section>
  );
}
