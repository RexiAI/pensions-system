import { describe, expect, it } from 'vitest';
import { citationRegistry } from '../../web/content/citations';
import { createMemoryDerivedStore } from '../../web/derived/store';
import { createRevision } from '../../web/admin/revisions/pending-store';
import {
  createParameterStore,
  describeParameter,
  isParameterId,
} from '../../web/admin/parameters/parameter-set';
import type { ParameterWriter } from '../../web/admin/parameters/parameter-set';
import { acceptProposal, rejectProposal, submitProposal } from '../../web/admin/parameters/proposal';
import { listSourceFiles, readSource } from '../helpers/source-scan';
import { makeChange, NOW, revisionStore } from '../fixtures/admin';

const CURRENT = { kind: 'integer', value: 12 } as const;
const PROPOSED = { kind: 'integer', value: 14 } as const;

function submit(overrides: Partial<Parameters<typeof submitProposal>[0]> = {}) {
  return submitProposal({
    id: 'prop-1',
    parameterId: 'pension_payment_count',
    after: PROPOSED,
    citationId: 'eurostat-spr-exp-pens',
    proposedBy: 'model:test',
    current: CURRENT,
    citations: citationRegistry,
    now: NOW,
    ...overrides,
  });
}

describe('parameter proposals', () => {
  it('AC-001-61: a proposal citing an unresolvable source is rejected before review', () => {
    const result = submit({ citationId: 'no-such-source' });
    const missing = submit({ citationId: undefined });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('unresolved-citation');
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.reason).toBe('unresolved-citation');
  });

  it('AC-001-62: a valid proposal enters review and cannot auto-approve', () => {
    const result = submit();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proposal.status).toBe('pending-review');
    expect(result.proposal.status).not.toBe('accepted');
    expect(result.proposal.citationId).toBe('eurostat-spr-exp-pens');
    expect(result.proposal.proposedBy).toBe('model:test');
  });

  it('AC-001-63: a proposal cannot alter a derived figure', () => {
    const result = submit();
    if (!result.ok) throw new Error('fixture proposal must be valid');

    const written: string[] = [];
    const writer: ParameterWriter = {
      setParameter: (id, value) => written.push(`${id}:${JSON.stringify(value)}`),
    };
    const derived = createMemoryDerivedStore();
    const accepted = acceptProposal({
      proposal: result.proposal,
      writer,
      audit: [],
      actor: 'admin',
      now: NOW,
      requestId: 'req-accept',
    });

    expect(written).toEqual(['pension_payment_count:{"kind":"integer","value":14}']);
    expect(accepted.figureChanges).toBe(0);
    expect(accepted.published).toEqual([]);
    expect(derived.written()).toEqual([]);
    expect(derived.readAll()).toEqual([]);

    // Structural boundary: the parameter path cannot even import the derived store.
    const files = listSourceFiles('web/admin/parameters');
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toContain('derived/store');
      expect(source).not.toContain('DerivedFigureStore');
      expect(source).not.toContain('ingest/types');
    }
  });

  it('AC-001-64: the parameter set is enumerated', () => {
    const outside = submit({ parameterId: 'gdp_target' });

    expect(outside.ok).toBe(false);
    if (!outside.ok) expect(outside.reason).toBe('outside-parameter-set');
    expect(isParameterId('retirement_age')).toBe(true);
    expect(isParameterId('pension_payment_count')).toBe(true);
    expect(isParameterId('contribution_base_limits')).toBe(true);
    expect(isParameterId('revaluation_rule')).toBe(true);
    expect(isParameterId('anything_else')).toBe(false);
  });

  it('AC-001-73: accepting a parameter publishes zero figure changes', () => {
    const result = submit();
    if (!result.ok) throw new Error('fixture proposal must be valid');
    const parameters = createParameterStore([{ id: 'pension_payment_count', value: CURRENT }]);
    const derived = createMemoryDerivedStore();
    const store = revisionStore();

    const accepted = acceptProposal({
      proposal: result.proposal,
      writer: parameters,
      audit: [],
      actor: 'admin',
      now: NOW,
      requestId: 'req-accept',
    });

    expect(accepted.figureChanges).toBe(0);
    expect(accepted.published).toEqual([]);
    expect(parameters.getParameter('pension_payment_count')).toEqual(PROPOSED);
    expect(derived.readAll()).toEqual([]);
    expect(store.snapshot()).toEqual([]);
    expect(accepted.audit.at(-1)?.action).toBe('parameter.accepted');
    expect(accepted.audit.at(-1)?.after).toBe(
      describeParameter('pension_payment_count', PROPOSED),
    );

    // Reaching readers still needs a separate, separately approved figure revision.
    createRevision({ store, snapshotHash: 'after-param', changes: [makeChange()], now: NOW });
    expect(derived.readAll()).toEqual([]);
  });

  it('AC-001-62: a rejection is a first-class audited act with a reason', () => {
    const result = submit();
    if (!result.ok) throw new Error('fixture proposal must be valid');
    const rejected = rejectProposal({
      proposal: result.proposal,
      reason: 'sin cambio neto',
      audit: [],
      actor: 'admin',
      now: NOW,
      requestId: 'req-reject',
    });

    expect(rejected.proposal.status).toBe('rejected');
    expect(rejected.proposal.reason).toBe('sin cambio neto');
    expect(rejected.audit.at(-1)?.action).toBe('parameter.rejected');
  });

  it('AC-001-64: a parameter renders as a sentence, never a bare JSON value', () => {
    const sentence = describeParameter('pension_payment_count', PROPOSED);

    expect(sentence).toContain('14');
    expect(sentence).not.toContain('{');
    expect(sentence.split(' ').length).toBeGreaterThan(3);
  });
});
