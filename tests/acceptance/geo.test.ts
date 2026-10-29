import { describe, expect, it } from 'vitest';
import { FIGURES } from '../../web/ingest/figures';
import { runCompute } from '../../web/ingest/run-compute';
import type { ComputeOptions } from '../../web/ingest/run-compute';
import {
  COUNTRY_CONFIGURATIONS,
  PUBLISHED_GEO,
  countryConfiguration,
  definitionAvailabilityForCountry,
  isPublishedGeo,
  publishedGeos,
  sourcesForDefinition,
} from '../../web/sources/countries';
import type { CountryConfiguration } from '../../web/sources/countries';
import { contentRegistry } from '../../web/content/registry';
import { loadSnapshots } from '../../web/sources/load';
import { makeFigure, nationalDependencyFigure } from '../fixtures/figures';
import type { DerivedFigure } from '../../web/ingest/types';

const NOW = new Date('2026-10-25T12:00:00Z');

function options(overrides: Partial<ComputeOptions> = {}): ComputeOptions {
  return {
    figures: FIGURES,
    snapshots: loadSnapshots('data/snapshots'),
    now: NOW,
    freshnessWindowDays: 45,
    reproducePath: 'scripts/compute.ts',
    fileExists: (path) => path === 'scripts/compute.ts',
    ...overrides,
  };
}

/**
 * A second country's configuration: a data row, not a code branch. The snapshots it points at
 * are the committed fixtures, so this test proves the resolution path, not the numbers.
 */
type AvailabilityEntry = ReturnType<typeof definitionAvailabilityForCountry>[number];

function entryFor(entries: AvailabilityEntry[], definitionId: string): AvailabilityEntry {
  const found = entries.find((entry) => entry.definitionId === definitionId);
  if (!found) throw new Error(`no availability entry for ${definitionId}`);
  return found;
}

function figureFor(report: ReturnType<typeof runCompute>, figureId: string): DerivedFigure {
  const found = report.figures.find((figure) => figure.figureId === figureId);
  if (!found) throw new Error(`no figure ${figureId}`);
  return found;
}

function computedDefinitions(report: ReturnType<typeof runCompute>): string[] {
  return report.figures
    .filter((figure) => figure.availability === 'computed')
    .map((figure) => figure.definitionId);
}

const PORTUGAL: CountryConfiguration = {
  geo: 'PT',
  sources: {
    'dependency-ratio.international': ['eurostat-spr-pns-ben', 'eurostat-lfsi-emp-a'],
    'pension-expenditure-gdp.international': ['eurostat-spr-exp-pens'],
  },
};

/** A country that has a source for metric 2 but none for metric 1. */
const PARTIAL: CountryConfiguration = {
  geo: 'PT',
  sources: { 'pension-expenditure-gdp.international': ['eurostat-spr-exp-pens'] },
};

describe('geo as data', () => {
  it('AC-001-79: the international path takes geo as data, so a second country is a config row', () => {
    const countries = [...COUNTRY_CONFIGURATIONS, PORTUGAL];
    expect(countryConfiguration('ES')?.geo).toBe('ES');
    expect(countryConfiguration('pt', countries)?.geo).toBe('PT');

    // No new code path: the same pipeline computes the second country from its own rows.
    const es = runCompute(options({ geo: 'ES' }));
    const pt = runCompute(options({ geo: 'PT', countries }));
    const computed = (report: typeof es): string[] =>
      report.figures.filter((figure) => figure.availability === 'computed').map((figure) => figure.figureId);

    expect(computed(es)).toEqual(['fig-01', 'fig-02']);
    expect(computed(pt)).toEqual(['fig-01', 'fig-02']);
    expect(pt.exitCode).toBe(0);
    expect(sourcesForDefinition('PT', 'dependency-ratio.international', countries)).toEqual([
      'eurostat-spr-pns-ben',
      'eurostat-lfsi-emp-a',
    ]);
  });

  it('AC-001-80: only ES is published, and another country is not silently rendered', () => {
    expect(publishedGeos()).toEqual(['ES']);
    expect(PUBLISHED_GEO).toBe('ES');
    expect(isPublishedGeo('ES')).toBe(true);
    expect(isPublishedGeo('DE')).toBe(false);
    expect(countryConfiguration('DE')).toBeUndefined();

    // The content model refuses the country outright instead of reusing Spain's copy.
    const content = contentRegistry.get('DE', 'es');
    expect(content.ok).toBe(false);
    if (content.ok) return;
    expect(content.error.code).toBe('unsupported-country');

    // Nothing is computed for a country with no configuration, and the run fails loudly.
    const report = runCompute(options({ geo: 'DE' }));
    expect(report.exitCode).not.toBe(0);
    expect(report.figures.every((figure) => figure.availability !== 'computed')).toBe(true);
    expect(report.problems.map((problem) => problem.code)).toContain('country-not-configured');
  });

  it('AC-001-81: a definition missing for a country renders unavailable, never a substitute', () => {
    const countries = [...COUNTRY_CONFIGURATIONS, PARTIAL];
    const forPortugal = definitionAvailabilityForCountry('PT', countries);
    const forSpain = definitionAvailabilityForCountry('ES');
    const ptDependency = entryFor(forPortugal, 'dependency-ratio.international');
    const esDependency = entryFor(forSpain, 'dependency-ratio.international');

    expect(esDependency.availability).toBe('available');
    // PT has no source for metric 1: that definition is unavailable there, with its
    // definitionId untouched and no substitute definition taking its place.
    expect(ptDependency.availability).toBe('unavailable');
    expect(ptDependency.definitionId).toBe(esDependency.definitionId);
    expect(ptDependency.sourceIds).toEqual([]);
    expect(entryFor(forPortugal, 'dependency-ratio.national').availability).toBe(
      'not-country-parameterised',
    );

    // Rendering both countries: PT publishes fig-01 as unavailable under the same definition,
    // while the definition it does have a source for still computes.
    const report = runCompute(options({ geo: 'PT', countries }));
    const dependency = figureFor(report, 'fig-01');
    expect(dependency.definitionId).toBe('dependency-ratio.international');
    expect(dependency.availability).toBe('unavailable');
    expect(dependency.value).toBeNull();
    expect(computedDefinitions(report)).toEqual(['pension-expenditure-gdp.international']);
  });

  it('AC-001-81: a national definition is published only for its own country', () => {
    const national = definitionAvailabilityForCountry('ES').filter(
      (entry) => entry.availability === 'not-country-parameterised',
    );

    expect(national.map((entry) => entry.definitionId).sort()).toEqual(
      [
        'contribution-cover.national',
        'cohort-return.national',
        'dependency-ratio.national',
        'implicit-debt.national',
        'required-base-growth.national',
      ].sort(),
    );
    // A national figure keeps its definitionId while it is unavailable.
    const figure = nationalDependencyFigure();
    expect(figure.definitionId).toBe('dependency-ratio.national');
    expect(figure.availability).toBe('unavailable');
    expect(makeFigure({ figureId: 'fig-06', unit: 'ratio', value: null }).definitionId).toBe(
      'dependency-ratio.national',
    );
  });
});
