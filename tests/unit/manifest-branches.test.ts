import { describe, expect, it } from 'vitest';
import { buildManifest, manifestFieldProblems, validateManifest } from '../../web/manifest/validate';
import type { Manifest } from '../../web/manifest/types';
import { ISO_UTC_SECONDS, SHA256_HEX_LENGTH, isSha256Hex, sha256Hex, toIsoUtcSeconds } from '../../web/manifest/hash';
import { FORMULA_ANCHORS, FORMULA_IDS, isFormulaId } from '../../web/manifest/formula-ids';
import { committedFileExists } from '../../web/manifest/repo-file';
import {
  DEFINITION_IDS,
  definitionFor,
  definitionsForMetric,
  internationalRendering,
  isDefinitionId,
} from '../../web/manifest/definitions';

/**
 * Branch-level coverage for the manifest contract (T1, AC-001-01/02/03/77/78).
 *
 * The acceptance test proves the happy path and four rejection cases; this file pins the
 * *specific* problem code and field each malformed input must produce. That distinction is
 * load-bearing: a validator that rejects the right inputs with the wrong code still tells an
 * operator nothing about which field to fix, and "rejected" is not the same claim as
 * "rejected for the right reason".
 */

const VALID_HASH = 'a'.repeat(SHA256_HEX_LENGTH);
const fileExists = (path: string): boolean => path === 'scripts/compute.ts';

function manifest(overrides: Partial<Record<keyof Manifest, unknown>> = {}): Record<string, unknown> {
  return {
    sourceUrl: ['https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657'],
    fetchedAt: '2026-10-25T09:00:00Z',
    formulaId: 'dependency-ratio.v1',
    definitionId: 'dependency-ratio.international',
    inputHash: VALID_HASH,
    reproducePath: 'scripts/compute.ts',
    ...overrides,
  };
}

/**
 * The distinct `(field, code)` pairs a candidate is rejected with.
 *
 * `validateManifest` reports a broken `reproducePath` from both the filesystem-free pass and
 * the filesystem pass, so the same pair can appear twice; the distinct set is what a caller
 * acts on, and asserting it keeps this test independent of that duplication.
 */
function problemsOf(candidate: unknown): Array<[string, string]> {
  const result = validateManifest(candidate, { fileExists });
  if (result.ok) throw new Error('expected the manifest to be rejected');
  const pairs = result.problems.map((problem) => [problem.field, problem.code] as [string, string]);
  return [...new Map(pairs.map((pair) => [pair.join(':'), pair])).values()];
}

/** A candidate the manifest contract accepts. */
function expectValid(candidate: unknown): void {
  expect(validateManifest(candidate, { fileExists })).toEqual({ ok: true, manifest: candidate });
}

