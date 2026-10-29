import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { CountdownBlock } from '../../web/components/series/CountdownBlock';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue, pyramidSeries } from '../fixtures/series';

const ES = content('es');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const CSS = readFileSync('web/styles/globals.css', 'utf8');

function renderPyramid(): string {
  return renderComponent(PyramidPlate, { content: ES, series: pyramidSeries(), freshnessWindowDays: 45 });
}

function renderCountdown(): string {
  return renderComponent(CountdownBlock, { content: ES, countdown: countdownValue() });
}

describe('AC-001-106: a projected value is encoded by dash, position and a printed word, not hue alone', () => {
  it('AC-001-106: the projection hue and its dash alias are declared, light and dark', () => {
    // Revision 3 P1 moved the projection hue for contrast on the warmer ground: 85.2 deg, a
    // lightness correction, not a hue change. The dash and the printed word are what encode it.
    expect(TOKENS).toMatch(/--data-projection:\s*#6b520a/);
    expect(TOKENS).toMatch(/--chart-projection:\s*var\(--data-projection\)/);
    expect(TOKENS).toMatch(/--dash-projection:\s*6 4/);
    expect(TOKENS).toMatch(/--rule-projection:\s*3px/);
    const dark = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));
    expect(dark).toMatch(/--data-projection:\s*#d8bf60/i);
  });

  it('AC-001-106: the projected panel is its own panel, dash-encoded and word-labelled', () => {
    const html = renderPyramid();
    expect(html).toContain('data-projection="projected"');
    expect(html).toContain(ES.t('demography.year.projected'));
    // The dash is bound to the projected panel's frame in CSS, not left to the hue.
    expect(CSS).toContain('.demography__panel--projected .demography__baseline');
    expect(CSS).toMatch(/stroke-dasharray:\s*var\(--dash-projection\)/);
  });

  it('AC-001-106: the threshold is printed as a word beside the projected year', () => {
    const html = renderCountdown();
    expect(html).toContain(ES.t('countdown.yearLabel'));
    expect(html).toContain('countdown__rule');
    expect(CSS).toMatch(/\.countdown__rule\s*\{[^}]*background:\s*var\(--data-projection\)/s);
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

  it('AC-001-106: colour is never the primary encoding of a value', () => {
    // Every plotted value is also printed: the table carries all 21 × 6 shares.
    const html = renderPyramid();
    expect(html.split('<td>').length - 1).toBe(21 * 6);
  });
});
