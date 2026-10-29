import { describe, expect, it } from 'vitest';
import {
  DEFINITION_IDS,
  definitionFor,
  definitionVocabularyProblems,
  definitionsForMetric,
  isDefinitionId,
} from '../../web/manifest/definitions';
import type { Manifest } from '../../web/manifest/types';
import { validateManifest } from '../../web/manifest/validate';
import { validateDerivedFigure } from '../../web/ingest/validate-figure';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { makeFigure } from '../fixtures/figures';

const fileExists = (path: string): boolean => path === 'scripts/compute.ts';

describe('published definitions', () => {
  it('AC-001-77: a figure carries a definitionId and a published definition string', () => {
    const figure = makeFigure({ figureId: 'fig-01', unit: 'ratio', value: { points: [] } });
    const serialised = JSON.parse(JSON.stringify(figure)) as typeof figure;

    expect(isDefinitionId(serialised.definitionId)).toBe(true);
    expect(serialised.definition.length).toBeGreaterThan(0);
    expect(serialised.definition).toBe(definitionFor(serialised.definitionId).definition);
    expect(serialised.manifest.definitionId).toBe(serialised.definitionId);

    // What the site actually publishes, not only what a fixture can be made to say.
    const published = readDerivedFigures('data/derived');
    expect(published.length).toBe(DEFINITION_IDS.length);
    // Every published definition reaches the reader exactly once, on one figure.
    expect(new Set(published.map((entry) => entry.definitionId))).toEqual(new Set(DEFINITION_IDS));
    for (const entry of published) {
      expect(isDefinitionId(entry.definitionId), entry.figureId).toBe(true);
      expect(entry.definition.length, entry.figureId).toBeGreaterThan(0);
      expect(entry.manifest.definitionId, entry.figureId).toBe(entry.definitionId);
      expect(validateDerivedFigure(entry, { fileExists }), entry.figureId).toEqual([]);
    }
  });

  it('AC-001-77: a reader sees the definition that produced each number, per metric', () => {
    // Every metric that publishes more than one number publishes a different definitionId for
    // each, so two numbers can never be compared without the difference being visible.
    for (const metric of ['dependency-ratio', 'contribution-cover'] as const) {
      const definitions = definitionsForMetric(metric);
      expect(definitions.length, metric).toBe(2);
      expect(new Set(definitions.map((definition) => definition.definitionId)).size).toBe(2);
      expect(new Set(definitions.map((definition) => definition.definition)).size).toBe(2);
    }
  });

  it('AC-001-78: an unknown definitionId fails validation', () => {
    const figure = makeFigure({ figureId: 'fig-01', unit: 'ratio', value: null, availability: 'unavailable' });
    const unknownFigure = { ...figure, definitionId: 'dependency-ratio.invented' };
    const unknownManifest = {
      ...figure,
      manifest: { ...figure.manifest, definitionId: 'dependency-ratio.invented' } as unknown as Manifest,
    };

    expect(validateDerivedFigure(unknownFigure, { fileExists }).map((p) => p.code)).toContain(
      'unknown-definition',
    );
    expect(validateDerivedFigure(unknownManifest, { fileExists }).map((p) => p.code)).toContain(
      'manifest-invalid',
    );

    const manifest = validateManifest(
      { ...figure.manifest, definitionId: 'dependency-ratio.invented' },
      { fileExists },
    );
    expect(manifest.ok).toBe(false);
    if (manifest.ok) return;
    expect(manifest.problems.map((problem) => problem.code)).toContain('unknownDefinitionId');
  });

  it('AC-001-78: a definition string that is not the one its definitionId names is rejected', () => {
    const figure = makeFigure({ figureId: 'fig-01', unit: 'ratio', value: null, availability: 'unavailable' });
    const swapped = { ...figure, definition: definitionFor('dependency-ratio.national').definition };

    expect(validateDerivedFigure(swapped, { fileExists }).map((p) => p.code)).toContain(
      'definition-mismatch',
    );
    expect(validateDerivedFigure({ ...figure, definition: '' }, { fileExists }).map((p) => p.code)).toContain(
      'missing-definition',
    );
  });

  it('AC-001-92: a definition string states what is counted and what is excluded, without adjectives', () => {
    for (const definitionId of DEFINITION_IDS) {
      const definition = definitionFor(definitionId).definition;
      expect(definition, definitionId).toMatch(/counts/i);
      expect(definition, definitionId).toMatch(/excludes/i);
      expect(definitionVocabularyProblems(definition), definitionId).toEqual([]);
    }
  });

  it('AC-001-92: thesis vocabulary in a definition is rejected', () => {
    const planted = ['una pirámide de pagos', 'this is fraud', 'un sistema insostenible', 'un reparto injusto'];

    for (const text of planted) {
      expect(definitionVocabularyProblems(text), text).not.toEqual([]);
    }
    expect(definitionVocabularyProblems('Counts beneficiaries. Excludes survivors.')).toEqual([]);

    const figure = makeFigure({ figureId: 'fig-01', unit: 'ratio', value: null, availability: 'unavailable' });
    const thesisDefinition = { ...figure, definition: 'Counts fraud. Excludes nothing.' };
    expect(
      validateDerivedFigure(thesisDefinition, { fileExists }).map((problem) => problem.code),
    ).toContain('definition-vocabulary');
  });
});
