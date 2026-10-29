import { guardedForm } from '@/web/admin/guards';
import { formValue, redirectTo, requestId } from '@/web/admin/http';
import { readAudit, readProposals, writeAudit, writeProposal } from '@/web/admin/persistence';
import { createParameterStore } from '@/web/admin/parameters/parameter-set';
import { acceptProposal, rejectProposal } from '@/web/admin/parameters/proposal';
import type { ParameterProposal } from '@/web/admin/parameters/proposal';

function isReviewable(proposal: ParameterProposal | undefined): proposal is ParameterProposal {
  return proposal !== undefined && proposal.status === 'pending-review';
}

/**
 * Accepts or rejects a parameter proposal. Accepting commits the rule and publishes no
 * figure: the writer handle can only set an enumerated parameter (AC-001-63, AC-001-73).
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const guard = await guardedForm(request);
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const { id } = await context.params;
  const proposal = readProposals().find((candidate) => candidate.id === decodeURIComponent(id));
  if (!isReviewable(proposal)) return redirectTo(request, '/admin');

  const audit = readAudit();
  const result = form.get('reject')
    ? rejectProposal({
        proposal,
        reason: formValue(form, 'reason'),
        audit,
        actor: 'admin',
        now: new Date(),
        requestId: requestId(),
      })
    : acceptProposal({
        proposal,
        writer: createParameterStore(),
        audit,
        actor: 'admin',
        now: new Date(),
        requestId: requestId(),
      });
  writeAudit(result.audit);
  writeProposal(result.proposal);
  return redirectTo(request, '/admin');
}
