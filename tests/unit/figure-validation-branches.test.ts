import { describe, expect, it } from 'vitest';
import { isAvailability, validateDerivedFigure } from '../../web/ingest/validate-figure';
import type { FigureProblem } from '../../web/ingest/validate-figure';
import { definitionFor } from '../../web/manifest/definitions';
import { dependencyValue, makeFigure } from '../fixtures/figures';

/**
 * Branch-level coverage for the figure contract (T1, AC-001-74/77/78/92).
 *
 * `manifest.test.ts` proves the two availability loopholes are closed. This file pins the
 * *reason* each rejected figure is rejected with: a figure withheld for the wrong cause sends
 * an operator to the wrong field, so the problem code is part of the contract, not a detail.
 */

const fileExists = (): boolean => true;

const valid = makeFigure({
  figureId: 'fig-01',
  unit: 'ratio',
  value: dependencyValue(),
});

function codesFor(candidate: unknown): string[] {
  return validateDerivedFigure(candidate, { fileExists }).map((problem) => problem.code);
}

function problemFor(candidate: unknown, code: string): FigureProblem {
  const found = validateDerivedFigure(candidate, { fileExists }).find((problem) => problem.code === code);
  if (!found) throw new Error(`expected a ${code} problem, got ${codesFor(candidate).join(', ') || 'none'}`);
  return found;
}

describe('figure validation: availability', () => {
  it('accepts only the two documented availability states', () => {
    expect(isAvailability('computed')).toBe(true);
    expect(isAvailability('unavailable')).toBe(true);
    expect(isAvailability('withheld')).toBe(false);
    expect(isAvailability('')).toBe(false);
    expect(isAvailability(undefined)).toBe(false);
  });

  it('rejects a non-object candidate as an unknown availability', () => {
    for (const candidate of [null, [], 'figure', 7]) {
      expect(validateDerivedFigure(candidate, { fileExists })).toEqual([
        { figureId: 'unknown', code: 'unknown-availability', detail: 'not a figure object' },
      ]);
    }
  });

  it('names the offending availability value', () => {
    expect(problemFor({ ...valid, availability: 'withheld' }, 'unknown-availability').detail).toBe(
      'withheld',
    );
    expect(problemFor({ availability: 'nope' }, 'unknown-availability').figureId).toBe('unknown');
  });

  it('closes both loopholes with their own problem code', () => {
    expect(codesFor({ ...valid, value: null })).toContain('computed-without-value');
    expect(problemFor({ ...valid, value: null }, 'computed-without-value').detail).toBe(
      'computed figure carries no value',
    );
    expect(codesFor({ ...valid, availability: 'unavailable' })).toContain('unavailable-with-value');
    expect(problemFor({ ...valid, availability: 'unavailable' }, 'unavailable-with-value').detail).toBe(
      'unavailable figure carries a headline value',
    );
  });

  it('accepts the two legitimate shapes', () => {
    expect(validateDerivedFigure(valid, { fileExists })).toEqual([]);
    expect(
      validateDerivedFigure({ ...valid, availability: 'unavailable', value: null }, { fileExists }),
    ).toEqual([]);
  });
});

describe('figure validation: manifest', () => {
  it('distinguishes an absent manifest from an invalid one', () => {
    for (const manifest of [undefined, null]) {
      expect(problemFor({ ...valid, manifest }, 'missing-manifest').detail).toBe('no manifest object');
    }
    expect(problemFor({ ...valid, manifest: { ...valid.manifest, inputHash: '' } }, 'manifest-invalid').detail).toBe(
      'inputHash:empty',
    );
  });

  it('names the figure and every failing manifest field', () => {
    const problem = problemFor(
      {
        ...valid,
        manifest: { ...valid.manifest, inputHash: 'short', fetchedAt: 'nope' },
      },
      'manifest-invalid',
    );

    expect(problem.figureId).toBe('fig-01');
    expect(problem.detail).toBe('fetchedAt:malformed, inputHash:malformed');
  });
});

describe('figure validation: definition identity', () => {
  it('distinguishes a missing definitionId from an unknown one', () => {
    for (const definitionId of [undefined, '', '   ', 42]) {
      expect(problemFor({ ...valid, definitionId }, 'missing-definition').detail).toBe('no definitionId');
    }
    expect(problemFor({ ...valid, definitionId: 'dependency-ratio.regional' }, 'unknown-definition').detail).toBe(
      'dependency-ratio.regional',
    );
  });

  it('requires the published definition string, in the canonical form', () => {
    for (const definition of [undefined, '', '   ', 42]) {
      expect(problemFor({ ...valid, definition }, 'missing-definition').detail).toBe('no definition string');
    }

    const problem = problemFor({ ...valid, definition: 'A different sentence entirely.' }, 'definition-mismatch');
    expect(problem.detail).toBe('dependency-ratio.international does not carry its published definition');
    expect(problem.figureId).toBe('fig-01');
  });

  it('rejects thesis vocabulary in the definition string before the mismatch check', () => {
    const problem = problemFor(
      { ...valid, definition: 'Esta cifra es insostenible e injusto.' },
      'definition-vocabulary',
    );

    // Every banned term found is named, comma separated.
    expect(problem.detail).toBe('insostenible, injusto');
  });

  it('requires the manifest to record the same definitionId', () => {
    const problem = problemFor(
      { ...valid, manifest: { ...valid.manifest, definitionId: 'dependency-ratio.national' } },
      'definition-mismatch',
    );

    expect(problem.detail).toBe('manifest records a different definitionId');
  });

  it('accepts every published definition when the figure carries its canonical text', () => {
    for (const figureId of ['fig-01', 'fig-02', 'fig-03', 'fig-04', 'fig-05', 'fig-06', 'fig-07'] as const) {
      const fixture = makeFigure({ figureId, unit: 'ratio', value: null, availability: 'unavailable' });
      expect(fixture.definition, figureId).toBe(definitionFor(fixture.definitionId).definition);
      expect(validateDerivedFigure(fixture, { fileExists }), figureId).toEqual([]);
    }
  });
});
