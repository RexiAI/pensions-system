import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { CountdownBand, bandCountdown } from '../../web/components/series/CountdownBand';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { countdownAt, countdownSeries, countdownValue, pyramidSeries, seriesFixtures, unavailableSeries } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const NOW = Date.parse('2026-10-31T10:00:00Z');

function page(series: readonly DerivedSeries[] = seriesFixtures(), locale: Locale = 'es', nowMs = NOW): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures: [dependencyFigure(), shareFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series,
    now: new Date(nowMs),
  });
}

/** The band's own markup: from the band's opening tag to the hero section that follows it. */
function bandOf(html: string): string {
  const start = html.indexOf('class="band"');
  const end = html.indexOf('class="hero hero--');
  return start === -1 || end === -1 ? '' : html.slice(start, end);
}

/** The stylesheet with its comments removed, so a rule's selector list reads clean. */
const SHEET = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/** The declaration bodies of every rule whose selector list contains `selector`. */
function ruleBodies(selector: string): string[] {
  return [...SHEET.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((match) => (match[1] ?? '').split(',').some((part) => part.trim() === selector))
    .map((match) => match[2] ?? '');
}

/** The `order` a selector ends up with: the last rule that declares one for it. */
function orderOf(selector: string): number | undefined {
  let order: number | undefined;
  for (const body of ruleBodies(selector)) {
    const declared = /order:\s*(\d+)/.exec(body);
    if (declared) order = Number(declared[1]);
  }
  return order;
}

/** The body of the rule whose *whole* selector is `selector` (not a member of a selector list). */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\}|\\*/)\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(CSS);
  expect(match, selector).not.toBeNull();
  return match?.[1] ?? '';
}

/**
 * The geometry, measured in Chromium (google-chrome headless, over CDP) against the built app
 * (`npm run build`, `next start`), 2026-11-01, after D1 moved the hero copy into the band's top
 * and the share row under the fuse. `days`/`h1`/`seconds` are computed font sizes; `h1Top` and
 * `shareTop` are the top edges AC-003-49 and AC-003-50 assert (top-edge targets, per D1); `clock`
 * is the day numeral's top to the seconds field's bottom (AC-003-06's own definition), `fuse` is
 * the `.fuse` figure's box — drawn line through definition, stricter than T1's "line and label" —
 * and `band` its width against the page's content width. Re-asserted live, where a build and a
 * browser exist, by `countdown-band-browser.test.ts`.
 */
const MEASURED = {
  '390x844': {
    viewport: 844, days: 44, h1: 40, display: 40, seconds: 32, band: 343, content: 343,
    h1Top: { es: 68, en: 68, fr: 68, de: 68, it: 68 },
    shareTop: { es: 862.36, en: 841.31, fr: 862.36, de: 838.06, it: 862.36 },
    shareHeight: { es: 148, en: 96, fr: 148, de: 148, it: 96 },
    clock: {
      es: [480.91, 613.28], en: [459.86, 592.23], fr: [480.91, 613.28],
      de: [480.91, 613.28], it: [480.91, 613.28],
    },
    fuse: {
      es: [621.28, 779.31], en: [600.23, 758.27], fr: [621.28, 779.31],
      de: [621.28, 755.02], it: [621.28, 779.31],
    },
  },
  '1366x768': {
    viewport: 768, days: 80, h1: 64, display: 64, seconds: 32, band: 1176, content: 1176,
    h1Top: { es: 104, en: 104, fr: 104, de: 104, it: 104 },
    shareTop: { es: 687.92, en: 753.19, fr: 753.19, de: 753.19, it: 687.92 },
    shareHeight: { es: 44, en: 44, fr: 44, de: 44, it: 44 },
    clock: {
      es: [339.39, 508.48], en: [404.66, 573.75], fr: [404.66, 573.75],
      de: [404.66, 573.75], it: [339.39, 508.48],
    },
    fuse: {
      es: [516.48, 604.88], en: [581.75, 670.14], fr: [581.75, 670.14],
      de: [581.75, 670.14], it: [516.48, 604.88],
    },
  },
  '1440x900': {
    viewport: 900, days: 80, h1: 64, display: 64, seconds: 32, band: 1176, content: 1176,
    h1Top: { es: 104, en: 104, fr: 104, de: 104, it: 104 },
    shareTop: { es: 687.92, en: 753.19, fr: 753.19, de: 753.19, it: 687.92 },
    shareHeight: { es: 44, en: 44, fr: 44, de: 44, it: 44 },
    clock: {
      es: [339.39, 508.48], en: [404.66, 573.75], fr: [404.66, 573.75],
      de: [404.66, 573.75], it: [339.39, 508.48],
    },
    fuse: {
      es: [516.48, 604.88], en: [581.75, 670.14], fr: [581.75, 670.14],
      de: [581.75, 670.14], it: [516.48, 604.88],
    },
  },
} as const;