describe('manifest validation: every required field names itself when it is wrong', () => {
  it('rejects a non-object candidate as a missing manifest', () => {
    for (const candidate of [null, [], 'manifest', 42]) {
      expect(problemsOf(candidate)).toEqual([['sourceUrl', 'missing']]);
    }
  });

  it('distinguishes a missing sourceUrl from an empty one', () => {
    expect(problemsOf(manifest({ sourceUrl: undefined }))).toEqual([['sourceUrl', 'missing']]);
    expect(problemsOf(manifest({ sourceUrl: [] }))).toEqual([['sourceUrl', 'empty']]);
    expect(problemsOf(manifest({ sourceUrl: 'https://example.org' }))).toEqual([['sourceUrl', 'empty']]);
  });

  it('rejects blank and non-string source entries as empty, not malformed', () => {
    for (const entry of ['', '   ', 42, null]) {
      expect(problemsOf(manifest({ sourceUrl: [entry] }))).toEqual([['sourceUrl', 'empty']]);
    }
  });

  it('accepts an http URL and rejects one without a scheme, host, or path tail', () => {
    expectValid(manifest({ sourceUrl: ['http://example.org/data'] }));
    expectValid(manifest({ sourceUrl: ['https://example.org/data'] }));
    expect(problemsOf(manifest({ sourceUrl: ['example.org/data'] }))).toEqual([['sourceUrl', 'malformed']]);
    expect(problemsOf(manifest({ sourceUrl: ['ftp://example.org/data'] }))).toEqual([
      ['sourceUrl', 'malformed'],
    ]);
    // A bare scheme has no address, and a trailing space is not part of a URL.
    expect(problemsOf(manifest({ sourceUrl: ['https://'] }))).toEqual([['sourceUrl', 'malformed']]);
    expect(problemsOf(manifest({ sourceUrl: ['https://example.org/data '] }))).toEqual([
      ['sourceUrl', 'malformed'],
    ]);
  });

  it('reports every bad source entry, not only the first', () => {
    expect(problemsOf(manifest({ sourceUrl: ['', 'nope', 'https://ok.example/x'] }))).toEqual([
      ['sourceUrl', 'empty'],
      ['sourceUrl', 'malformed'],
    ]);
  });

  it('distinguishes a missing, blank and malformed fetchedAt', () => {
    expect(problemsOf(manifest({ fetchedAt: undefined }))).toEqual([['fetchedAt', 'missing']]);
    expect(problemsOf(manifest({ fetchedAt: '' }))).toEqual([['fetchedAt', 'empty']]);
    expect(problemsOf(manifest({ fetchedAt: '   ' }))).toEqual([['fetchedAt', 'empty']]);
    expect(problemsOf(manifest({ fetchedAt: 1_760_000_000_000 }))).toEqual([['fetchedAt', 'empty']]);
    // Milliseconds are rejected: the contract is exactly `YYYY-MM-DDTHH:MM:SSZ`.
    expect(problemsOf(manifest({ fetchedAt: '2026-10-25T09:00:00.123Z' }))).toEqual([
      ['fetchedAt', 'malformed'],
    ]);
    expect(problemsOf(manifest({ fetchedAt: '2026-10-25' }))).toEqual([['fetchedAt', 'malformed']]);
  });

  it('distinguishes a missing, blank and unknown formulaId', () => {
    expect(problemsOf(manifest({ formulaId: undefined }))).toEqual([['formulaId', 'missing']]);
    expect(problemsOf(manifest({ formulaId: '' }))).toEqual([['formulaId', 'empty']]);
    expect(problemsOf(manifest({ formulaId: '  ' }))).toEqual([['formulaId', 'empty']]);
    expect(problemsOf(manifest({ formulaId: 7 }))).toEqual([['formulaId', 'empty']]);
    expect(problemsOf(manifest({ formulaId: 'invented.v9' }))).toEqual([
      ['formulaId', 'unknownFormulaId'],
    ]);
    for (const formulaId of FORMULA_IDS) expectValid(manifest({ formulaId }));
  });

  it('distinguishes a missing, blank and unknown definitionId', () => {
    expect(problemsOf(manifest({ definitionId: undefined }))).toEqual([['definitionId', 'missing']]);
    expect(problemsOf(manifest({ definitionId: '' }))).toEqual([['definitionId', 'empty']]);
    expect(problemsOf(manifest({ definitionId: '   ' }))).toEqual([['definitionId', 'empty']]);
    expect(problemsOf(manifest({ definitionId: 7 }))).toEqual([['definitionId', 'empty']]);
    expect(problemsOf(manifest({ definitionId: 'dependency-ratio.regional' }))).toEqual([
      ['definitionId', 'unknownDefinitionId'],
    ]);
    for (const definitionId of DEFINITION_IDS) expectValid(manifest({ definitionId }));
  });

  it('distinguishes a missing, blank and malformed inputHash', () => {
    expect(problemsOf(manifest({ inputHash: undefined }))).toEqual([['inputHash', 'missing']]);
    expect(problemsOf(manifest({ inputHash: '' }))).toEqual([['inputHash', 'empty']]);
    expect(problemsOf(manifest({ inputHash: '   ' }))).toEqual([['inputHash', 'empty']]);
    expect(problemsOf(manifest({ inputHash: 64 }))).toEqual([['inputHash', 'empty']]);
    expect(problemsOf(manifest({ inputHash: 'abc' }))).toEqual([['inputHash', 'malformed']]);
    expect(problemsOf(manifest({ inputHash: 'g'.repeat(64) }))).toEqual([['inputHash', 'malformed']]);
  });

  it('distinguishes a missing, blank, non-relative and non-existent reproducePath', () => {
    expect(problemsOf(manifest({ reproducePath: undefined }))).toEqual([['reproducePath', 'missing']]);
    expect(problemsOf(manifest({ reproducePath: '' }))).toEqual([['reproducePath', 'empty']]);
    expect(problemsOf(manifest({ reproducePath: '   ' }))).toEqual([['reproducePath', 'empty']]);
    expect(problemsOf(manifest({ reproducePath: 3 }))).toEqual([['reproducePath', 'empty']]);
    expect(problemsOf(manifest({ reproducePath: '/etc/passwd' }))).toEqual([
      ['reproducePath', 'malformed'],
    ]);
    expect(problemsOf(manifest({ reproducePath: 'scripts/../../secrets.ts' }))).toEqual([
      ['reproducePath', 'malformed'],
    ]);
    expect(problemsOf(manifest({ reproducePath: 'scripts/a..b.ts' }))).toEqual([
      ['reproducePath', 'malformed'],
    ]);
    expect(problemsOf(manifest({ reproducePath: 'scripts/absent.ts' }))).toEqual([
      ['reproducePath', 'missingFile'],
    ]);
  });

  it('reports every broken field at once instead of stopping at the first', () => {
    expect(
      problemsOf(
        manifest({
          sourceUrl: [],
          fetchedAt: 'nope',
          formulaId: 'invented.v9',
          definitionId: 'invented',
          inputHash: 'short',
          reproducePath: '/abs.ts',
        }),
      ),
    ).toEqual([
      ['sourceUrl', 'empty'],
      ['fetchedAt', 'malformed'],
      ['formulaId', 'unknownFormulaId'],
      ['definitionId', 'unknownDefinitionId'],
      ['inputHash', 'malformed'],
      ['reproducePath', 'malformed'],
    ]);
  });
});

