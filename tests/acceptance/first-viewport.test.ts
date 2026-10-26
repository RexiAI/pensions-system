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
