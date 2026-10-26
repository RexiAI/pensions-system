import { notFound, redirect } from 'next/navigation';
import { adminT } from '@/web/content/admin';
import { citationRegistry } from '@/web/content/citations';
import type { Citation } from '@/web/content/types';
import { pageSession } from '@/web/admin/page-session';
import { readProposals } from '@/web/admin/persistence';
import { describeParameter, parameterName } from '@/web/admin/parameters/parameter-set';
import type { ParameterProposal } from '@/web/admin/parameters/proposal';

export const dynamic = 'force-dynamic';

interface ProposalData {
  proposal: ParameterProposal;
  csrf: string;
  citation: Citation | undefined;
}

async function proposalData(proposalId: string): Promise<ProposalData | null> {
  const proposal = readProposals().find((candidate) => candidate.id === proposalId);
  if (!proposal) return null;
  const auth = await pageSession();
  if (!auth.ok) redirect('/admin/login');
  return { proposal, csrf: auth.session.csrf, citation: citationRegistry.find(proposal.citationId) };
}

function RuleDiff({ proposal }: { proposal: ParameterProposal }) {
  const before = proposal.before ? describeParameter(proposal.parameterId, proposal.before) : adminT('admin.review.unchanged');
  return (
    <dl>
      <dt>{adminT('admin.proposal.before')}</dt>
      <dd>{before}</dd>
      <dt>{adminT('admin.proposal.after')}</dt>
      <dd>{describeParameter(proposal.parameterId, proposal.after)}</dd>
    </dl>
  );
}

function CitationBlock({ citation }: { citation: Citation | undefined }) {
  if (!citation) return <p className="admin-failure">{adminT('admin.review.preflightCitation')}</p>;
  return (
    <blockquote cite={citation.url}>
      <p>{citation.reference}</p>
      <cite>{`${citation.publisher}, ${citation.document}`}</cite>
    </blockquote>
  );
}

function ActionForms({ proposalId, csrf }: { proposalId: string; csrf: string }) {
  const action = `/api/admin/proposals/${encodeURIComponent(proposalId)}/accept`;
  return (
    <>
      <form action={action} method="post">
        <input type="hidden" name="csrf" value={csrf} />
        <button className="admin-btn" type="submit">
          {adminT('admin.proposal.accept')}
        </button>
      </form>
      <form action={action} method="post">
        <input type="hidden" name="csrf" value={csrf} />
        <input type="hidden" name="reject" value="1" />
        <button className="admin-btn" type="submit">
          {adminT('admin.proposal.reject')}
        </button>
      </form>
    </>
  );
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await proposalData(decodeURIComponent(id));
  if (!data) notFound();
  const { proposal } = data;
  return (
    <section className="proposal">
      <h1>{adminT('admin.proposal.title')}</h1>
      <p className="status-chip" data-state="pending">
        {adminT('admin.status.pending')}
      </p>
      <p>{`${adminT('admin.proposal.machine')} ${proposal.proposedBy} · ${proposal.proposedAt} · ${proposal.id}`}</p>
      <h2>{parameterName(proposal.parameterId)}</h2>
      <p>
        <code>{proposal.parameterId}</code>
      </p>
      <RuleDiff proposal={proposal} />
      <p className="blast-radius">{adminT('admin.proposal.blast')}</p>
      <CitationBlock citation={data.citation} />
      <ActionForms proposalId={proposal.id} csrf={data.csrf} />
    </section>
  );
}
