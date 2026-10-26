import { describe, expect, it } from 'vitest';
import { Hero } from '../../web/components/public/Hero';
import { PublicPage } from '../../web/components/PublicPage';
import { publicPageProps } from '../../web/components/public-page-props';
import { citationRegistry } from '../../web/content/citations';
import {
  PLATE_FIXTURES,
  content,
  dependencyFigure,
  renderComponent,
  renderPlate,
  shareFigure,
} from '../fixtures/figures';
import type { Locale } from '../../web/content/types';

/**
 * The rendered page never carries a percentage point multiplied by 100.
 *
 * This is the defect's user-visible assertion: the hero headline, the fig-02 plate readout, its
 * table and its axis ticks must all print `13,23` (points), and none of them may print `1323`.
 * It is asserted on the rendered markup rather than on the formatter alone, because the plate,
 * the hero and the table each reach the formatter by a different path — the bug lived in all
 * three at once while the formatter's own unit tests were green.
 */
const NBSP = '\u00A0';

/** Exactly the signature of the ×100 defect: four digits before a percent sign. */
const SCALED_PERCENT = /\d{4}[ \u00A0]?%/;

const NOT_A_POINT = ['1323', '982', '1439', '1700'];

function page(locale: Locale): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures: PLATE_FIXTURES.map((fixture) => fixture()),
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
  });
}

function region(html: string, start: string, end: string): string {
  const at = html.indexOf(start);
  return at === -1 ? '' : html.slice(at, html.indexOf(end, at) + end.length);
}

/** The rendered hero panel: the largest type on the page. */
function heroPanel(locale: Locale): string {
  return region(
    renderComponent(Hero, { content: content(locale), figures: [dependencyFigure(), shareFigure()] }),
    '<div class="hero__panel">',
    '</div></section>',
  );
}

function readout(html: string, number: number): string {
  return region(html, `id="fig-0${number}-readout"`, '</dl>');
}

function svg(html: string): string {
  return region(html, '<svg', '</svg>');
}

function dataTable(html: string, number: number): string {
  return region(html, `id="fig-0${number}-table"`, '</table>');
}

describe('the page never renders a percentage point as a fraction', () => {
  it('carries 13,23 in the hero and in the fig-02 plate, table and axis ticks', () => {
    const hero = heroPanel('es');
    const plate = renderPlate(shareFigure(), 'es');

    expect(hero).toContain(`13,23${NBSP}%`);
    expect(hero).toContain(`9,82${NBSP}%`);

    expect(readout(plate, 2)).toContain(`13,23${NBSP}%`);
    expect(readout(plate, 2)).toContain(`9,82${NBSP}%`);
    expect(dataTable(plate, 2)).toContain(`10,50${NBSP}%`);

    // Axis ticks are the figure's own scale (0 … niceMax(13.23 × 1.15) = 16), in points.
    const chart = svg(plate);
    expect(chart).toContain(`0,00${NBSP}%`);
    expect(chart).toContain(`4,00${NBSP}%`);
    expect(chart).toContain(`8,00${NBSP}%`);
    expect(chart).toContain(`12,00${NBSP}%`);
    expect(chart).toContain(`16,00${NBSP}%`);
  });

  it('carries 13.23 with an en decimal point in the en hero and plate', () => {
    expect(heroPanel('en')).toContain('13.23%');
    expect(readout(renderPlate(shareFigure(), 'en'), 2)).toContain('13.23%');
  });

  it('carries no 1323, 982, 1439 or 1700 in any numeric surface of the page', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      const hero = heroPanel(locale);
      for (const scaled of NOT_A_POINT) {
        expect(hero, `${locale} hero must not carry ${scaled}`).not.toContain(scaled);
      }
      // The plate's provenance strip carries a full digest, which may contain any hex run, so the
      // digit-absence claim is scoped to the parts that render numbers.
      const plate = renderPlate(shareFigure(), locale);
      const numeric = readout(plate, 2) + svg(plate) + dataTable(plate, 2);
      for (const scaled of NOT_A_POINT) {
        expect(numeric, `${locale} fig-02 plate must not carry ${scaled}`).not.toContain(scaled);
      }
    }
  });

  it('carries no four-digit percentage anywhere on the page', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      expect(page(locale), `${locale} page`).not.toMatch(SCALED_PERCENT);
    }
  });

  it('keeps the fraction percents on their own figures unchanged', () => {
    // fig-03 (IRR) and fig-05 (growth) store fractions: they must stay one-decimal percents.
    const pageEs = page('es');
    expect(pageEs).toContain(`1${NBSP}% · 2${NBSP}% · 3${NBSP}% · 4${NBSP}%`);
    expect(pageEs).not.toMatch(SCALED_PERCENT);
  });
});