describe('AC-003-01: the band spans the full content width', () => {
  it('AC-003-01: the band is a direct child of main, before the hero, with no rail or column', () => {
    const html = page();
    const main = html.indexOf('<main');
    const band = html.indexOf('<div class="band">');
    expect(band).toBeGreaterThan(main);
    expect(html.indexOf('class="hero hero--')).toBeGreaterThan(band);
    expect(html.split('class="band"').length - 1).toBe(1);
    const body = ruleBody('.band');
    for (const property of ['position: sticky', 'position: fixed', 'float', 'grid-template-columns', 'max-width', 'inline-size']) {
      expect(body, property).not.toContain(property);
    }
  });

  it('AC-003-01: measured, the band width equals the content width at every viewport', () => {
    for (const [size, m] of Object.entries(MEASURED)) expect(m.band, size).toBe(m.content);
  });
});

describe('AC-003-02: the day numeral is larger than the h1 on the numeral ladder', () => {
  it('AC-003-02: the band sets the day numeral on --text-num-xl and leaves the display cap at 4rem', () => {
    expect(TOKENS).toMatch(/--text-clock-days:\s*var\(--text-num-xl\);/);
    expect(TOKENS).toMatch(/--text-num-xl:\s*clamp\(2\.75rem, 6\.4vw, 5rem\);/);
    expect(TOKENS).toMatch(/--text-display:\s*clamp\(2\.5rem, 4\.9vw, 4rem\);/);
    expect(ruleBody('.band .clock__value--days')).toContain('font-size: var(--text-clock-days)');
  });

  it('AC-003-02: measured, 44px at 390 and 80px on a desktop, strictly above the h1', () => {
    for (const [size, m] of Object.entries(MEASURED)) expect(m.days, size).toBeGreaterThan(m.h1);
    expect(MEASURED['390x844'].days).toBe(44);
    expect(MEASURED['1366x768'].days).toBe(80);
    expect(MEASURED['1440x900'].days).toBe(80);
  });
});

describe('AC-003-03: the day numeral is the largest numeral on the page', () => {
  it('AC-003-03: 16 años drops to 32px and the hero figure is demoted while the band shows', () => {
    expect(TOKENS).toMatch(/--text-band-years:\s*var\(--text-num-l\);/);
    expect(TOKENS).toMatch(/--text-num-l:\s*2rem;/);
    expect(ruleBody('.band .countdown__numeral')).toContain('font-size: var(--text-band-years)');
    const html = page();
    expect(html).toContain('hero__value hero__value--demoted');
    expect(ruleBody('.hero__value--demoted')).toContain('font-size: var(--text-num-l)');
  });
});

describe('AC-003-04: the seconds tick at display size on a desktop', () => {
  it('AC-003-04: the band sets the sub-day fields on --text-num-l (32px) and full ink', () => {
    expect(TOKENS).toMatch(/--text-clock-sub:\s*var\(--text-num-l\);/);
    const body = ruleBody('.band .clock__value--sub');
    expect(body).toContain('font-size: var(--text-clock-sub)');
    expect(body).toContain('color: var(--ink-1)');
    expect(MEASURED['1366x768'].seconds).toBeGreaterThanOrEqual(32);
    expect(MEASURED['1440x900'].seconds).toBeGreaterThanOrEqual(32);
  });

  it('AC-003-04: the digits are fixed-width and nothing animates or blinks', () => {
    const band = CSS.slice(CSS.indexOf('/* ---------- Spec 003'));
    expect(band).not.toMatch(/transition|animation|@keyframes|blink/);
    expect(ruleBody('.clock__value')).toContain('font-variant-numeric: tabular-nums');
  });
});

