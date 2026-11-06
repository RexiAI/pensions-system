import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { LOCALES } from '../../web/content/types';
import { content, renderComponent } from '../fixtures/figures';
import { pyramidSeries } from '../fixtures/series';
import { BROWSER_READY, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-27, AC-006-28 — observed vs projected, by form (Task 10).
 *
 * The distinction must survive the removal of the amber, and it must be a paint that actually
 * renders: `CSS.supports('fill','url(#…)')` is true while a CSS gradient function is false in
 * Chromium, so a criterion that asked only "is a hatch declared" would pass on a mechanism that
 * paints nothing.
 */
const CSS = readFileSync('web/styles/globals.css', 'utf8');

function renderPyramid(locale = 'es'): string {
  return renderComponent(PyramidPlate, { content: content(locale), series: pyramidSeries() });
}

describe('AC-006-27: the panels share one hue, and each prints its state', () => {
  it('AC-006-27: reference, measured and projected resolve one --demography-hue', () => {
    const hues = [...CSS.matchAll(/--demography-hue:\s*var\(--([a-z0-9-]+)\)/g)].map((match) => match[1]);
    expect(hues).toEqual(['ink-2', 'ink-2', 'ink-2']);
    expect(new Set(hues).size).toBe(1);
  });

  it('AC-006-27: each panel prints its state word beside it, in every locale', () => {
    for (const locale of LOCALES) {
      const html = renderPyramid(locale);
      const local = content(locale);
      expect(html, locale).toContain(local.t('demography.year.observed'));
      expect(html, locale).toContain(local.t('demography.year.projected'));
      const states = [...html.matchAll(/demography__panel-state">([^<]*)</g)].map((match) => match[1]);
      expect(states, locale).toEqual([
        local.t('demography.year.observed'),
        local.t('demography.year.observed'),
        local.t('demography.year.projected'),
      ]);
    }
  });

  it('AC-006-27: no panel carries a hue modifier of its own', () => {
    const reference = CSS.slice(CSS.indexOf('.demography__panel--reference'), CSS.indexOf('.demography__bar {'));
    expect(reference).not.toContain('chart-series-2');
    expect(reference).not.toContain('chart-projection');
  });
});

describe('AC-006-28: the projected series differs by a form that paints', () => {
  it('AC-006-28: the projected panel defines an SVG pattern and fills its bars with it', () => {
    const html = renderPyramid();
    expect(html).toContain('id="projection-hatch"');
    expect(html).toContain('<pattern');
    // Defined inside the panel that uses it, and only there: one projected panel renders.
    expect(html.split('id="projection-hatch"').length - 1).toBe(1);
    expect(CSS).toMatch(/\.demography__panel--projected \.demography__bar\s*\{[^}]*fill:\s*url\(#projection-hatch\)/s);
    // The observed panels never reference it.
    expect(CSS).not.toMatch(/\.demography__panel--(?:reference|measured) \.demography__bar\s*\{[^}]*url\(/s);
    // A CSS gradient function is not the mechanism.
    expect(CSS).not.toMatch(/fill:\s*repeating-linear-gradient/);
  });
});

describe.skipIf(!BROWSER_READY)('the form encoding paints in Chromium', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-28: the fill is a valid paint and the gradient function is not', async () => {
    const supports = await served.measure<{ url: boolean; gradient: boolean }>(
      'es',
      { width: 1440, height: 900 },
      `(() => ({
        url: CSS.supports('fill', 'url(#projection-hatch)'),
        gradient: CSS.supports('fill', 'repeating-linear-gradient(45deg, #000 0 3px, #fff 3px 4px)'),
      }))()`,
    );
    expect(supports.url).toBe(true);
    expect(supports.gradient).toBe(false);
  }, 120_000);

  it('AC-006-28: the projected bars compute the pattern fill and the observed bars do not', async () => {
    const fills = await served.measure<{ projected: string[]; observed: string[]; patternCount: number }>(
      'es',
      { width: 1440, height: 900 },
      `(() => {
        const panels = [...document.querySelectorAll('.demography__panel')];
        const fillsOf = (panel) => [...panel.querySelectorAll('.demography__bar')].map((bar) => getComputedStyle(bar).fill);
        const projected = panels.find((panel) => panel.getAttribute('data-projection') === 'projected');
        const observed = panels.filter((panel) => panel.getAttribute('data-projection') !== 'projected');
        return {
          projected: fillsOf(projected),
          observed: observed.flatMap(fillsOf),
          patternCount: document.querySelectorAll('pattern#projection-hatch').length,
        };
      })()`,
    );
    expect(fills.patternCount).toBe(1);
    expect(fills.projected.every((fill) => fill.includes('projection-hatch')), fills.projected.join(' ')).toBe(true);
    expect(fills.observed.some((fill) => fill.includes('projection-hatch')), fills.observed.join(' ')).toBe(false);
  }, 120_000);
});