/**
 * The committed deployment's own page.
 *
 * The assertions above prove the code paths with fixtures. These prove the data the code ships
 * with: `publicPageProps` reads `data/derived/`, so the numbers below are fig-02's committed
 * 13.23 (2024), 9.82 (1995) and 14.39 (2020 peak) — the page a visitor actually receives.
 */
function committedPage(locale: Locale): string {
  const props = publicPageProps(locale, { now: new Date('2026-10-26T00:00:00Z') });
  if (!props) throw new Error(`no public page props for ${locale}`);
  return renderComponent(PublicPage, props);
}

/** One plate's own `<figure>` subtree, so a page-level assertion cannot read fig-01's chart. */
function figureRegion(html: string, number: number): string {
  return region(html, `<figure class="plate" id="fig-0${number}"`, '</figure>');
}

/** The `<text>` nodes of a chart's axis ticks, in document order. */
function tickTexts(chart: string): string[] {
  return [...chart.matchAll(/class="chart__tick"[^>]*>([^<]*)</g)].map((match) => match[1]);
}

/** `13,23 %` / `13.23%` — two integer digits at most, so a ×100 tick (1700,00 %) cannot match. */
const TWO_DIGIT_PERCENT = /^\d{1,2}[.,]\d{2}(?:\u00A0)?%$/;

describe('the committed page carries the published percentage points', () => {
  it('renders the committed 13,23 in the es hero, readout, table and axis', () => {
    const html = committedPage('es');
    const plate = figureRegion(html, 2);

    expect(region(html, '<div class="hero__panel">', '</div></section>')).toContain(`13,23${NBSP}%`);
    expect(readout(plate, 2)).toContain(`13,23${NBSP}%`);
    expect(readout(plate, 2)).toContain(`9,82${NBSP}%`);
    expect(readout(plate, 2)).toContain(`14,39${NBSP}%`);
    expect(dataTable(plate, 2)).toContain(`13,23${NBSP}%`);
    expect(dataTable(plate, 2)).toContain(`14,39${NBSP}%`);
    expect(svg(plate)).toContain(`17,00${NBSP}%`);

    const numeric = readout(plate, 2) + svg(plate) + dataTable(plate, 2);
    for (const scaled of NOT_A_POINT) {
      expect(numeric, `committed es fig-02 must not carry ${scaled}`).not.toContain(scaled);
    }
  });

  it('renders the committed 13.23 with an en decimal point', () => {
    const html = committedPage('en');
    const plate = figureRegion(html, 2);

    expect(region(html, '<div class="hero__panel">', '</div></section>')).toContain('13.23%');
    expect(readout(plate, 2)).toContain('13.23%');
    expect(readout(plate, 2)).toContain('9.82%');
    expect(readout(plate, 2)).toContain('14.39%');
    expect(svg(plate)).toContain('17.00%');
  });

  it('labels every committed fig-02 axis tick in points, never scaled, in every locale', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      const ticks = tickTexts(svg(figureRegion(committedPage(locale), 2)));
      // The x axis carries years under the same class; the y-axis ticks are the percents.
      const percents = ticks.filter((tick) => tick.includes('%'));
      expect(percents.length, `${locale} fig-02 chart must have percent ticks`).toBeGreaterThan(0);
      for (const tick of percents) {
        expect(tick, `${locale} tick "${tick}" is a scaled percentage`).toMatch(TWO_DIGIT_PERCENT);
      }
    }
  });
});