describe('AC-003-05: anchor and both disclosures are retained', () => {
  it('AC-003-05: the anchor label, the projection sentence and the arithmetic are visible text in every locale', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const html = decodeText(page(seriesFixtures(), locale));
      const band = bandOf(html);
      // The fuse's own `Cómo se calcula` disclosure (AC-003-51) lives in the band too, so the
      // assertion is that the three disclosures are band text outside *any* disclosure element —
      // the intent of "visible text, not folded away", stated directly instead of proxied by a
      // position in the band.
      const outsideDetails = band.replace(/<details[\s\S]*?<\/details>/g, '');
      expect(outsideDetails, locale).toContain(local.t('countdown.clock.anchorLabel'));
      expect(outsideDetails, locale).toContain('class="clock__definition"');
      expect(outsideDetails, locale).toContain('class="clock__arithmetic"');
      expect(outsideDetails, locale).not.toContain('class="clock__definition" aria-hidden');
      expect(band, locale).not.toMatch(/\stitle="/);
    }
    // The arithmetic is shown at every width inside the band, not only >=1024px.
    expect(ruleBody('.band .clock__arithmetic')).toContain('display: block');
  });
});

describe('AC-003-06: the clock and the fuse are in the first viewport; AC-001-107 scoped', () => {
  it('AC-003-06: measured at 390x844, 1366x768 and 1440x900, both boxes lie inside the viewport in every locale', () => {
    for (const size of ['390x844', '1366x768', '1440x900'] as const) {
      const m = MEASURED[size];
      for (const locale of LOCALES) {
        const [clockTop, clockBottom] = m.clock[locale];
        const [fuseTop, fuseBottom] = m.fuse[locale];
        expect(clockTop, `${size} ${locale}`).toBeGreaterThanOrEqual(0);
        expect(clockBottom, `${size} ${locale}`).toBeLessThanOrEqual(m.viewport);
        expect(fuseTop, `${size} ${locale}`).toBeGreaterThanOrEqual(0);
        expect(fuseBottom, `${size} ${locale}`).toBeLessThanOrEqual(m.viewport);
      }
    }
  });

  it('AC-003-06: the band orders the lead, the eyebrow, the clock, the fuse, the share row, then the prose', () => {
    expect(ruleBody('.band > .countdown')).toContain('display: contents');
    // The band's rendered order, top edge to top edge (AC-003-48): lead, eyebrow, the years
    // numeral, the day numeral's fields, the fuse, the share row, then the prose.
    expect(orderOf('.band > .hero__lead')).toBe(1);
    expect(orderOf('.band .countdown__eyebrow')).toBe(2);
    expect(orderOf('.band .countdown__value')).toBe(3);
    expect(orderOf('.band .clock__fields')).toBe(4);
    expect(orderOf('.band > .fuse-group')).toBe(5);
    expect(orderOf('.band > .share')).toBe(6);
    // The projection's prose and the clock's own disclosures come after the share row, never
    // between the fuse and the share row.
    expect(orderOf('.band .countdown__definition')).toBe(7);
    expect(orderOf('.band .clock__arithmetic')).toBe(8);
    // AC-001-107 is otherwise untouched: the hero is still not a viewport-height block.
    expect(CSS).not.toMatch(/\.band\s*\{[^}]*\d+[dsv]?vh/s);
  });
});

