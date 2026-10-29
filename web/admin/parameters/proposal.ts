import { adminT } from '../../content/admin';
import type { CitationRegistry } from '../../content/citations';
import type { AuditEntry } from '../audit/log';
import { appendAuditEntry } from '../audit/log';
import { describeParameter, isParameterId, sameParameterValue } from './parameter-set';
import type { ParameterId, ParameterValue, ParameterWriter } from './parameter-set';

export const PROPOSAL_STATUSES = ['pending-review', 'accepted', 'rejected'] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export interface ParameterProposal {
  id: string;
  parameterId: ParameterId;
  before?: ParameterValue;
  after: ParameterValue;
  citationId: string;
  proposedBy: string;
  proposedAt: string;
  status: ProposalStatus;
  reason?: string;
}

export type SubmitFailure = 'outside-parameter-set' | 'unresolved-citation' | 'no-change';

export type SubmitResult =
  | { ok: true; proposal: ParameterProposal }
  | { ok: false; reason: SubmitFailure };

export interface SubmitInput {
  id: string;
  parameterId: string;
  after: ParameterValue;
  citationId: string | undefined;
  proposedBy: string;
  current: ParameterValue | undefined;
  citations: CitationRegistry;
  now: Date;
}

/**
 * A proposal enters review, never approval (AC-001-62): the only status this function can
 * produce is `pending-review`. An out-of-set parameter or an unresolvable citation is
 * rejected before it can enter review at all.
 */
export function submitProposal(input: SubmitInput): SubmitResult {
  if (!isParameterId(input.parameterId)) return { ok: false, reason: 'outside-parameter-set' };
  if (!input.citations.find(input.citationId)) return { ok: false, reason: 'unresolved-citation' };
  if (sameParameterValue(input.current, input.after)) return { ok: false, reason: 'no-change' };
  return {
    ok: true,
    proposal: {
      id: input.id,
      parameterId: input.parameterId,
      ...(input.current ? { before: input.current } : {}),
      after: input.after,
      citationId: input.citationId as string,
      proposedBy: input.proposedBy,
      proposedAt: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      status: 'pending-review',
    },
  };
}

export interface AcceptanceResult {
  proposal: ParameterProposal;
  /** Always zero: an accepted parameter publishes no figure (AC-001-73). */
  figureChanges: 0;
  published: readonly string[];
  audit: AuditEntry[];
}

/**
 * Accepting a proposal commits the rule change and publishes nothing. The only write
 * handle here is `ParameterWriter`, which has no derived-figure method, so the figure set
 * is not reachable from this path at all.
 */
export function acceptProposal(input: {
  proposal: ParameterProposal;
  writer: ParameterWriter;
  audit: readonly AuditEntry[];
  actor: string;
  now: Date;
  requestId: string;
}): AcceptanceResult {
  input.writer.setParameter(input.proposal.parameterId, input.proposal.after);
  const accepted: ParameterProposal = { ...input.proposal, status: 'accepted' };
  return {
    proposal: accepted,
    figureChanges: 0,
    published: [],
    audit: appendAuditEntry(input.audit, {
      at: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      identity: input.actor,
      action: 'parameter.accepted',
      target: input.proposal.id,
      before: describeParameter(input.proposal.parameterId, input.proposal.before ?? input.proposal.after),
      after: describeParameter(input.proposal.parameterId, input.proposal.after),
      requestId: input.requestId,
    }),
  };
}

export function rejectProposal(input: {
  proposal: ParameterProposal;
  reason: string;
  audit: readonly AuditEntry[];
  actor: string;
  now: Date;
  requestId: string;
}): { proposal: ParameterProposal; audit: AuditEntry[] } {
  return {
    proposal: { ...input.proposal, status: 'rejected', reason: input.reason },
    audit: appendAuditEntry(input.audit, {
      at: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      identity: input.actor,
      action: 'parameter.rejected',
      target: input.proposal.id,
      before: adminT('admin.status.pending'),
      after: input.reason,
      requestId: input.requestId,
    }),
  };
}
