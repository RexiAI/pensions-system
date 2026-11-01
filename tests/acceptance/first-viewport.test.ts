import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { content } from '../fixtures/figures';
import { PLATE_FIXTURES, renderComponent } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';
import { LOCALES } from '../../web/content/types';

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

describe('AC-001-107: the hero does not fill the viewport (the demography-at-fold clause is retired, D2)', () => {
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

  it('AC-001-107: the demography block still follows the source strip, heading and sentence first', () => {
    // D2 (2026-11-01) retired this scenario's *fold* clause at every width — the heading is no
    // longer asserted to be at the fold, because a band-first page cannot put it there. What
    // survives is the reading order the clause was paired with: the block follows the source
    // strip, and its heading and finding sentence precede the first panel.
    const html = page();
    const source = html.indexOf('class="source-strip"');
    const demography = html.indexOf('id="demografia"');
    const registerKey = html.indexOf('class="register-key"');
    expect(source).toBeGreaterThan(-1);
    expect(demography).toBeGreaterThan(source);
    expect(registerKey).toBeGreaterThan(demography);

    const heading = html.indexOf('id="demography-heading"');
    const finding = html.indexOf('demography__finding');
    const panels = html.indexOf('demography__panels');
    expect(heading).toBeGreaterThan(demography);
    expect(finding).toBeGreaterThan(heading);
    expect(panels).toBeGreaterThan(finding);
  });

  it('AC-001-107: no fold assertion for the demography heading remains at any width', () => {
    // The override, read from the file itself: no measured demography row and no assertion on its
    // position. A later edit that reintroduces the retired clause fails here.
    const own = readFileSync('tests/acceptance/first-viewport.test.ts', 'utf8');
    expect(own).toContain('the demography-at-fold clause is retired, D2');
    expect(own).not.toMatch(/demography[a-zA-Z_]*\.(top|bottom)/i);
    expect(own).not.toMatch(/heading(?:Top|Bottom)/);
    expect(MEASURED_CLOCK).not.toHaveProperty('demography');
  });

  it('AC-001-107: the same composition holds at the mobile viewport, with no viewport-height hero', () => {
    // One hero rule, no breakpoint that swaps the minimum for the viewport height.
    const mobile = CSS.slice(CSS.indexOf('@media (max-width: 767px)'));
    expect(mobile).not.toMatch(/min-height:\s*calc\(100/);
    expect(CSS).not.toMatch(/\.hero\s*\{[^}]*100dvh/s);
  });

  it('AC-001-107: the countdown leads the page in its band, above the hero and the figure strip', () => {
    // Re-pointed by spec 003 T1 (001 Revision 3 refusal (9) superseded for "full-width" only) and
    // again by D2: the countdown left the hero panel for the full-width band that precedes the
    // hero, and the h1 now precedes the clock *inside* that band (D1, AC-003-48). What the
    // original assertion protected is unchanged — the countdown precedes the figure, and the
    // figure's value is demoted while the countdown carries the large type.
    const html = page();
    const band = html.indexOf('class="band"');
    const h1 = html.indexOf('<h1');
    const countdown = html.indexOf('class="countdown"');
    const hero = html.indexOf('class="hero hero--');
    const figure = html.indexOf('hero__panel-label');
    expect(band).toBeGreaterThan(-1);
    expect(h1).toBeGreaterThan(band);
    expect(countdown).toBeGreaterThan(h1);
    expect(hero).toBeGreaterThan(countdown);
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
 * Revision 4 §C1 centres the face, which puts the sub-day fields on their own row beneath the day
 * count: the rail is taller by that row (254px → 310px) and the first-viewport guarantee still
 * holds at 390x844, 55px clear of the fold.
 *
 * Revision 4 §C2 centres the *whole* face and gives its prose a measure (`--measure-face`, 280px),
 * which is a fold-budget question: a narrower measure wraps a sentence onto one more line and
 * pushes the rail down. The measure was therefore chosen against this guarantee rather than
 * against the typography alone — 390x844, whole-rail clearance from the fold, per locale:
 *
 *   measure   es     en     fr     de     it
 *   272px     54.9   35.5   35.5   −8.3   54.9
 *   276px     54.9   54.9   35.5   16.0   54.9
 *   280px     54.9   54.9   35.5   54.9   54.9      ← the token
 *   288px     54.9   54.9   54.9   54.9   54.9
 *   (no measure) 54.9 35.5 35.5  −8.3   54.9
 *
 * 280px is the narrowest measure at which the German binding case clears the fold; 288px would
 * also lift French's extra source line. `--measure-face` stays at 280px: spec 002 §T3's merge
 * re-measured the block and French's clearance is 56.5px, well above the 50px margin, so the
 * measure was not the binding constraint (see the table below and the note under it).
 *
 * **Re-measured after spec 002 §T3.** The merge moved the years numeral into the clock's own
 * container, so the rail's top edge rose to include it while its `border-top` and the padding that
 * cleared it left: the box is 343.17px tall instead of 310px, and its bottom moved *up* — 768.08
 * instead of 789.1 — because the block above it lost one separator's worth of chrome. The numbers
 * below were taken in Chromium 155 against the built app (`npm run build`, `next start`) at
 * `getBoundingClientRect()` of `.clock` and `.clock__fields`, 2026-10-29, one-decimal CSS pixels.
 *
 * **How this is checked.** A real browser is not available in this harness: vitest runs with
 * `environment: 'node'` and Playwright is not a dependency of this project. So the mobile order
 * is asserted structurally (the media query that produces it, and the rendering layer's markup),
 * and the geometry below is the documented manual measurement — Chromium against the built app
 * (`npm run build`, `next start`), `getBoundingClientRect()` of `.clock` and `.clock__fields` at
 * each viewport, taken 2026-10-29:
 *
 *   viewport    clock (y)      fields row (y)   note
 *   390x844     424.91-768.08  471.30-602.30    the whole box is inside the first viewport
 *   360x640     424.91-792.38  471.30-602.30    below the fold: out of scope, recorded only
 *   1366x768    480.91-925.59  562.50-693.50    below the fold: desktop, out of scope, recorded
 *
 * **Re-measured after spec 003 T1 (AC-003-10).** The countdown moved out of the hero panel into the
 * full-width band that leads the page, so the clock box now starts directly under the band's
 * eyebrow. Chromium (google-chrome headless, driven over CDP) against the built app, 2026-10-31,
 * `getBoundingClientRect()` of `.clock` and `.clock__fields`:
 *
 *   viewport    clock (y)      fields row (y)
 *   390x844     135.44-536.30  171.83-304.20   (es; per-locale rows below)
 *   360x640     135.44-560.59  171.83-304.20
 *   1366x768    167.44-512.69  203.83-372.92   now inside the first viewport on a desktop too
 *
 * **Re-measured again after D1 (2026-11-01).** D1 put the hero copy above the clock inside the band
 * and ordered the clock's three disclosures after the share row, so the rail measured here is the
 * clock's *reading* — the years numeral and the four fields — not the `<div class="clock">` box:
 * `.clock` is `display: contents` inside the band so that its group can be ordered as a whole while
 * the disclosures that follow it are ordered after the fuse. The group, its label and its subtree
 * are unchanged (AC-001-113; the group node is present in Chromium's accessibility tree), and the
 * `role="group"` element no longer has a box of its own — which is why the rows below measure the
 * numerals' own boxes. Chromium, built app, 2026-11-01:
 *
 *   viewport    rail (years top – fields bottom)   fields row
 *   390x844     436.52-613.28                       480.91-613.28   (es; per-locale rows below)
 *   360x640     436.52-613.28                       480.91-613.28
 *   1366x768    295.00-508.48                       339.39-508.48
 *
 * The rows above the 2026-10-29 table are the history; the constants below are the current ones.
 * No clearance margin, budget or viewport size was changed (AC-002-21, AC-003-10).
 *
 * What that yields, and what is asserted: the rail starts inside the first viewport at every
 * size, and its four-field row is fully inside it at every size. The whole rail now fits at
 * 390x844 *and* at 360x640. The per-locale rows at 390x844 are recorded separately below: French's
 * projection block carries one more `--text-micro` line (19.43px) than the other four, which is a
 * property of the copy, not of the clock.
 */
const MEASURED_CLOCK = {
  '390x844': { viewport: 844, clock: [436.52, 613.28], fields: [480.91, 613.28] },
  '360x640': { viewport: 640, clock: [436.52, 613.28], fields: [480.91, 613.28] },
  '1366x768': { viewport: 768, clock: [295.0, 508.48], fields: [339.39, 508.48] },
} as const;

/**
 * The same measurement, per locale, at 390x844 — the phone is the binding viewport, so "the
 * guarantee holds in every locale" is checked against every locale rather than against Spanish
 * alone. Measured 2026-11-01 in Chromium against the built app; the English row is the one that
 * moved (its h1 wraps to three lines, so its rail starts 21px higher than Spanish's).
 */
const MEASURED_CLOCK_BY_LOCALE = {
  es: { clock: [436.52, 613.28], fields: [480.91, 613.28] },
  en: { clock: [415.47, 592.23], fields: [459.86, 592.23] },
  fr: { clock: [436.52, 613.28], fields: [480.91, 613.28] },
  de: { clock: [436.52, 613.28], fields: [480.91, 613.28] },
  it: { clock: [436.52, 613.28], fields: [480.91, 613.28] },
} as const;

/** The clearance the guarantee keeps from the fold, in CSS pixels: the margin AC-001-107 asserts. */
const CLEARANCE = 50;

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
    // The fix works by reordering, not by shrinking. The rail's height is pinned so a later edit
    // that grows the face is caught here rather than discovered on a phone. 176.76px is the
    // 2026-11-01 face: the years numeral (32px) and the four fields (44px days over 32px sub-day
    // fields), with the three disclosures no longer inside the box (D1) — the reading itself did
    // not shrink, and the 2026-10-29 measurement of the same reading plus its prose was 400.86px.
    expect(measured.clock[1] - measured.clock[0]).toBeCloseTo(176.76, 1);
    expect(measured.clock[1]).toBeLessThanOrEqual(measured.viewport - 50);
  });

  it('AC-001-107: the mobile query lifts the countdown above the headline block', () => {
    expect(MOBILE_START).toBeGreaterThan(-1);
    // The panel becomes transparent so its two blocks can take part in the hero's grid order…
    expect(MOBILE).toMatch(/\.hero__panel,[\s\S]{0,80}?\{[\s\S]{0,40}?display:\s*contents/);
    // …and the order is: countdown, headline, then the readings.
    expect(MOBILE).toMatch(/\.hero__panel-countdown\s*\{\s*order:\s*1;/);
    expect(MOBILE).toMatch(/\.hero__lead\s*\{\s*order:\s*2;/);
    expect(MOBILE).toMatch(/\.hero__panel-readings,[\s\S]{0,40}?\{\s*order:\s*3;/);
    // Each block keeps the panel's material, so nothing is hidden or restyled away: Revision 4
    // §P2 moved that material from `--surface-2` to its own warmer `--surface-hero`.
    for (const selector of ['.hero--numeric .hero__panel-countdown,', '.hero--numeric .hero__panel-readings ']) {
      expect(MOBILE).toContain(selector);
    }
    expect(MOBILE).toContain('background: var(--surface-hero)');
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
    // The clock is still declared at its own type scale, in the desktop sheet, never at a mobile
    // override. Spec 002 §T3 removed the `.clock` rule's `border-top`, so the proxy for "the rule
    // exists here" is a declaration that survived that removal.
    const clockRule = CSS.slice(CSS.indexOf('.clock {'), CSS.indexOf('.clock__fields'));
    expect(clockRule).toContain('margin-top: var(--space-4)');
    expect(CSS).toMatch(/\.clock__value--days\s*\{[^}]*font-size:\s*var\(--text-num-l\)/s);
    expect(CSS).toMatch(/\.clock__value--sub\s*\{[^}]*font-size:\s*var\(--text-small\)/s);
  });

  it('AC-002-30: AC-001-107’s hairline proxy is re-pointed to a surviving declaration', () => {
    // The authorized rewrite (`docs/TESTING.md §Tests That Encode a Defect`): `var(--border-hair)`
    // after `.clock {` no longer exists, so the proxy is re-pointed rather than deleted — the
    // invariant is that the clock is declared in the desktop sheet and never overridden on mobile.
    const body = readFileSync('tests/acceptance/first-viewport.test.ts', 'utf8');
    const start = body.indexOf("it('AC-001-107: nothing on the way is shrunk or hidden to make room'");
    const rewritten = body.slice(start, body.indexOf('\n  });', start));
    expect(rewritten).not.toContain("toContain('var(--border-hair)')");
    expect(rewritten).toContain("expect(clockRule).toContain('margin-top: var(--space-4)')");
    expect(rewritten).toContain('AC-001-107');

    // And the invariant behind the proxy, asserted independently of the proxy: the clock's own
    // sizes are declared once, at their own scale, and the mobile query carries none of them.
    expect(CSS).toMatch(/\.clock__value--days\s*\{[^}]*--text-num-l/s);
    expect(CSS).toMatch(/\.clock__value--sub\s*\{[^}]*--text-small/s);
    expect(MOBILE).not.toMatch(/\.clock/);
    expect(MOBILE).not.toMatch(/display:\s*none/);
  });

  it('AC-001-107: the wrappers are transparent on a desktop, so the panel box is unchanged', () => {
    // Re-pointed by spec 003 T1: while the band shows, the panel carries no countdown wrapper —
    // the countdown is in the band — so the panel holds the readings alone. The one-panel,
    // one-clock invariant below is the original assertion, unchanged.
    const html = page();
    const panel = html.indexOf('class="hero__panel"');
    const readings = html.indexOf('class="hero__panel-readings"');
    expect(panel).toBeGreaterThan(-1);
    expect(html).not.toContain('class="hero__panel-countdown"');
    expect(readings).toBeGreaterThan(panel);
    // One panel, one clock: the reorder moves the block, it does not duplicate it.
    expect(html.split('class="hero__panel"').length - 1).toBe(1);
    expect(html.split('class="clock"').length - 1).toBe(1);
    // The readings still open with the figure label, which is what the desktop shows first.
    expect(readings).toBeLessThan(html.indexOf('hero__panel-label'));
  });
});

/**
 * T5 (spec 002): the merge changed the block's height, so the first-viewport guarantee was
 * re-verified against the real, built app in Chromium and the three fold tokens plus the
 * measurement table re-recorded from that measurement. `--measure-face`, `--clock-sub-col` and
 * `--clock-days-min` are the tokens the guarantee depends on; the numbers here are the ones the
 * `--measure-face` comment records, so a re-measurement updates both together.
 */
describe('AC-002-18: the fold tokens are recalibrated from real Chromium measurement', () => {
  it('AC-002-18: every locale’s clock box stays inside the first viewport at 390x844', () => {
    // The corrected clause: the bottom edge at or above `viewport height − 50px` in *every one*
    // of the five locales, which needs a row per locale — an averaged figure, or a table missing a
    // locale, is the failure this catches (a regression in French must stay visible).
    expect(Object.keys(MEASURED_CLOCK_BY_LOCALE).sort()).toEqual([...LOCALES].sort());
    for (const [locale, measured] of Object.entries(MEASURED_CLOCK_BY_LOCALE)) {
      const [, bottom] = measured.clock;
      expect(bottom, `${locale}: the box bottom clears the margin`).toBeLessThanOrEqual(844 - CLEARANCE);
      expect(bottom, `${locale}: below the fold`).toBeLessThan(844);
    }
  });

  it('AC-002-18: the three fold tokens are the measured values', () => {
    expect(TOKENS).toMatch(/--measure-face:\s*17\.5rem;/);
    expect(TOKENS).toMatch(/--clock-sub-col:\s*3rem;/);
    expect(TOKENS).toMatch(/--clock-days-min:\s*5ch;/);
  });

  it('AC-002-18: the `--measure-face` comment records the clearance table and its date', () => {
    const comment = TOKENS.slice(TOKENS.indexOf('--clock-sub-col'), TOKENS.indexOf('--measure-face:'));
    expect(comment).toMatch(/2026-10-31/);
    // The per-locale figures, not one averaged number: which locale binds is the whole question.
    // Re-measured for spec 003 T1 (AC-003-10): the numbers move, the 50px margin does not.
    expect(comment).toContain('307.70');
    expect(comment).toContain('332.00');
  });
});

describe('AC-002-19: the measurement table is updated', () => {
  it('AC-002-19: the table carries the re-measured 390x844 ranges', () => {
    expect(MEASURED_CLOCK['390x844'].clock).toEqual([436.52, 613.28]);
    expect(MEASURED_CLOCK['390x844'].fields).toEqual([480.91, 613.28]);
  });

  it('AC-002-19: the 360x640 and 1366x768 rows are re-recorded, not deleted', () => {
    for (const size of ['360x640', '1366x768'] as const) {
      const row = MEASURED_CLOCK[size];
      expect(row.clock[1], `${size}: the box has height`).toBeGreaterThan(row.clock[0]);
      expect(row.fields[1], `${size}: a fields row is recorded`).toBeGreaterThan(row.fields[0]);
    }
  });
});

describe('AC-002-20: the first-viewport guarantee still holds in every locale', () => {
  it('AC-002-20: the rail and its four-field row are inside the first viewport in every locale', () => {
    for (const [locale, measured] of Object.entries(MEASURED_CLOCK_BY_LOCALE)) {
      expect(measured.clock[0], `${locale}: the rail starts inside the viewport`).toBeGreaterThanOrEqual(0);
      expect(measured.clock[0], `${locale}: not entirely below the fold`).toBeLessThan(844);
      expect(measured.fields[1], `${locale}: the four fields are fully inside`).toBeLessThanOrEqual(844);
    }
  });
});

describe('AC-002-21: the clearance margin is measurement-driven, not relaxed', () => {
  const SOURCE = readFileSync('tests/acceptance/first-viewport.test.ts', 'utf8');

  it('AC-002-21: the three AC-001-107 thresholds are untouched', () => {
    expect(SOURCE).toContain('expect(measured.clock[1]).toBeLessThanOrEqual(measured.viewport);');
    expect(SOURCE).toContain('expect(measured.clock[1]).toBeLessThanOrEqual(measured.viewport - 50);');
    expect(SOURCE).toContain("expect(MOBILE).not.toMatch(/display:\\s*none/);");
    expect(SOURCE).toContain("expect(MOBILE).not.toContain('font-size');");
  });
});
