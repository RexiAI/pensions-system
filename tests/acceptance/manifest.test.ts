import { describe, expect, it } from 'vitest';
import { buildManifest, validateManifest } from '../../web/manifest/validate';
import { isSha256Hex, sha256Hex } from '../../web/manifest/hash';
import { isFormulaId } from '../../web/manifest/formula-ids';
import { validateDerivedFigure } from '../../web/ingest/validate-figure';
import type { Manifest } from '../../web/manifest/types';
import { dependencyValue, makeFigure } from '../fixtures/figures';

const REPRODUCE_PATH = 'scripts/compute.ts';
const fileExists = (path: string): boolean => path === REPRODUCE_PATH;

function manifestFor(bytes: string): Manifest {
  return buildManifest({
    sourceUrl: ['https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/PROP10033?nult=60'],
    fetchedAt: new Date('2026-10-25T09:00:00Z'),
    formulaId: 'dependency-ratio.v1',
    definitionId: 'dependency-ratio.international',
    inputBytes: bytes,
    reproducePath: REPRODUCE_PATH,
  });
}

describe('derived-figure manifest', () => {
  it('AC-001-01: a derived figure manifest carries every required field, non-empty', () => {
    const manifest = manifestFor('{"pensioners":8400000,"affiliates":20000000}');
    const serialised = JSON.parse(JSON.stringify(manifest)) as Manifest;

    expect(serialised.sourceUrl.length).toBeGreaterThanOrEqual(1);
    expect(serialised.sourceUrl[0]).toMatch(/^https?:\/\//);
    expect(serialised.fetchedAt).toBe('2026-10-25T09:00:00Z');
    expect(isFormulaId(serialised.formulaId)).toBe(true);
    expect(isSha256Hex(serialised.inputHash)).toBe(true);
    expect(serialised.reproducePath).toBe(REPRODUCE_PATH);
    expect(validateManifest(serialised, { fileExists }).ok).toBe(true);
  });

  it('AC-001-02: changing an input snapshot changes the hash', () => {
    const hashA = manifestFor('{"pensioners":1}').inputHash;
    const hashB = manifestFor('{"pensioners":2}').inputHash;

    expect(hashA).not.toBe(hashB);
    expect(hashA).toBe(sha256Hex('{"pensioners":1}'));
    expect(sha256Hex('{"pensioners":1}')).not.toBe(sha256Hex('{"pensioners":1} '));
  });

  it('AC-001-03: a figure with a missing or empty manifest field is rejected', () => {
    const emptyHash = { ...manifestFor('bytes'), inputHash: '' };
    const missingFormula = { ...manifestFor('bytes') } as Record<string, unknown>;
    delete missingFormula.formulaId;
    const unknownFormula = { ...manifestFor('bytes'), formulaId: 'invented.v9' };
    const missingFile = { ...manifestFor('bytes'), reproducePath: 'scripts/does-not-exist.ts' };

    for (const candidate of [emptyHash, missingFormula, unknownFormula, missingFile]) {
      const result = validateManifest(candidate, { fileExists });
      expect(result.ok).toBe(false);
    }
  });

  it('AC-001-74: availability separates a computed figure from a never-computed figure', () => {
    const computed = makeFigure({
      figureId: 'fig-01',
      formulaId: 'dependency-ratio.v1',
      unit: 'ratio',
      value: dependencyValue(),
    });
    const unavailable = makeFigure({
      figureId: 'fig-01',
      formulaId: 'dependency-ratio.v1',
      unit: 'ratio',
      value: null,
      availability: 'unavailable',
      unresolvedSources: ['ss-pensioners'],
      unresolvedReason: 'ss-pensioners: series not yet specified',
    });

    for (const figure of [computed, unavailable]) {
      expect(validateDerivedFigure(figure, { fileExists }), figure.figureId).toEqual([]);
    }
    expect(computed.availability).toBe('computed');
    expect(computed.value).not.toBeNull();
    expect(unavailable.availability).toBe('unavailable');
    expect(unavailable.value).toBeNull();

    // No loophole: `unavailable` cannot carry a value, `computed` cannot lack a manifest.
    const unavailableWithValue = { ...unavailable, value: dependencyValue() };
    const computedWithoutManifest = { ...computed, manifest: { ...computed.manifest, inputHash: '' } };
    const unknownAvailability = { ...computed, availability: 'withheld' };

    expect(validateDerivedFigure(unavailableWithValue, { fileExists }).map((p) => p.code)).toContain(
      'unavailable-with-value',
    );
    expect(validateDerivedFigure(computedWithoutManifest, { fileExists }).map((p) => p.code)).toContain(
      'manifest-invalid',
    );
    expect(validateDerivedFigure(unknownAvailability, { fileExists }).map((p) => p.code)).toContain(
      'unknown-availability',
    );
  });
});
