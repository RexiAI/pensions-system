import { notFound, redirect } from 'next/navigation';
import { adminT } from '@/web/content/admin';
import { pageSession } from '@/web/admin/page-session';
import { createFileRevisionStore } from '@/web/admin/persistence';
import { approveBlocker } from '@/web/admin/revisions/pending-store';
import { mintReviewToken } from '@/web/admin/revisions/review-token';
import type { FigureChange, PendingRevision } from '@/web/admin/revisions/types';

export const dynamic = 'force-dynamic';

interface ReviewData {
  revision: PendingRevision;
  csrf: string;
  reviewToken: string;
  blocked: boolean;
}

async function reviewData(revisionId: string): Promise<ReviewData | null> {
  const revision = createFileRevisionStore().get(revisionId);
  if (!revision) return null;
  const auth = await pageSession();
  if (!auth.ok) redirect('/admin/login');
  return {
    revision,
    csrf: auth.session.csrf,
    reviewToken: mintReviewToken({ secret: auth.config.sessionSecret, revisionId: revision.id, now: new Date() }),
    blocked: approveBlocker(revision) !== null,
  };
}

function isChanged(change: FigureChange): boolean {
  return JSON.stringify(change.before) !== JSON.stringify(change.after);
}

function ReviewTable({ revision }: { revision: PendingRevision }) {
  return (
    <table className="admin-table">
      <caption>{`${revision.id} (${revision.changes.length})`}</caption>
      <thead>
        <tr>
          <th scope="col">{adminT('admin.review.col.figure')}</th>
          <th scope="col">{adminT('admin.review.col.before')}</th>
          <th scope="col">{adminT('admin.review.col.after')}</th>
          <th scope="col">{adminT('admin.review.col.delta')}</th>
          <th scope="col">{adminT('admin.review.col.source')}</th>
          <th scope="col">{adminT('admin.review.col.snapshot')}</th>
          <th scope="col">{adminT('admin.review.col.hash')}</th>
        </tr>
      </thead>
      <tbody>
        {revision.changes.map((change) => (
          <tr key={change.figureId} data-changed={isChanged(change)}>
            <th scope="row">{change.figureId}</th>
            <td>{JSON.stringify(change.before)}</td>
            <td>{JSON.stringify(change.after)}</td>
            <td>{isChanged(change) ? adminT('admin.review.changed') : adminT('admin.review.unchanged')}</td>
            <td>{change.source.join(' ')}</td>
            <td>{change.fetchedAt}</td>
            <td>
              <code>{change.inputHash.slice(0, 12)}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ApprovalForm({ revisionId, csrf, reviewToken }: { revisionId: string; csrf: string; reviewToken: string }) {
  return (
    <details>
      <summary className="admin-btn">{adminT('admin.review.approve')}</summary>
      <form action={`/api/admin/revisions/${encodeURIComponent(revisionId)}/approve`} method="post">
        <input type="hidden" name="csrf" value={csrf} />
        <input type="hidden" name="reviewToken" value={reviewToken} />
        <label>
          <input type="checkbox" name="consent" required /> {adminT('admin.review.consent')}
        </label>
        <button className="admin-btn" type="submit">
          {adminT('admin.review.publish')}
        </button>
      </form>
    </details>
  );
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await reviewData(decodeURIComponent(id));
  if (!data) notFound();
  const changed = data.revision.changes.filter(isChanged);
  return (
    <section>
      <h1>{`${adminT('admin.review.title')} ${data.revision.id}`}</h1>
      <p className="blast-radius">
        {`${adminT('admin.review.blastPrefix')} ${changed.length} ${adminT('admin.review.blastSuffix')} ${adminT('admin.review.blastNote')}`}
      </p>
      {data.blocked ? <p className="admin-failure">{adminT('admin.review.superseded')}</p> : null}
      <ReviewTable revision={data.revision} />
      {data.blocked ? null : (
        <ApprovalForm revisionId={data.revision.id} csrf={data.csrf} reviewToken={data.reviewToken} />
      )}
    </section>
  );
}