describe('manifest field problems without filesystem access', () => {
  it('checks structure but never reports a missing file', () => {
    // The renderer must be able to withhold a structurally broken plate without gaining a
    // filesystem dependency, so a path that does not exist is not its finding to make.
    const problems = manifestFieldProblems(manifest({ reproducePath: 'scripts/absent.ts' }));
    expect(problems).toEqual([]);

    expect(manifestFieldProblems(manifest({ sourceUrl: [] }))).toEqual([
      { field: 'sourceUrl', code: 'empty', detail: 'at least one source URL is required' },
    ]);
    expect(manifestFieldProblems(manifest({ inputHash: 'short' }))).toEqual([
      { field: 'inputHash', code: 'malformed', detail: 'expected 64 lowercase hex chars' },
    ]);
    expect(manifestFieldProblems(undefined)).toEqual([
      { field: 'sourceUrl', code: 'missing', detail: 'no manifest object' },
    ]);
  });
});

describe('manifest construction', () => {
  it('stamps seconds-precision UTC and hashes the exact bytes given', () => {
    const built = buildManifest({
      sourceUrl: ['https://example.org/a'],
      fetchedAt: new Date('2026-10-25T09:00:00.987Z'),
      formulaId: 'cohort-irr.v1',
      definitionId: 'cohort-return.national',
      inputBytes: 'raw bytes',
      reproducePath: 'scripts/compute.ts',
    });

    expect(built.fetchedAt).toBe('2026-10-25T09:00:00Z');
    expect(built.inputHash).toBe(sha256Hex('raw bytes'));
    expect(built.sourceUrl).toEqual(['https://example.org/a']);
  });

  it('copies the source list instead of aliasing the caller array', () => {
    const sourceUrl = ['https://example.org/a'];
    const built = buildManifest({
      sourceUrl,
      fetchedAt: new Date('2026-10-25T09:00:00Z'),
      formulaId: 'cohort-irr.v1',
      definitionId: 'cohort-return.national',
      inputBytes: 'x',
      reproducePath: 'scripts/compute.ts',
    });

    sourceUrl.push('https://example.org/mutated');
    expect(built.sourceUrl).toEqual(['https://example.org/a']);
  });

  it('hashes a byte buffer to the same digest as its string form', () => {
    const text = '{"pensioners":1}';
    expect(sha256Hex(new TextEncoder().encode(text))).toBe(sha256Hex(text));
  });
});

