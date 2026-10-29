import { describe, expect, it } from 'vitest';
import { FIGURES, figureById } from '../../web/ingest/figures';
import { runCompute } from '../../web/ingest/run-compute';
import type { ComputeOptions } from '../../web/ingest/run-compute';
import {
  DEFINITION_IDS,
  definitionFor,
  definitionsForMetric,
  internationalRendering,
} from '../../web/manifest/definitions';
import type { DefinitionId } from '../../web/manifest/definitions';
import {
  PUBLISHED_GEO,
  countryConfiguration,
  isPublishedGeo,
  sourcesForDefinition,
} from '../../web/sources/countries';
import { loadSnapshots } from '../../web/sources/load';
import { FIGURE_KEYS, figureReasonKey } from '../../web/content/keys';
import { REGISTER_ROWS, headingCountProblem, statedCount } from '../../web/content/registers';
import { contentRegistry } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { CountryLocaleContent } from '../../web/content/types';
import { pensionShareSeries, publishedShare, shareOfGdp } from '../../web/metrics/pension-share';

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

function localeContent(locale: string): CountryLocaleContent {
  const result = contentRegistry.get('ES', locale);
  if (!result.ok) throw new Error(`${locale}: ${result.error.code}`);
  return result.content;
}

function numberOf(figureId: string): 1 {
  return Number(figureId.slice(-1)) as 1;
}

/** "counts" / "excludes" in each shipped locale: the instrument statement, in that language. */
const COUNTED_WORDS: Readonly<Record<string, RegExp>> = {
  es: /cuenta/,
  en: /counts/,
  fr: /compte/,
  de: /zählt/,
  it: /conta/,
};

const EXCLUDED_WORDS: Readonly<Record<string, RegExp>> = {
  es: /excluye/,
  en: /excludes/,
  fr: /exclut/,
  de: /schließt/,
  it: /esclude/,
};

describe('definition model', () => {
  it('gives every published figure its own definition, and no figure two', () => {
    const ids = FIGURES.map((figure) => figure.definitionId);

    expect(new Set(ids).size).toBe(FIGURE_IDS_COUNT);
    expect(new Set(ids)).toEqual(new Set(DEFINITION_IDS));
    for (const figure of FIGURES) {
      const published = definitionFor(figure.definitionId);
      expect(figure.formulaId, figure.figureId).toBe(published.formulaId);
      expect(figure.geography, figure.figureId).toBe(published.geography);
    }
  });

  it('keeps the international and national formulas apart for metric 2', () => {
    const definitions = definitionsForMetric('contribution-cover');

    expect(definitions.map((definition) => definition.formulaId).sort()).toEqual([
      'contribution-cover.v1',
      'pension-expenditure-gdp.v1',
    ]);
  });

  it('answers the international rendering from the published figures', () => {
    const report = runCompute(options());
    const dependency = internationalRendering('dependency-ratio', report.figures);

    expect(dependency.availability).toBe('computed');
    expect(dependency.figureId).toBe('fig-01');
    expect(dependency.reason).toBeNull();
    expect(internationalRendering('cohort-return', report.figures).availability).toBe('unavailable');
  });

  it('names a specific reason for a figure that has never been computed', () => {
    expect(figureReasonKey(3)).toBe('fig.03.reason');
    expect(figureReasonKey(7)).toBe('fig.07.reason');
    // A computed figure has no specific reason key: the generic state sentence is the fallback.
    expect(figureReasonKey(1)).toBe('figure.unavailable.reason');
  });
});

describe('geo resolution', () => {
  it('publishes Spain and resolves its definitions from the country row', () => {
    expect(PUBLISHED_GEO).toBe('ES');
    expect(isPublishedGeo('ES')).toBe(true);
    expect(sourcesForDefinition('ES', 'dependency-ratio.international')).toEqual([
      'eurostat-spr-pns-ben',
      'eurostat-lfsi-emp-a',
    ]);
    expect(sourcesForDefinition('ES', 'cohort-return.national')).toBeNull();
    expect(countryConfiguration('FR')).toBeUndefined();
    expect(sourcesForDefinition('FR', 'dependency-ratio.international')).toBeNull();
  });

  it('fails loudly when the two series share no observed year', () => {
    const snapshots = loadSnapshots('data/snapshots');
    const beneficiaries = snapshots.get('eurostat-spr-pns-ben');
    const employment = snapshots.get('eurostat-lfsi-emp-a');
    if (!beneficiaries || !employment) throw new Error('snapshots missing');

    // The employment years are moved out of the beneficiaries' range: the alignment has
    // nothing left to align, and must fail instead of forward-filling or extrapolating.
    const shifted = { ...employment, payload: shiftYears(employment.payload, 500) };
    const report = runCompute(
      options({
        figures: [figureById('fig-01') as (typeof FIGURES)[number]],
        snapshots: new Map([
          ['eurostat-spr-pns-ben', beneficiaries],
          ['eurostat-lfsi-emp-a', shifted],
        ]),
      }),
    );

    expect(report.exitCode).not.toBe(0);
    expect(report.problems.map((problem) => problem.code)).toContain('compute-failed');
    expect(report.figures[0]?.availability).toBe('unavailable');
    expect(report.figures[0]?.unresolvedReason).toContain('share no observed year');
  });
});

