import { adminT } from '../../content/admin';
import type { CitationRegistry } from '../../content/citations';
import { validateContentForPublication } from '../../content/citations';
import type { AgreementClaim, DisputedClaim } from '../../content/types';
import type { DerivedFigureStore } from '../../derived/store';
import { committedFileExists } from '../../manifest/repo-file';
import { validateManifest } from '../../manifest/validate';
import type { AuditEntry } from '../audit/log';
import { appendAuditEntry } from '../audit/log';
import { verifyCsrf } from '../auth/csrf';
import type { SessionPayload } from '../auth/session';
import { approveBlocker } from './pending-store';
import { verifyReviewToken } from './review-token';
import { changeToFigure } from './types';
import type { PendingRevision, RevisionStore } from './types';

export type ApprovalFailure =
  | 'csrf'
  | 'review-token'
  | 'not-found'
  | 'superseded'
  | 'published'
  | 'manifest-invalid'
  | 'uncited-content';

export type ApprovalResult =
  | { ok: true; published: string[]; audit: AuditEntry[] }
  | { ok: false; reason: ApprovalFailure; detail?: string };

export interface ApprovalRequest {
  revisionId: string;
  reviewToken: string | undefined;
  csrfHeader: string | undefined;
  session: SessionPayload;
  secret: string;
  store: RevisionStore;
  derived: DerivedFigureStore;
  audit: readonly AuditEntry[];
  now: Date;
  requestId: string;
  commit?: string;
  /** Content the revision would publish, when it publishes content too (AC-001-68). */
  content?: { agreement: readonly AgreementClaim[]; disputes: readonly DisputedClaim[] };
  citations?: CitationRegistry;
  fileExists?: (path: string) => boolean;
}

function validateChanges(
  revision: PendingRevision,
  fileExists: (path: string) => boolean,
): { ok: true } | { ok: false; detail: string } {
  for (const change of revision.changes) {
    const validation = validateManifest(change.manifest, { fileExists });
    if (!validation.ok) {
      return {
        ok: false,
        detail: `${change.figureId}: ${validation.problems.map((p) => `${p.field}:${p.code}`).join(', ')}`,
      };
    }
  }
  return { ok: true };
}

function contentGate(
  request: ApprovalRequest,
): { ok: true } | { ok: false; detail: string } {
  if (!request.content || !request.citations) return { ok: true };
  const gate = validateContentForPublication(request.content, request.citations);
  if (gate.ok) return { ok: true };
  return { ok: false, detail: gate.failures.map((failure) => `${failure.unit}:${failure.reason}`).join(', ') };
}

/**
 * Publishes a reviewed revision. Four independent gates must pass: the CSRF token, the
 * revision-bound review token, the revision's own status (a superseded revision can never
 * be approved), and the manifests of what would be published. The audit entry is written
 * in the same call, so a publication without a record cannot happen.
 */
interface GateFailure {
  reason: ApprovalFailure;
  detail?: string;
}

function csrfGate(request: ApprovalRequest): GateFailure | null {
  return verifyCsrf(request.csrfHeader, request.session) ? null : { reason: 'csrf' };
}

function tokenGate(request: ApprovalRequest): GateFailure | null {
  const token = verifyReviewToken({
    token: request.reviewToken,
    revisionId: request.revisionId,
    secret: request.secret,
    now: request.now,
  });
  return token.ok ? null : { reason: 'review-token', detail: token.reason };
}

function revisionGate(request: ApprovalRequest): { revision: PendingRevision } | GateFailure {
  const revision = request.store.get(request.revisionId);
  if (!revision) return { reason: 'not-found' };
  const blocker = approveBlocker(revision);
  return blocker ? { reason: blocker } : { revision };
}

function manifestGate(request: ApprovalRequest, revision: PendingRevision): GateFailure | null {
  const result = validateChanges(revision, request.fileExists ?? committedFileExists);
  return result.ok ? null : { reason: 'manifest-invalid', detail: result.detail };
}

function citationGate(request: ApprovalRequest): GateFailure | null {
  const result = contentGate(request);
  return result.ok ? null : { reason: 'uncited-content', detail: result.detail };
}

function isFailure(value: { revision: PendingRevision } | GateFailure): value is GateFailure {
  return 'reason' in value;
}

/**
 * Publishes a reviewed revision. Four independent gates must pass: the CSRF token, the
 * revision-bound review token, the revision's own status (a superseded revision can never
 * be approved), and the manifests of what would be published. The audit entry is written
 * in the same call, so a publication without a record cannot happen.
 */
export function approveRevision(request: ApprovalRequest): ApprovalResult {
  const early = csrfGate(request) ?? tokenGate(request);
  if (early) return { ok: false, ...early };
  const found = revisionGate(request);
  if (isFailure(found)) return { ok: false, ...found };
  const late = manifestGate(request, found.revision) ?? citationGate(request);
  if (late) return { ok: false, ...late };
  return publish(request, found.revision);
}

function publish(request: ApprovalRequest, revision: PendingRevision): ApprovalResult {
  for (const change of revision.changes) request.derived.write(changeToFigure(change));
  request.store.save({
    ...revision,
    status: 'published',
    ...(request.commit ? { publishedCommit: request.commit } : {}),
  });
  const audit = appendAuditEntry(request.audit, {
    at: request.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    identity: 'admin',
    action: 'revision.published',
    target: revision.id,
    before: adminT('admin.status.pending'),
    after: adminT('admin.audit.revisionPublished'),
    requestId: request.requestId,
  });
  return { ok: true, published: revision.changes.map((change) => change.figureId), audit };
}
