import { describe, expect, it } from 'vitest';
import { bandLabel } from '../../web/series/age-bands';
import type { PyramidValue } from '../../web/series/age-structure';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { pyramidSeries, seriesFixtures, unavailableSeries } from '../fixtures/series';
import { metodoPage, stepOf, storyPage, textOf } from '../helpers/story';

/**
 * AC-004-13…19 — step 3, the pyramid (spec 004 T4). The panels are the page's explanation, so the
 * criteria are about what the face carries: three charts, three annotations, and the numerals in a
 * disclosure.
 */
const PYRAMID = pyramidSeries();
const VALUE = PYRAMID.value as PyramidValue;

function step(): string {
  return stepOf(storyPage(), 'why');
}

describe('AC-004-13: the pyramid is the third step and precedes the figures', () => {
  it('AC-004-13: #demografia is inside the why step, between breakage and distance', () => {
    const html = storyPage();
    const section = stepOf(html, 'why');
    expect(section).toContain('id="demografia"');
    const ids = [...html.matchAll(/data-top-step="([a-z]+)"/g)].map((match) => match[1]);
    expect(ids.indexOf('why')).toBe(2);
    expect(ids).toEqual(['number', 'breakage', 'why', 'distance', 'meaning']);
    // Spec 007: Cifras owns #figuras, so Historia carries no plate region at all.
    expect(html).not.toContain('id="figuras"');
  });
});

describe('AC-004-14: no four-percentage headline on the pyramid’s face', () => {
  it('AC-004-14: the h2 has no %, and the block up to the first panel has at most one', () => {
    for (const locale of LOCALES) {
      const section = stepOf(storyPage(locale), 'why');
      const heading = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(section)?.[1] ?? '';
      expect(heading, locale).not.toContain('%');
      const between = section.slice(section.indexOf('</h2>'), section.indexOf('demography__panels'));
      expect((between.match(/%/g) ?? []).length, locale).toBeLessThanOrEqual(1);
      expect(between, locale).not.toContain('demography__finding');
      expect(between, locale).not.toContain('demography__readout');
    }
  });
});

describe('AC-004-15: the finding and the readout survive, collapsed, below the panels', () => {
  it('AC-004-15: both render inside the disclosure that follows the three panels', () => {
    const section = step();
    const details = section.slice(section.indexOf('<details'));
    expect(details).toContain('demography__finding');
    expect(details).toContain('demography__readout');
    expect(details).toContain('<table>');
    // The disclosure opens after the last panel.
    expect(section.indexOf('<details')).toBeGreaterThan(section.lastIndexOf('demography__panel demography__panel'));
    expect(textOf(details.slice(0, details.indexOf('>')))).toBe(textOf(details.slice(0, details.indexOf('>'))));
  });
});

describe('AC-004-16: three panels, one annotation each, naming a band', () => {
  it('AC-004-16: three annotations, each carrying a published band label', () => {
    for (const locale of LOCALES) {
      const section = stepOf(storyPage(locale), 'why');
      expect(section.split('demography__annotation').length - 1, locale).toBe(3);
      const annotations = [...section.matchAll(/<p class="demography__annotation">([^<]*)<\/p>/g)].map((match) =>
        textOf(match[1] ?? ''),
      );
      expect(annotations, locale).toHaveLength(3);
      const labels = VALUE.years.map((year) =>
        bandLabel([...year.bands].sort((a, b) => b.total - a.total)[0]?.band ?? 0),
      );
      for (const [index, annotation] of annotations.entries()) {
        const matchesAny = [...labels, bandLabel(0)].some((label) => annotation.includes(label));
        expect(matchesAny, `${locale}/${index}: ${annotation}`).toBe(true);
        expect(annotation.trim().length, `${locale}/${index}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('AC-004-17: accessibility of the chart is unchanged by the move', () => {
  it('AC-004-17: each svg keeps role=img and its own title, and the table is emitted with them', () => {
    const section = step();
    expect(section.split('class="demography__svg"').length - 1).toBe(3);
    expect(section.split('role="img"').length - 1).toBe(3);
    expect(section.split('<title id="demography-').length - 1).toBe(3);
    expect(section).toContain('<table>');
    expect(section.split('scope="row"').length - 1).toBe(21);
    // No chart without its table: the unavailable case emits neither (AC-004-19).
    const empty = storyPage('es', { series: seriesFixtures().filter((entry) => entry.seriesId !== 'pyramid') });
    expect(empty).not.toContain('demography__svg');
    expect(empty).not.toContain('demography-table');
  });
});

describe('AC-004-18: the pyramid’s provenance is not in step 3', () => {
  it('AC-004-18: no operator subtree in step 3, and the strip renders in #metodo', () => {
    const html = storyPage();
    expect(stepOf(html, 'why')).not.toContain('data-operator="true"');
    const method = metodoPage();
    expect(method).toContain('data/derived/series');
    expect(method).toContain(PYRAMID.manifest.formulaId);
  });
});

describe('AC-004-19: no pyramid series, no step', () => {
  it('AC-004-19: no heading, no panel, no body text and no unavailable row', () => {
    for (const series of [
      seriesFixtures().filter((entry) => entry.seriesId !== 'pyramid'),
      seriesFixtures().map((entry) => (entry.seriesId === 'pyramid' ? unavailableSeries(entry) : entry)),
    ]) {
      const html = storyPage('es', { series });
      expect(html).not.toContain('data-top-step="why"');
      expect(html).not.toContain('demography__svg');
      expect(html).not.toContain(content('es').t('figure.unavailable.reason'));
      const ids = [...html.matchAll(/data-top-step="([a-z]+)"/g)].map((match) => match[1]);
      expect(ids).toEqual(['number', 'breakage', 'distance', 'meaning']);
    }
  });
});
