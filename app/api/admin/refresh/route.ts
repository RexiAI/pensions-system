import { appendAuditEntry } from '@/web/admin/audit/log';
import { guardedForm } from '@/web/admin/guards';
import { envOr, redirectTo, requestId } from '@/web/admin/http';
import { readAudit, writeAudit } from '@/web/admin/persistence';
import { dispatchRefreshWorkflow, REFRESH_WORKFLOW_FILE } from '@/web/admin/revisions/dispatch';
import { adminT } from '@/web/content/admin';

function auditTarget(ok: boolean, id: string): string {
  return ok ? id : 'dispatch';
}

/**
 * Triggers the ingest workflow. The computation itself never runs here (T14): this route
 * dispatches `workflow_dispatch`. No upstream error body reaches the operator.
 */
export async function POST(request: Request): Promise<Response> {
  const guard = await guardedForm(request);
  if (!guard.ok) return guard.response;

  const id = requestId();
  const dispatched = await dispatchRefreshWorkflow({
    fetchImpl: fetch,
    token: envOr('GITHUB_ACTIONS_TOKEN', ''),
    owner: envOr('GITHUB_REPOSITORY_OWNER', ''),
    repo: envOr('GITHUB_REPOSITORY_NAME', ''),
    workflowFile: REFRESH_WORKFLOW_FILE,
    ref: envOr('GITHUB_REF_NAME', 'main'),
  });

  writeAudit(
    appendAuditEntry(readAudit(), {
      at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      identity: 'admin',
      action: 'refresh.dispatched',
      target: auditTarget(dispatched.ok, id),
      before: null,
      after: adminT(dispatched.ok ? 'admin.audit.refreshDispatched' : 'admin.status.failed'),
      requestId: id,
    }),
  );

  if (!dispatched.ok) return redirectTo(request, '/admin?error=dispatch');
  return redirectTo(request, `/admin/refresh/${id}`);
}