describe('hash guards', () => {
  it('accepts exactly 64 lowercase hex characters and nothing around them', () => {
    expect(isSha256Hex(VALID_HASH)).toBe(true);
    expect(isSha256Hex('0123456789abcdef'.repeat(4))).toBe(true);
    // Anchored at both ends, lowercase only, no surrounding text.
    expect(isSha256Hex(`${VALID_HASH}x`)).toBe(false);
    expect(isSha256Hex(`x${VALID_HASH}`)).toBe(false);
    expect(isSha256Hex(VALID_HASH.toUpperCase())).toBe(false);
    expect(isSha256Hex(VALID_HASH.slice(0, 63))).toBe(false);
    expect(isSha256Hex(42)).toBe(false);
  });

  it('accepts only the exact ISO UTC seconds shape', () => {
    expect(ISO_UTC_SECONDS.test('2026-10-25T09:00:00Z')).toBe(true);
    expect(ISO_UTC_SECONDS.test('2026-10-25T09:00:00Zx')).toBe(false);
    expect(ISO_UTC_SECONDS.test('x2026-10-25T09:00:00Z')).toBe(false);
    expect(ISO_UTC_SECONDS.test('2026-10-25T09:00:00.123Z')).toBe(false);
    expect(toIsoUtcSeconds(new Date('2026-10-25T09:00:00.123Z'))).toBe('2026-10-25T09:00:00Z');
    expect(toIsoUtcSeconds(new Date('2026-12-31T23:59:59Z'))).toBe('2026-12-31T23:59:59Z');
  });
});

describe('formula id registry', () => {
  it('accepts only the documented ids', () => {
    for (const formulaId of FORMULA_IDS) expect(isFormulaId(formulaId)).toBe(true);
    expect(isFormulaId('invented.v9')).toBe(false);
    expect(isFormulaId('')).toBe(false);
    expect(isFormulaId(1)).toBe(false);
    expect(isFormulaId(undefined)).toBe(false);
  });

  it('anchors every formula on the public methodology section', () => {
    for (const formulaId of FORMULA_IDS) {
      expect(FORMULA_ANCHORS[formulaId], formulaId).toBe(`#formula-${formulaId.replace(/\.v\d+$/, '')}`);
    }
    expect(Object.keys(FORMULA_ANCHORS).sort()).toEqual([...FORMULA_IDS].sort());
  });
});

describe('committed reproduce paths', () => {
  it('resolves only paths under the two committed roots', () => {
    expect(committedFileExists('scripts/compute.ts')).toBe(true);
    expect(committedFileExists('data/derived/fig-01.json')).toBe(true);
  });

  it('rejects a root outside the committed set, a bare root, and a missing file', () => {
    expect(committedFileExists('app/page.tsx')).toBe(false);
    expect(committedFileExists('web/metrics/npv.ts')).toBe(false);
    expect(committedFileExists('scripts')).toBe(false);
    expect(committedFileExists('scripts/definitely-absent.ts')).toBe(false);
    expect(committedFileExists('data/absent/fig-99.json')).toBe(false);
  });
});