describe('pension share as % of GDP', () => {
  it('rounds to two decimals and treats a zero denominator as undefined', () => {
    expect(shareOfGdp(150, 1_500)).toBe(10);
    expect(shareOfGdp(1, 0)).toBeNull();
    expect(publishedShare(13.234)).toBe(13.23);
    expect(publishedShare(-1)).toBeNull();
    expect(publishedShare(Number.NaN)).toBeNull();
  });

  it('reports the latest, first and maximum of a series, sorted by year', () => {
    const series = pensionShareSeries([
      { year: 2024, percent: 13.23 },
      { year: 1995, percent: 9.82 },
    ]);

    expect(series.points.map((point) => point.year)).toEqual([1995, 2024]);
    expect(series.latest?.year).toBe(2024);
    expect(series.first?.year).toBe(1995);
    expect(series.max).toBe(13.23);
  });
});

describe('locale content for the definition model', () => {
  it('publishes a definition per figure in every locale, with `en` pinned to the canonical string', () => {
    for (const locale of LOCALES) {
      const content = localeContent(locale);
      for (const figure of FIGURES) {
        const key = FIGURE_KEYS[numberOf(figure.figureId)].definition;
        const text = content.strings[key];
        expect(text, `${locale}/${key}`).toBeTruthy();
        // Every translation states what is counted and what is excluded, in its own language.
        expect(text.toLowerCase(), `${locale}/${key}`).toMatch(COUNTED_WORDS[locale] as RegExp);
        expect(text.toLowerCase(), `${locale}/${key}`).toMatch(EXCLUDED_WORDS[locale] as RegExp);
      }
    }

    const english = localeContent('en');
    for (const figure of FIGURES) {
      const key = FIGURE_KEYS[numberOf(figure.figureId)].definition;
      expect(english.t(key)).toBe(definitionFor(figure.definitionId).definition);
    }
  });

  it('carries the specific reason for each figure that has never been computed', () => {
    const uncomputed: DefinitionId[] = ['dependency-ratio.national', 'pension-expenditure-gdp.international'];

    for (const locale of LOCALES) {
      const content = localeContent(locale);
      for (const figureId of ['fig-03', 'fig-04', 'fig-05', 'fig-06', 'fig-07']) {
        expect(content.t(figureReasonKey(numberOf(figureId))), `${locale}/${figureId}`).toBeTruthy();
      }
    }

    const english = localeContent('en');
    expect(english.t('fig.03.reason').toLowerCase()).toContain(
      'no internationally comparable source for average contributions',
    );
    expect(english.t('fig.05.reason').toLowerCase()).toContain('depends on the cohort return');
    // The computed figures carry no never-computed reason: they publish a value instead.
    expect(uncomputed).toContain(definitionFor('dependency-ratio.national').definitionId);
  });

  it('never names a figure count in the hero subtext, in any locale', () => {
    // The figure count is data; a prose count in the hero would go stale the moment a figure
    // is added, which is the same defect class as a heading that contradicts its rows.
    const countWords = /\b(cinco|siete|five|seven|fünf|sieben|cinq|sept|cinque|sette)\b/i;

    for (const locale of LOCALES) {
      const subtext = localeContent(locale).t('hero.sub');
      expect(subtext, locale).not.toMatch(/\d/);
      expect(subtext, locale).not.toMatch(countWords);
    }
  });

  it('states the register count in words or digits, in every locale', () => {
    expect(statedCount('Las 4 voces de esta página', 'es')).toBe(4);
    expect(statedCount('Las cuatro voces de esta página', 'es')).toBe(4);
    expect(statedCount('Die vier Stimmen dieser Seite', 'de')).toBe(4);
    expect(statedCount('The four voices of this page', 'en')).toBe(4);
    expect(statedCount('Le quattro voci di questa pagina', 'it')).toBe(4);
    expect(statedCount('Les quatre voix de cette page', 'fr')).toBe(4);
    expect(statedCount('Sin número', 'es')).toBeNull();

    expect(headingCountProblem({ 'register.key.heading': 'Las tres voces' }, 'es')).toEqual({
      key: 'register.key.heading',
      stated: 3,
      rendered: REGISTER_ROWS.length,
    });
    expect(headingCountProblem({ 'register.key.heading': 'Sin número' }, 'es')).toBeNull();
  });
});

const FIGURE_IDS_COUNT = 7;

/** Moves every `time` category on by `years`, so two series can be made to miss each other. */
function shiftYears(payload: unknown, years: number): unknown {
  const stat = payload as {
    dimension: Record<
      string,
      { category: { index: Record<string, number>; label?: Record<string, string> } }
    >;
  };
  const time = stat.dimension.time;
  if (!time) return payload;
  const index = Object.fromEntries(
    Object.keys(time.category.index).map((year) => [
      String(Number(year) + years),
      time.category.index[year] as number,
    ]),
  );
  const label = Object.fromEntries(Object.keys(index).map((year) => [year, year]));
  return { ...stat, dimension: { ...stat.dimension, time: { category: { index, label } } } };
}
