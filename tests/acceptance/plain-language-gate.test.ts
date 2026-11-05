import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BANNED_TOP_TERMS, scanTopRegion, topRegionOf } from '../../web/build/public-plain-language';
import { internalTermsOf } from '../../web/build/public-vocabulary';
import { checkLocale } from '../../scripts/check-plain-language';
import { LOCALES } from '../../web/content/types';
import { seriesFixtures } from '../fixtures/series';
import { storyPage } from '../helpers/story';

/**
 * AC-004-38…41 — the plain-language gate (spec 004 T9).
 *
 * The gate is the mechanical half of a copy rule: no dataset identifier, no series name, no
 * "dependency ratio" phrase in any of five locales, in text nodes or in a name a screen reader
 * reads. These tests drive the module directly and the CLI once, so a green gate cannot hide a
 * red rule.
 */
const IDENTIFIERS = internalTermsOf([], seriesFixtures());

describe('AC-004-38: the gate exists, with the named terms in five languages', () => {
  it('AC-004-38: BANNED_TOP_TERMS covers the phrase, the ids and the series name', () => {
    const terms = BANNED_TOP_TERMS.map((term) => term.toLowerCase());
    for (const phrase of [
      'ratio de dependencia',
      'dependency ratio',
      'ratio de dépendance',
      'altersquotient',
      'rapporto di dipendenza',
    ]) {
      expect(terms, phrase).toContain(phrase);
    }
    for (const id of ['demo_pjan', 'esspros', 'spr_exp_pens', 'proj_23np']) {
      expect(terms, id).toContain(id);
    }
    for (const series of [
      'proyecciones demográficas',
      'demographic projections',
      'projections démographiques',
      'bevölkerungsvorausberechnung',
      'proiezioni demografiche',
    ]) {
      expect(terms, series).toContain(series);
    }
    expect(typeof scanTopRegion).toBe('function');
  });
});

describe('AC-004-39: the shipped top region passes in every locale', () => {
  it('AC-004-39: no hit, and the build step is wired', () => {
    for (const locale of LOCALES) {
      expect(scanTopRegion(storyPage(locale), locale, IDENTIFIERS), locale).toEqual([]);
      expect(checkLocale(locale, IDENTIFIERS), locale).toEqual([]);
    }
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['check:plain-language']).toBe('tsx scripts/check-plain-language.ts');
    expect(pkg.scripts['prebuild']).toContain('scripts/check-plain-language.ts');
  });
});

describe('AC-004-40: the gate fails on jargon', () => {
  it('AC-004-40: a banned term in the top region is reported', () => {
    const fixture = '<main id="main"><section data-top-step="number">La ratio de dependencia sube</section><div class="story__strip"></div></main>';
    const hits = scanTopRegion(fixture, 'es');
    expect(hits.map((hit) => hit.term)).toContain('ratio de dependencia');
    expect(hits[0]?.context).toContain('dependencia');
  });
});

describe('AC-004-41: the gate sees attribute copy and repository identifiers', () => {
  it('AC-004-41: an aria-label hit, an internal-identifier hit, and an operator subtree that is not', () => {
    const attributeOnly =
      '<main id="main"><section data-top-step="number"><div class="clock" aria-label="ESSpros, 2042"></div></section><div class="story__strip"></div></main>';
    expect(scanTopRegion(attributeOnly, 'es').map((hit) => hit.term)).toContain('esspros');

    const identifier =
      '<main id="main"><section data-top-step="why">proj_23np</section><div class="story__strip"></div></main>';
    expect(scanTopRegion(identifier, 'es', IDENTIFIERS).map((hit) => hit.term)).toContain('proj_23np');

    const operator =
      '<main id="main"><section data-top-step="number"><details data-operator="true">demo_pjan</details></section><div class="story__strip"></div></main>';
    expect(scanTopRegion(operator, 'es')).toEqual([]);
    expect(topRegionOf(operator)).toContain('demo_pjan');
  });
});
