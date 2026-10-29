import { citationRegistry } from '@/web/content/citations';
import { contentRegistry } from '@/web/content/registry';
import { guardedForm } from '@/web/admin/guards';
import { formValue, redirectTo, requestId } from '@/web/admin/http';
import { createFileRevisionStore, readAudit, writeAudit } from '@/web/admin/persistence';
import { approveRevision } from '@/web/admin/revisions/approve';
import { createFileDerivedStore } from '@/web/derived/store';

function contentForApproval() {
  const locale = contentRegistry.get('ES', 'es');
  if (!locale.ok) return {};
  return {
    agreement: locale.content.editorial.agreement,
    disputes: locale.content.editorial.disputes,
    citations: citationRegistry,
  };
}

/** Publishes a reviewed revision: session, CSRF, review token, manifest and citation gates. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await guardedForm(request);
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const { id } = await context.params;
  const revisionId = decodeURIComponent(id);
  const content = contentForApproval();
  const result = approveRevision({
    revisionId,
    reviewToken: formValue(form, 'reviewToken'),
    csrfHeader: formValue(form, 'csrf'),
    session: guard.session,
    secret: guard.secret,
    store: createFileRevisionStore(),
    derived: createFileDerivedStore(),
    audit: readAudit(),
    now: new Date(),
    requestId: requestId(),
    ...content,
  });

  if (!result.ok) {
    return redirectTo(request, `/admin/revisions/${encodeURIComponent(revisionId)}?error=${result.reason}`);
  }
  writeAudit(result.audit);
  return redirectTo(request, `/admin/revisions/${encodeURIComponent(revisionId)}?published=1`);
}
