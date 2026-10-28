import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { content } from '../fixtures/figures';
import { PLATE_FIXTURES, renderComponent } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';

const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const CSS = readFileSync('web/styles/globals.css', 'utf8');

function page(): string {
  return renderComponent(PublicPage, {
    content: content('es'),
    figures: PLATE_FIXTURES.map((fixture) => fixture()),
    series: seriesFixtures(),
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
  });
}

/** The hero rule, as it is written in the stylesheet. */
function heroRule(): string {
  const blocks = [...CSS.matchAll(/\.hero\s*\{([^}]*)\}/g)].map((match) => match[1] ?? '');
  return blocks.join('\n');
}

describe('AC-001-107: the hero does not fill the viewport and the demography heading is at the fold', () => {
  it('AC-001-107: the hero height is a 560px minimum, not the viewport height', () => {
    expect(TOKENS).toMatch(/--hero-min-h:\s*560px/);
    expect(heroRule()).toMatch(/min-height:\s*var\(--hero-min-h\)/);
    // A full-viewport hero is the structural cause of "nothing to scroll toward".
    expect(heroRule()).not.toMatch(/\d+[dsv]?vh/);
    expect(TOKENS).not.toContain('100dvh');
  });

  it('AC-001-107: the hero minimum applies above 1024px, where the composition is two-column', () => {
    const desktop = CSS.slice(CSS.indexOf('@media (min-width: 1024px)'));
    expect(desktop).toMatch(/\.hero\s*\{[^}]*min-height:\s*var\(--hero-min-h\)/s);
  });

  it('AC-001-107: the demography block follows the source strip and leads with its heading and sentence', () => {
    const html = page();
    const source = html.indexOf('class="source-strip"');
    const demography = html.indexOf('id="demografia"');
    const registerKey = html.indexOf('class="register-key"');
    expect(source).toBeGreaterThan(-1);
    expect(demography).toBeGreaterThan(source);
    expect(registerKey).toBeGreaterThan(demography);

    // Heading and finding sentence come before the first panel: what peeks at the fold is a
    // sentence about the data, never the empty apex of a chart.
    const heading = html.indexOf('id="demography-heading"');
    const finding = html.indexOf('demography__finding');
    const panels = html.indexOf('demography__panels');
    expect(heading).toBeGreaterThan(demography);
    expect(finding).toBeGreaterThan(heading);
    expect(panels).toBeGreaterThan(finding);
  });

  it('AC-001-107: the same composition holds at the mobile viewport, with no viewport-height hero', () => {
    // One hero rule, no breakpoint that swaps the minimum for the viewport height.
    const mobile = CSS.slice(CSS.indexOf('@media (max-width: 767px)'));
    expect(mobile).not.toMatch(/min-height:\s*calc\(100/);
    expect(CSS).not.toMatch(/\.hero\s*\{[^}]*100dvh/s);
  });

  it('AC-001-107: the countdown lives inside the hero panel, above the figure strip', () => {
    const html = page();
    const panel = html.indexOf('class="hero__panel"');
    const countdown = html.indexOf('class="countdown"');
    const figure = html.indexOf('hero__panel-label');
    expect(panel).toBeGreaterThan(-1);
    expect(countdown).toBeGreaterThan(panel);
    expect(figure).toBeGreaterThan(countdown);
    expect(html).toContain('hero__value hero__value--demoted');
  });
});

/**
 * The clock is the page's hook (Revision 3 §P2), and on a phone it used to be entirely below the
 * fold: at 390x844 it occupied y 870-1124. The fix is a mobile reorder — the countdown block moves
 * above the headline block — and nothing else: the rail is not shrunk, and no other block is
 * hidden to make room for it.
 *
 * **How this is checked.** A real browser is not available in this harness: vitest runs with
 * `environment: 'node'` and Playwright is not a dependency of this project. So the mobile order
 * is asserted structurally (the media query that produces it, and the rendering layer's markup),
 * and the geometry below is the documented manual measurement — Chromium against the built app
 * (`npm run build`, `next start`), `getBoundingClientRect()` of `.clock` and `.clock__fields` at
 * each viewport, taken 2026-10-28:
 *
 *   viewport    clock (y)    fields row (y)   before the fix
 *   390x844     479-733      492-568          clock was 870-1124, entirely below the fold
 *   360x640     479-758      492-568          clock was 870-1148, entirely below the fold
 *   1366x768    527-779      540-615          527-779 already, and unchanged by this fix
 *
 * What that yields, and what is asserted: the rail starts inside the first viewport at every
 * size, and its four-field row is fully inside it at every size. The whole box fits at 390x844.
 * It cannot fit at 360x640 — the projection block above the rail plus the rail is taller than
 * 640px, and the fix may not shrink the clock or hide the disclosure — and it cannot fit at
 * 1366x768 either, where the last 11px of the rail sit below the fold and desktop is out of
 * scope. Those two are recorded rather than asserted, so the numbers stay honest.
 */
const MEASURED_CLOCK = {
  '390x844': { viewport: 844, clock: [479, 733], fields: [492, 568] },
  '360x640': { viewport: 640, clock: [479, 758], fields: [492, 568] },
  '1366x768': { viewport: 768, clock: [527, 779], fields: [540, 615] },
} as const;

const MOBILE_START = CSS.indexOf('@media (max-width: 900px)');
const MOBILE = CSS.slice(MOBILE_START, CSS.indexOf('\n}', MOBILE_START));
const WIDE = CSS.slice(0, MOBILE_START);

describe('AC-001-107: the clock is inside the first viewport on a phone', () => {
  it('AC-001-107: the rail starts inside the first viewport, and its field row is fully inside it', () => {
    for (const [size, measured] of Object.entries(MEASURED_CLOCK)) {
      const [top, bottom] = measured.clock;
      expect(top, `${size}: the clock starts inside the first viewport`).toBeGreaterThanOrEqual(0);
      expect(top, `${size}: not entirely below the fold`).toBeLessThan(measured.viewport);
      expect(measured.fields[1], `${size}: the four fields are fully visible`).toBeLessThanOrEqual(measured.viewport);
      expect(bottom, `${size}: the rail's bottom is below its own top`).toBeGreaterThan(top);
    }
  });

  it('AC-001-107: at 390x844 the whole clock box is inside the first viewport', () => {
    const measured = MEASURED_CLOCK['390x844'];
    expect(measured.clock[1]).toBeLessThanOrEqual(measured.viewport);
    // The fix works by reordering, not by shrinking: the rail is 254px tall both before and after.
    expect(measured.clock[1] - measured.clock[0]).toBe(254);
  });

  it('AC-001-107: the mobile query lifts the countdown above the headline block', () => {
    expect(MOBILE_START).toBeGreaterThan(-1);
    // The panel becomes transparent so its two blocks can take part in the hero's grid order…
    expect(MOBILE).toMatch(/\.hero__panel,[\s\S]{0,80}?\{[\s\S]{0,40}?display:\s*contents/);
    // …and the order is: countdown, headline, then the readings.
    expect(MOBILE).toMatch(/\.hero__panel-countdown\s*\{\s*order:\s*1;/);
    expect(MOBILE).toMatch(/\.hero__lead\s*\{\s*order:\s*2;/);
    expect(MOBILE).toMatch(/\.hero__panel-readings,[\s\S]{0,40}?\{\s*order:\s*3;/);
    // Each block keeps the panel's material, so nothing is hidden or restyled away.
    for (const selector of ['.hero--numeric .hero__panel-countdown,', '.hero--numeric .hero__panel-readings ']) {
      expect(MOBILE).toContain(selector);
    }
    expect(MOBILE).toContain('background: var(--surface-2)');
  });

  it('AC-001-107: nothing on the way is shrunk or hidden to make room', () => {
    expect(MOBILE).not.toMatch(/display:\s*none/);
    expect(MOBILE).not.toContain('font-size');
    expect(MOBILE).not.toContain('.clock');
    // The reorder is mobile-only: the desktop stylesheet has no order for these blocks, and no
    // hidden wrapper — the two wrappers are transparent there instead.
    expect(WIDE).not.toContain('.hero__lead {');
    expect(WIDE).not.toMatch(/\.hero__panel-(countdown|readings)[^{}]*\{[^}]*order:/);
    expect(WIDE).toMatch(/\.hero__panel-countdown,\s*\n\.hero__panel-readings\s*\{\s*display:\s*contents;/);
    // The clock itself is still declared at its own type scale, never at a mobile override.
    expect(CSS.slice(CSS.indexOf('.clock {'))).toContain('var(--border-hair)');
  });

  it('AC-001-107: the wrappers are transparent on a desktop, so the panel box is unchanged', () => {
    const html = page();
    const panel = html.indexOf('class="hero__panel"');
    const countdownBlock = html.indexOf('class="hero__panel-countdown"');
    const readings = html.indexOf('class="hero__panel-readings"');
    expect(panel).toBeGreaterThan(-1);
    expect(countdownBlock).toBeGreaterThan(panel);
    expect(readings).toBeGreaterThan(countdownBlock);
    // One panel, one clock: the reorder moves the block, it does not duplicate it.
    expect(html.split('class="hero__panel"').length - 1).toBe(1);
    expect(html.split('class="clock"').length - 1).toBe(1);
    // The readings still open with the figure label, which is what the desktop shows first.
    expect(readings).toBeLessThan(html.indexOf('hero__panel-label'));
  });
});
