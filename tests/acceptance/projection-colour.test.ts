import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue, pyramidSeries } from '../fixtures/series';

/**
 * AC-001-106, re-pointed by spec 006 T10.
 *
 * The criterion used to encode the projected value with a dash, a position, a printed word **and**
 * an amber hue literal. The hue clauses are dropped: the form encoding is the *only* encoding now,
 * and what must hold is that the form paints — `CSS.supports('fill','url(#…)')` is true while a
 * CSS gradient function is false in Chromium (AC-006-27, AC-006-28).
 */
const ES = content('es');
const CSS = readFileSync('web/styles/globals.css', 'utf8');

function renderPyramid(): string {
  return renderComponent(PyramidPlate, { content: ES, series: pyramidSeries() });
}

/** The countdown's precision, where the threshold year is printed beside its label. */
function renderCountdown(): string {
  return renderComponent(MethodRegion, {
    content: ES,
    sources: { countdown: countdownValue() },
    freshnessWindowDays: 45,
    nowMs: Date.parse('2026-10-31T10:00:00Z'),
    countries: [{ geo: 'ES', name: ES.country.name, href: '#' }],
  });
}

describe('AC-001-106: a projected value is encoded by form and a printed word, not hue alone', () => {
  it('AC-001-106: the projected series carries a valid paint the observed series does not', () => {
    const html = renderPyramid();
    // The mechanism is an SVG `<pattern>` referenced by `url(#…)` — the one form Chromium accepts
    // as a `fill`. A CSS gradient function is not, which is why `--chart-hatch` never painted.
    expect(html).toContain('<pattern');
    expect(html).toContain('id="projection-hatch"');
    expect(CSS).toMatch(/\.demography__panel--projected \.demography__bar\s*\{[^}]*fill:\s*url\(#projection-hatch\)/s);
    expect(CSS).not.toMatch(/\.demography__panel--projected \.demography__bar\s*\{[^}]*fill:\s*repeating-linear-gradient/s);
  });

  it('AC-001-106: one hue for the three panels, and the dash bound to the projected frame', () => {
    const hues = [...CSS.matchAll(/--demography-hue:\s*var\(--([a-z0-9-]+)\)/g)].map((match) => match[1]);
    expect(hues).toEqual(['ink-2', 'ink-2', 'ink-2']);
    expect(CSS).toContain('.demography__panel--projected .demography__baseline');
    expect(CSS).toMatch(/stroke-dasharray:\s*var\(--dash-projection\)/);
    expect(readFileSync('web/styles/tokens.css', 'utf8')).toMatch(/--dash-projection:\s*6 4/);
  });

  it('AC-001-106: the threshold year is printed beside the label that names it', () => {
    const html = renderCountdown();
    expect(html).toContain(ES.t('countdown.yearLabel'));
    expect(html).toContain('countdown__year');
    expect(html).toContain('2042');
  });

  it('AC-001-106: every panel is named in words, so no panel is distinguished by colour', () => {
    const html = renderPyramid();
    for (const year of [1995, 2025, 2050]) {
      expect(html).toContain(String(year));
    }
    const heads = [...html.matchAll(/demography__panel-state">([^<]*)</g)].map((match) => match[1]);
    expect(heads).toEqual([
      ES.t('demography.year.observed'),
      ES.t('demography.year.observed'),
      ES.t('demography.year.projected'),
    ]);
  });

  it('AC-001-106: sex is never encoded by hue — both sides share the panel hue', () => {
    const html = renderPyramid();
    // One class carries the fill for every bar; there is no male/female colour class.
    expect(CSS).toMatch(/\.demography__bar\s*\{[^}]*fill:\s*var\(--demography-hue\)/s);
    expect(CSS).not.toMatch(/demography__bar--male|demography__bar--female/);
    expect(html).not.toMatch(/demography__bar--male|demography__bar--female/);
  });

  it('AC-001-106: every plotted value is still printed in the table', () => {
    const html = renderPyramid();
    expect(html.split('<td>').length - 1).toBe(21 * 6);
  });
});