describe('published definition registry', () => {
  it('is its own key: every entry names the id it is filed under', () => {
    for (const definitionId of DEFINITION_IDS) {
      const definition = definitionFor(definitionId);
      expect(definition.definitionId, definitionId).toBe(definitionId);
      expect(FORMULA_IDS).toContain(definition.formulaId);
      expect(definition.geography).toBe(definitionId.endsWith('.international') ? 'international' : 'national');
      expect(definition.metric).toBe(definitionId.replace(/\.(international|national)$/, '').replace('pension-expenditure-gdp', 'contribution-cover'));
      expect(definition.definition, definitionId).not.toBe('');
    }
  });

  it('gives a reason only to the definitions this deployment does not compute', () => {
    for (const definitionId of DEFINITION_IDS) {
      const definition = definitionFor(definitionId);
      if (definition.geography === 'national') {
        expect(definition.unavailableReason, definitionId).toBeTruthy();
      } else {
        expect(definition.unavailableReason, definitionId).toBeUndefined();
      }
    }
  });

  it('recognises only ids from the closed set', () => {
    for (const definitionId of DEFINITION_IDS) expect(isDefinitionId(definitionId)).toBe(true);
    expect(isDefinitionId('dependency-ratio.regional')).toBe(false);
    expect(isDefinitionId('')).toBe(false);
    expect(isDefinitionId(null)).toBe(false);
    expect(isDefinitionId(7)).toBe(false);
  });

  it('returns every definition of a metric, and only those', () => {
    expect(definitionsForMetric('dependency-ratio').map((d) => d.definitionId).sort()).toEqual([
      'dependency-ratio.international',
      'dependency-ratio.national',
    ]);
    expect(definitionsForMetric('cohort-return').map((d) => d.definitionId)).toEqual([
      'cohort-return.national',
    ]);
  });
});

describe('international rendering of a metric', () => {
  it('answers a metric with no international definition from its own definition', () => {
    const rendering = internationalRendering('cohort-return', []);

    // The metric has no international definition at all, so the fallback is its single
    // national one — answered `unavailable` with that definition's own reason, never a
    // substitute number.
    expect(rendering.definitionId).toBe('cohort-return.national');
    expect(rendering.availability).toBe('unavailable');
    expect(rendering.reason).toBe('no internationally comparable source for average contributions');
  });

  it('answers unavailable with the definition reason when the figure is absent', () => {
    const rendering = internationalRendering('dependency-ratio', []);

    expect(rendering.definitionId).toBe('dependency-ratio.international');
    expect(rendering.figureId).toBeNull();
    expect(rendering.availability).toBe('unavailable');
    // The international definition has no reason of its own in the registry, so absence
    // yields no reason rather than a substitute one.
    expect(rendering.reason).toBeNull();
  });

  it('names the figure only when the matching definition published a computed value', () => {
    const computed = [
      { figureId: 'fig-01', definitionId: 'dependency-ratio.international' as const, availability: 'computed' },
      { figureId: 'fig-06', definitionId: 'dependency-ratio.national' as const, availability: 'unavailable' },
    ];
    const rendering = internationalRendering('dependency-ratio', computed);

    expect(rendering.figureId).toBe('fig-01');
    expect(rendering.availability).toBe('computed');
    expect(rendering.reason).toBeNull();

    // The same definition published as `unavailable` is not a computed rendering.
    const unavailable = internationalRendering('dependency-ratio', [
      { figureId: 'fig-01', definitionId: 'dependency-ratio.international' as const, availability: 'unavailable' },
    ]);
    expect(unavailable.availability).toBe('unavailable');
    expect(unavailable.figureId).toBe('fig-01');
  });
});