describe('AC-003-48: band composition — hero copy, eyebrow, clock, fuse, share row (D1)', () => {
  it('AC-003-48: the h1 leads the band, then the eyebrow, the clock, the fuse and the share row', () => {
    const html = page();
    const band = html.indexOf('class="band"');
    const h1 = html.indexOf('<h1');
    const eyebrow = html.indexOf('class="countdown__eyebrow"');
    const clock = html.indexOf('<div class="clock"');
    const days = html.indexOf('clock__value--days');
    const fuse = html.indexOf('class="fuse-group"');
    const share = html.indexOf('class="share"');
    expect(band).toBeGreaterThan(-1);
    expect(h1).toBeGreaterThan(band);
    expect(eyebrow).toBeGreaterThan(h1);
    expect(clock).toBeGreaterThan(eyebrow);
    expect(days).toBeGreaterThan(clock);
    expect(fuse).toBeGreaterThan(days);
    expect(share).toBeGreaterThan(fuse);
    // One h1 on the page, and it is the band's first text block.
    expect(html.split('<h1').length - 1).toBe(1);
    expect(bandOf(html).indexOf('<h1'), 'the h1 is the first thing in the band').toBeLessThan(
      bandOf(html).indexOf('class="countdown"'),
    );
  });

  it('AC-003-48: the band holds the h1, the sub and both actions — and not the figure panel', () => {
    const band = bandOf(page());
    expect(band).toContain('class="hero__title"');
    expect(band).toContain('class="hero__sub"');
    expect(band).toContain('class="hero__cta"');
    expect(band).toContain('class="hero__cta-secondary"');
    // D1 names the h1 and the statement/CTA block, nothing else: the readings panel stays out.
    expect(band).not.toContain('class="hero__panel"');
    expect(band).not.toContain('hero__panel-readings');
  });

  it('AC-003-48: the band precedes the figure strip, and the share row is inside it', () => {
    const html = page();
    expect(html.indexOf('class="band"')).toBeLessThan(html.indexOf('id="figuras"'));
    expect(bandOf(html)).toContain('class="share"');
    // The band's one spreading mechanism follows the fuse directly: no prose carries the order
    // between them, and the fuse's disclosure is the only text between the two.
    expect(orderOf('.band > .share')).toBe(6);
    expect(orderOf('.band .countdown__source')).toBeGreaterThan(6);
  });

  it('AC-003-48: the readings panel is rendered outside the band, in the section after it', () => {
    const html = page();
    const heroEnd = html.indexOf('class="hero hero--');
    expect(heroEnd).toBeGreaterThan(html.indexOf('class="share"'));
    expect(html.slice(heroEnd)).toContain('class="hero__panel"');
  });
});

