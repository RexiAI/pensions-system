import type { AgreementClaim, Citation, DisputedClaim, DisputePosition } from './types';

/**
 * Citation resolution (T9). A claim, quote or position is renderable only if its
 * citation id resolves to a real record; there is no path that renders a claim with a
 * missing or unresolvable citation.
 */
export interface CitationRegistry {
  find(id: string | undefined): Citation | undefined;
  all(): readonly Citation[];
}

export function createCitationRegistry(citations: readonly Citation[]): CitationRegistry {
  const index = new Map(citations.map((citation) => [citation.id, citation]));
  return {
    find: (id) => (id === undefined ? undefined : index.get(id)),
    all: () => citations,
  };
}

export interface ResolvedClaim {
  text: string;
  citation: Citation;
}

export interface ResolvedDispute {
  id: string;
  positions: Array<{ position: DisputePosition; citation: Citation }>;
}

/** Drops any claim whose citation does not resolve. */
export function resolveClaims(
  claims: readonly AgreementClaim[],
  registry: CitationRegistry,
): ResolvedClaim[] {
  const resolved: ResolvedClaim[] = [];
  for (const claim of claims) {
    const citation = registry.find(claim.citationId);
    if (citation) resolved.push({ text: claim.text, citation });
  }
  return resolved;
}

/**
 * Drops unresolvable positions. A dispute that drops below two positions is dropped
 * entirely: a one-sided dispute is a false statement, not a partial view.
 */
export function resolveDisputes(
  disputes: readonly DisputedClaim[],
  registry: CitationRegistry,
): ResolvedDispute[] {
  const resolved: ResolvedDispute[] = [];
  for (const dispute of disputes) {
    const positions: ResolvedDispute['positions'] = [];
    for (const position of dispute.positions) {
      const citation = registry.find(position.citationId);
      if (citation) positions.push({ position, citation });
    }
    if (positions.length >= 2) resolved.push({ id: dispute.id, positions });
  }
  return resolved;
}

export interface PublicationFailure {
  unit: string;
  reason: 'unresolved-citation' | 'single-position';
}

export type PublicationGate =
  | { ok: true }
  | { ok: false; failures: PublicationFailure[] };

/**
 * The publication gate shared by an admin refresh (T14) and a parameter proposal (T15):
 * content that would publish a named-person or institution claim, or a quote, without a
 * resolvable citation is rejected before publication (AC-001-68).
 */
function agreementFailures(
  claims: readonly AgreementClaim[],
  registry: CitationRegistry,
): PublicationFailure[] {
  return claims
    .filter((claim) => !registry.find(claim.citationId))
    .map((claim) => ({ unit: claim.text, reason: 'unresolved-citation' as const }));
}

function disputeFailures(dispute: DisputedClaim, registry: CitationRegistry): PublicationFailure[] {
  const unresolved = dispute.positions
    .filter((position) => !registry.find(position.citationId))
    .map((position) => ({
      unit: `${dispute.id}: ${position.proponent}`,
      reason: 'unresolved-citation' as const,
    }));
  const resolvable = dispute.positions.filter((position) => registry.find(position.citationId));
  const oneSided: PublicationFailure[] =
    resolvable.length < 2 ? [{ unit: dispute.id, reason: 'single-position' }] : [];
  return [...unresolved, ...oneSided];
}

export function validateContentForPublication(
  units: { agreement: readonly AgreementClaim[]; disputes: readonly DisputedClaim[] },
  registry: CitationRegistry,
): PublicationGate {
  const failures = [
    ...agreementFailures(units.agreement, registry),
    ...units.disputes.flatMap((dispute) => disputeFailures(dispute, registry)),
  ];
  return failures.length === 0 ? { ok: true } : { ok: false, failures };
}

import citationData from './data/citations.json';
import type { Citation as CitationRecord } from './types';

export const CITATIONS: readonly Citation[] = (citationData as { citations: CitationRecord[] }).citations;

export const citationRegistry: CitationRegistry = createCitationRegistry(CITATIONS);