describe('the message each manifest problem carries', () => {
  /** The first problem reported for a candidate, with its detail text. */
  function firstProblem(candidate: unknown): [string, string, string] {
    const result = validateManifest(candidate, { fileExists });
    if (result.ok) throw new Error('expected the manifest to be rejected');
    const [problem] = result.problems;
    if (!problem) throw new Error('expected at least one problem');
    return [problem.field, problem.code, problem.detail];
  }

  it('tells the operator which field is absent', () => {
    expect(firstProblem(manifest({ sourceUrl: undefined }))).toEqual([
      'sourceUrl',
      'missing',
      'absent',
    ]);
    expect(firstProblem(manifest({ fetchedAt: undefined }))).toEqual(['fetchedAt', 'missing', 'absent']);
    expect(firstProblem(manifest({ formulaId: undefined }))).toEqual(['formulaId', 'missing', 'absent']);
    expect(firstProblem(manifest({ definitionId: undefined }))).toEqual([
      'definitionId',
      'missing',
      'absent',
    ]);
    expect(firstProblem(manifest({ inputHash: undefined }))).toEqual(['inputHash', 'missing', 'absent']);
    expect(firstProblem(manifest({ reproducePath: undefined }))).toEqual([
      'reproducePath',
      'missing',
      'absent',
    ]);
  });

  it('tells the operator which field is blank', () => {
    expect(firstProblem(manifest({ sourceUrl: ['  '] }))).toEqual([
      'sourceUrl',
      'empty',
      'blank source URL entry',
    ]);
    expect(firstProblem(manifest({ fetchedAt: '  ' }))).toEqual(['fetchedAt', 'empty', 'blank timestamp']);
    expect(firstProblem(manifest({ formulaId: '  ' }))).toEqual(['formulaId', 'empty', 'blank formula id']);
    expect(firstProblem(manifest({ definitionId: '  ' }))).toEqual([
      'definitionId',
      'empty',
      'blank definition id',
    ]);
    expect(firstProblem(manifest({ inputHash: '  ' }))).toEqual(['inputHash', 'empty', 'blank digest']);
    expect(firstProblem(manifest({ reproducePath: '  ' }))).toEqual([
      'reproducePath',
      'empty',
      'blank path',
    ]);
  });

  it('says what shape was expected, and echoes the offending value', () => {
    expect(firstProblem(manifest({ fetchedAt: '2026-10-25' }))).toEqual([
      'fetchedAt',
      'malformed',
      'expected YYYY-MM-DDTHH:MM:SSZ',
    ]);
    expect(firstProblem(manifest({ inputHash: 'short' }))).toEqual([
      'inputHash',
      'malformed',
      'expected 64 lowercase hex chars',
    ]);
    expect(firstProblem(manifest({ reproducePath: '/abs.ts' }))).toEqual([
      'reproducePath',
      'malformed',
      'must be repo-relative',
    ]);
    // The offending value itself is the detail, so an operator can find it.
    expect(firstProblem(manifest({ sourceUrl: ['nope'] }))).toEqual(['sourceUrl', 'malformed', 'nope']);
    expect(firstProblem(manifest({ formulaId: 'invented.v9' }))).toEqual([
      'formulaId',
      'unknownFormulaId',
      'invented.v9',
    ]);
    expect(firstProblem(manifest({ definitionId: 'invented' }))).toEqual([
      'definitionId',
      'unknownDefinitionId',
      'invented',
    ]);
    expect(firstProblem(manifest({ reproducePath: 'scripts/absent.ts' }))).toEqual([
      'reproducePath',
      'missingFile',
      'scripts/absent.ts',
    ]);
  });

  it('names a non-manifest candidate as such', () => {
    expect(firstProblem(null)).toEqual(['sourceUrl', 'missing', 'no manifest object']);
  });

  it('requires the scheme at the start of a source URL', () => {
    // A URL with text before the scheme is not a URL this validator may accept.
    expect(problemsOf(manifest({ sourceUrl: ['xhttps://example.org/a'] }))).toEqual([
      ['sourceUrl', 'malformed'],
    ]);
    expect(problemsOf(manifest({ sourceUrl: ['see https://example.org/a'] }))).toEqual([
      ['sourceUrl', 'malformed'],
    ]);
  });
});