describe('AC-003-49: the h1 is inside the first viewport at all three widths (D1)', () => {
  it('AC-003-49: measured, the h1 top is inside the viewport at 1440x900, 1366x768 and 390x844', () => {
    for (const size of ['1440x900', '1366x768', '390x844'] as const) {
      const m = MEASURED[size];
      for (const locale of LOCALES) {
        const top = m.h1Top[locale];
        expect(top, `${size} ${locale}`).toBeGreaterThanOrEqual(0);
        expect(top, `${size} ${locale}`).toBeLessThan(m.viewport);
      }
    }
  });

  it('AC-003-49: the h1 keeps --text-display, restated nowhere inside the band', () => {
    // The move relocates the element; it does not restyle it (AC-002-33 keeps force). The band's
    // section may not declare a `font-size` for the h1 at all.
    const band = CSS.slice(CSS.indexOf('/* ---------- Spec 003'));
    expect(band).not.toMatch(/\.band[^{]*hero__title[^{]*\{[^}]*font-size/);
    expect(CSS).toMatch(/\.hero__title\s*\{[^}]*font-size:\s*var\(--text-display\)/s);
    for (const size of ['1440x900', '1366x768', '390x844'] as const) {
      expect(MEASURED[size].h1, size).toBe(MEASURED[size].display);
    }
  });
});

describe('AC-003-50: the share row’s top is inside the first viewport at both desktop widths (D1)', () => {
  it('AC-003-50: measured, the share row starts above the fold at 1440x900 and 1366x768', () => {
    for (const size of ['1440x900', '1366x768'] as const) {
      const m = MEASURED[size];
      for (const locale of LOCALES) {
        const top = m.shareTop[locale];
        expect(top, `${size} ${locale}`).toBeGreaterThanOrEqual(0);
        expect(top, `${size} ${locale}`).toBeLessThan(m.viewport);
      }
    }
  });

  it('AC-003-50: the 390x844 row is recorded and not asserted — the row wraps to two lines there', () => {
    const phone = MEASURED['390x844'];
    for (const locale of LOCALES) {
      expect(phone.shareTop[locale], locale).toBeGreaterThan(0);
      expect(phone.shareHeight[locale], locale).toBeGreaterThan(44);
    }
  });
});

describe('AC-003-07: reduced motion hides the tick and does not freeze it', () => {
  it('AC-003-07: the band sets no display on the sub-day fields, so the reduced-motion rule still applies', () => {
    const band = CSS.slice(CSS.indexOf('/* ---------- Spec 003'));
    expect(band).not.toMatch(/clock__field--sub[^{]*\{[^}]*display/);
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.clock__field--sub \{\s*display: none;/);
  });

  it('AC-003-07: the server-rendered day count is the render instant’s', () => {
    const html = page(seriesFixtures(), 'es', NOW);
    const expected = Math.floor((Date.parse('2042-01-01T00:00:00+01:00') - NOW) / 86_400_000);
    expect(html).toContain(`>${expected}<`);
  });
});

describe('AC-003-08: no clock without a threshold year, band included', () => {
  it('AC-003-08: not-crossed, unavailable and withheld render no band, no field and no anchor', () => {
    const notCrossed = { ...countdownSeries(), value: countdownAt(90) };
    for (const entry of [notCrossed, unavailableSeries(countdownSeries()), { ...countdownSeries(), value: null }]) {
      const html = page([pyramidSeries(), entry]);
      expect(html).not.toContain('class="band"');
      expect(html).not.toContain('clock__value');
      expect(html).not.toContain('clock__anchor');
      expect(html).not.toContain('fuse');
    }
    expect(bandCountdown(countdownAt(90))).toBeUndefined();
    expect(bandCountdown(undefined)).toBeUndefined();
    expect(bandCountdown(countdownValue())?.thresholdYear).toBe(countdownValue().thresholdYear);
  });
});

describe('AC-003-09: clock behaviour is unchanged by the band', () => {
  it('AC-003-09: the archived clock scenarios run unedited', () => {
    // AC-001-111/113/114/115 live in this file; its bytes are pinned, so an edit to make the
    // band pass would fail here.
    const digest = createHash('sha256').update(readFileSync('tests/acceptance/clock.test.ts')).digest('hex');
    expect(digest).toBe('a3e33710f4de81ed522fa5a9d3b8621ac0fa488e7315df2b4f28f78e8c5b5b11');
  });

  it('AC-003-09: the band renders exactly one clock, from the countdown block', () => {
    const html = page();
    expect(html.split('class="clock"').length - 1).toBe(1);
    const band = renderComponent(CountdownBand, {
      content: content('es'),
      countdown: bandCountdown(countdownValue())!,
      nowMs: NOW,
      freshnessWindowDays: 45,
    });
    expect(band.split('class="clock"').length - 1).toBe(1);
    expect(band).not.toContain('class="fuse"');
  });
});

describe('AC-003-10: fold measurements are re-measured, budgets are not relaxed', () => {
  it('AC-003-10: the first-viewport table carries the 2026-11-01 Chromium values and the same margins', () => {
    const source = readFileSync('tests/acceptance/first-viewport.test.ts', 'utf8');
    expect(source).toContain("'390x844': { viewport: 844, clock: [436.52, 613.28], fields: [480.91, 613.28] }");
    expect(source).toContain('const CLEARANCE = 50;');
    expect(source).toContain('expect(measured.clock[1]).toBeLessThanOrEqual(measured.viewport - 50);');
    expect(TOKENS).toContain('2026-10-31');
    expect(TOKENS).toMatch(/--measure-face:\s*17\.5rem;/);
    expect(TOKENS).toMatch(/--clock-sub-col:\s*3rem;/);
  });
});
