import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { shareCard } from '../../web/seo/share-card';
import {
  CLOCK_TICK_MS,
  COUNTDOWN_VALUE_FIELDS,
  anchorFor,
  anchorProblem,
  countdownSchemaProblems,
  readClock,
} from '../../web/series/clock';
import { startClockTicker } from '../../web/series/clock-ticker';
import type { VisibilitySource } from '../../web/series/clock-ticker';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { countdownAt, countdownSeries, countdownValue, pyramidSeries, unavailableSeries } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';
import { listSourceFiles, readSource } from '../helpers/source-scan';

/**
 * The anchored clock's criteria, re-pointed at spec 004's composition.
 *
 * The clock's *behaviour* is unchanged: the same derivation, the same 1 Hz tick, the same
 * accessibility tree, the same four fields. What moved is where its prose lives — the anchor
 * line, the definition and the arithmetic are methodological precision and render in `#metodo`
 * (T7, T8) — and what left is the centred face (its centring clause is dropped with the retired
 * centring criterion),
 * because the story is flush left on one axis.
 */
const ES = content('es');
const ANCHOR = '2042-01-01T00:00:00+01:00';
/** 3 days, 2 hours, 2 minutes and 5 seconds before the anchor instant. */
const THREE_DAYS_OUT = Date.parse('2041-12-28T20:57:55Z');
/** 2 hours, 2 minutes and 9 seconds before the anchor instant: a sub-day value that must pad. */
const SECONDS_OUT = Date.parse('2041-12-31T20:57:51Z');
/** A minute after the anchor: the elapsed state. */
const AFTER = Date.parse(ANCHOR) + 60_000;

const CSS = readFileSync('web/styles/globals.css', 'utf8');

function pageWith(series: readonly DerivedSeries[], locale: Locale = 'es', nowMs = THREE_DAYS_OUT): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures: [shareFigure(), dependencyFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series,
    now: new Date(nowMs),
  });
}

/** The clock group's own subtree: from its opening tag to step 1's sentence. */
function clockRegion(html: string): string {
  const at = html.indexOf('<div class="clock"');
  const end = html.indexOf('class="step__sentence"', at === -1 ? 0 : at);
  return at === -1 || end === -1 ? '' : html.slice(at, end);
}

/** The method region: from `id="metodo"` to the debate registers. */
function methodRegion(html: string): string {
  const at = html.indexOf('id="metodo"');
  const end = html.indexOf('id="debate"', at === -1 ? 0 : at);
  return at === -1 || end === -1 ? '' : html.slice(at, end);
}

/** The anchor date as the page renders it: `formatDate` in Madrid, never in UTC. */
function anchorDate(locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(new Date(ANCHOR));
}

/** The two reference instants' sentence, with this deployment's own numbers in it. */
function arithmetic(locale: Locale): Record<string, string> {
  return { years: '16', thresholdYear: '2042', snapshotYear: '2026', date: anchorDate(locale) };
}

describe('AC-001-108: the anchor is derived from the threshold year, never authored', () => {
  it('AC-001-108: anchor is the threshold year’s first instant at +01:00', () => {
    expect(anchorFor(2042)).toBe(ANCHOR);
    expect(anchorFor(2050)).toBe('2050-01-01T00:00:00+01:00');
    expect(anchorFor(null)).toBeNull();
    expect(anchorFor(2042.5)).toBeNull();
    expect(new Date(ANCHOR).toISOString()).toBe('2041-12-31T23:00:00.000Z');
  });

  it('AC-001-108: changing the threshold parameter moves the anchor with the year', () => {
    const lower = countdownAt(40);
    const higher = countdownAt(60);
    expect(lower.thresholdYear).not.toBe(higher.thresholdYear);
    expect(lower.anchor).toBe(anchorFor(lower.thresholdYear));
    expect(higher.anchor).toBe(anchorFor(higher.thresholdYear));
    expect(countdownValue().anchor).toBe(ANCHOR);
    expect(COUNTDOWN_VALUE_FIELDS).toContain('anchor');
    expect(Object.keys(countdownValue()).sort()).toEqual([...COUNTDOWN_VALUE_FIELDS].sort());
  });

  it('AC-001-108: no component or content file carries a hand-typed anchor date', () => {
    const sources = [
      ...listSourceFiles('web/components'),
      ...listSourceFiles('web/series'),
      ...LOCALES.map((locale) => `web/content/data/ES/${locale}.json`),
    ];
    for (const file of sources) {
      const source = readSource(file);
      expect(source, file).not.toMatch(/20\d\d-01-01T00:00:00/);
      expect(source, file).not.toMatch(/"20\d\d-01-01"/);
    }
    expect(readSource('web/series/clock.ts')).toContain('-01-01T00:00:00');
  });

  it('AC-001-108: the derived schema is closed, and a published anchor must match its threshold year', () => {
    expect(anchorProblem(2042, ANCHOR)).toBeNull();
    expect(anchorProblem(2042, '2043-01-01T00:00:00+01:00')).toContain('thresholdYear 2042');
    expect(anchorProblem(null, ANCHOR)).toContain('thresholdYear null');

    const published = countdownValue() as unknown as Record<string, unknown>;
    expect(countdownSchemaProblems(published)).toEqual([]);

    const invented = { ...published, anchorOverride: ANCHOR };
    expect(countdownSchemaProblems(invented)).toEqual(['countdown: unknown field "anchorOverride"']);

    const stripped = { ...published };
    delete stripped.anchor;
    expect(countdownSchemaProblems(stripped)).toEqual(['countdown: missing field "anchor"']);
  });
});

describe('AC-001-109: the disclosure is unconditional in every state where the clock renders', () => {
  it('AC-001-109: the anchor, its label and the projection sentence render in all five locales', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const method = decodeText(methodRegion(pageWith([pyramidSeries(), countdownSeries()], locale)));
      expect(method, locale).not.toBe('');
      expect(method, locale).toContain(local.t('countdown.clock.anchorLabel'));
      expect(method, locale).toContain(local.t('countdown.clock.definition', { date: anchorDate(locale) }));
      expect(method, locale).toContain(anchorDate(locale));
    }
  });

  it('AC-001-109: nothing in the disclosure is behind a details, a title or a tooltip', () => {
    const method = methodRegion(pageWith([pyramidSeries(), countdownSeries()]));
    const outsideDetails = method.replace(/<details[\s\S]*?<\/details>/g, '');
    expect(outsideDetails).toContain(`class="clock__anchor"`);
    expect(outsideDetails).toContain(ES.t('countdown.clock.anchorLabel'));
    expect(outsideDetails).toContain(`class="clock__definition"`);
    expect(outsideDetails).toContain(`class="clock__arithmetic"`);
    expect(outsideDetails).not.toContain('<abbr');
  });

  it('AC-001-109: all seven disclosure slots render, in every locale', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const date = anchorDate(locale);
      const method = decodeText(methodRegion(pageWith([pyramidSeries(), countdownSeries()], locale)));
      const clock = decodeText(clockRegion(pageWith([pyramidSeries(), countdownSeries()], locale)));
      const slots = [
        local.t('countdown.clock.anchor', { date }),
        local.t('countdown.clock.anchorLabel'),
        local.t('countdown.clock.definition', { date }),
        local.t('countdown.clock.arithmetic', arithmetic(locale)),
      ];
      for (const slot of slots) expect(method, `${locale}: ${slot}`).toContain(slot);
      for (const label of ['countdown.clock.days', 'countdown.clock.hours', 'countdown.clock.minutes', 'countdown.clock.seconds'] as const) {
        expect(clock, `${locale}: ${label}`).toContain(local.t(label));
      }
      // The sixth key is the group's name; the seventh is the elapsed replacement, asserted by
      // AC-001-115 below.
      expect(clock, locale).toContain(`aria-label="${local.t('countdown.clock.a11y', { date })}"`);
      expect(Object.keys(local.strings).filter((key) => key.startsWith('countdown.clock.'))).toHaveLength(10);
    }
  });
});

describe('AC-001-110: no clock renders without a threshold year', () => {
  const CLOCK_MARKERS = ['clock__fields', 'clock__value'];

  it('AC-001-110: not-crossed renders no field, no anchor and the fixed sentence instead', () => {
    const html = pageWith([pyramidSeries(), { ...countdownSeries(), value: countdownAt(90) }]);
    for (const marker of CLOCK_MARKERS) expect(html, marker).not.toContain(marker);
    expect(html).toContain(ES.t('countdown.notCrossed', { year: 2100 }));
  });

  it('AC-001-110: unavailable and withheld render no block at all, and step 1 keeps its title', () => {
    for (const entry of [
      unavailableSeries(countdownSeries()),
      { ...countdownSeries(), availability: 'computed' as const, value: null },
    ]) {
      const html = pageWith([pyramidSeries(), entry]);
      for (const marker of [...CLOCK_MARKERS, 'class="clock"']) expect(html, marker).not.toContain(marker);
      expect(html).not.toContain('countdown__numeral');
      // The page still leads with its own title, and the story's steps keep their order.
      expect(html).toContain('id="hero-title"');
      expect(html).toContain('data-top-step="number"');
      expect(html).toContain('data-top-step="meaning"');
    }
  });
});

describe('AC-001-111: without JavaScript the server-rendered clock is complete and correct', () => {
  it('AC-001-111: the four fields are in the markup from the render instant', () => {
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()]));
    expect(clock).toContain('>3<');
    expect(clock).toContain('>02<');
    expect(clock).toContain('>05<');
    const reading = readClock(ANCHOR, THREE_DAYS_OUT);
    expect(reading).toEqual({ days: 3, hours: 2, minutes: 2, seconds: 5, elapsed: false });
    expect(clock).toContain(`>${reading.days}<`);
  });

  it('AC-001-111: no sub-day value renders without a day value beside it', () => {
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()]));
    const fields = clock.slice(clock.indexOf('clock__fields'));
    const dayAt = fields.indexOf('clock__value--days');
    expect(dayAt).toBeGreaterThan(-1);
    for (const sub of fields.matchAll(/clock__value--sub/g)) {
      expect(sub.index ?? -1).toBeGreaterThan(dayAt);
    }
    expect(fields.split('clock__label').length - 1).toBe(4);
  });

  it('AC-001-111: the day field renders even at zero, and pads the sub-day fields', () => {
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()], 'es', SECONDS_OUT));
    expect(clock).toContain('>0<');
    expect(clock).toContain('>09<');
    expect(clock).toContain('>02<');
  });

  it('AC-001-111: the correction is pre-paint, and the suppression is confined to the four value spans', () => {
    const source = readSource('web/components/series/CountdownClock.tsx');
    expect(source).toMatch(/useLayoutEffect\(/);
    expect(source).not.toMatch(/\buseEffect\(/);
    const sites = source.split('suppressHydrationWarning').slice(0, -1);
    expect(sites).toHaveLength(2);
    for (const site of sites) expect(site.slice(-240)).toContain('clock__value');
    expect(source).not.toContain('useState');
  });

  it('AC-001-111: the group is one measured quantity, not a centred face in a panel', () => {
    // The centring clause is the part of AC-001-111 that spec 004 drops: the story
    // is flush left, and a centred numeral is what made the block read as a card in a column.
    expect(CSS).not.toMatch(/\.clock \{[^}]*text-align: center/s);
    expect(CSS).toMatch(/\.clock \{[^}]*text-align: start/s);
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()]));
    expect(clock).toContain('countdown__value');
    expect(clock).toContain('clock__fields');
  });
});

describe('AC-001-112: reduced motion shows the static value and creates no tick', () => {
  it('AC-001-112: the sub-day fields are display:none under prefers-reduced-motion', () => {
    const block = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'));
    const rule = block.slice(0, block.indexOf('}', block.indexOf('.clock__field--sub')));
    expect(rule).toContain('.clock__field--sub');
    expect(rule).toContain('display: none');
    expect(rule).not.toContain('visibility');
    expect(rule).not.toContain('animation-play-state');
  });

  it('AC-001-112: no interval is created at all, and the day count remains', () => {
    const scheduled: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      motionQuery: { matches: true },
      schedule: () => scheduled.push(1),
      cancel: () => undefined,
    });
    expect(scheduled).toEqual([]);
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()]));
    expect(clock).toContain('>3<');
    ticker.stop();
  });
});

describe('AC-001-113: the accessible tree is stable and the animated region is hidden', () => {
  const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()]));

  it('AC-001-113: each sub-day field is aria-hidden and the day field is exposed', () => {
    const fields = clock.slice(clock.indexOf('clock__fields'));
    expect(fields.split('aria-hidden="true"').length - 1).toBe(3);
    const dayField = fields.slice(0, fields.indexOf('clock__field--sub'));
    expect(dayField).toContain('clock__value--days');
    expect(dayField).not.toContain('aria-hidden');
  });

  it('AC-001-113: the clock carries none of the live-region attributes', () => {
    for (const forbidden of ['aria-live', 'role="timer"', 'aria-atomic', 'aria-busy']) {
      expect(clock, forbidden).not.toContain(forbidden);
    }
  });

  it('AC-001-113: the group is labelled with the target date in plain words', () => {
    expect(clock).toContain('role="group"');
    expect(clock).toContain(`aria-label="${ES.t('countdown.clock.a11y', { date: anchorDate('es') })}"`);
  });

  it('AC-001-113: the accessible tree is identical in both motion modes', () => {
    expect(clockRegion(pageWith([pyramidSeries(), countdownSeries()]))).toBe(clock);
    const source = readSource('web/components/series/CountdownClock.tsx');
    expect(source).not.toContain('prefers-reduced-motion');
    expect(source).not.toContain('matchMedia');
  });
});

describe('AC-001-114: exactly one timer, cleared correctly, with no layout shift', () => {
  interface FakeDoc extends VisibilitySource {
    emit(): void;
  }

  function fakeDocument(visibility: 'visible' | 'hidden'): FakeDoc {
    let listener: (() => void) | null = null;
    return {
      visibilityState: visibility,
      emit: () => listener?.(),
      addEventListener: (_type, handler) => {
        listener = handler;
      },
      removeEventListener: () => {
        listener = null;
      },
    };
  }

  function harness(visibility: 'visible' | 'hidden' = 'visible') {
    const created: number[] = [];
    const cancelled: number[] = [];
    const ticks: number[] = [];
    const doc = fakeDocument(visibility);
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: (reading) => ticks.push(reading.days),
      now: () => THREE_DAYS_OUT,
      document: doc,
      motionQuery: { matches: false },
      schedule: () => {
        created.push(created.length + 1);
        return created.length;
      },
      cancel: (handle) => cancelled.push(Number(handle)),
    });
    return { ticker, created, cancelled, ticks, doc };
  }

  it('AC-001-114: exactly one interval exists per page', () => {
    const { ticker, created } = harness();
    expect(created).toEqual([1]);
    ticker.stop();
  });

  it('AC-001-114: the tick is exactly 1 Hz, from the one module constant', () => {
    const delays: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      motionQuery: { matches: false },
      schedule: (_handler, ms) => delays.push(ms),
      cancel: () => undefined,
    });
    expect(delays).toEqual([CLOCK_TICK_MS]);
    expect(CLOCK_TICK_MS).toBe(1000);
    ticker.stop();
  });

  it('AC-001-114: the interval is cleared on unmount', () => {
    const { ticker, created, cancelled } = harness();
    ticker.stop();
    expect(cancelled).toEqual([created[0]]);
    ticker.stop();
    expect(cancelled.length).toBe(1);
  });

  it('AC-001-114: hidden clears it, visible recomputes and restarts it', () => {
    const { created, cancelled, ticks, doc } = harness();
    doc.visibilityState = 'hidden';
    doc.emit();
    expect(cancelled).toEqual([1]);

    doc.visibilityState = 'visible';
    doc.emit();
    expect(created.length).toBe(2);
    expect(ticks.at(-1)).toBe(3);
  });

  it('AC-001-114: only one call site of setInterval exists, in the ticker module', () => {
    const files = [...listSourceFiles('web'), ...listSourceFiles('app')];
    const callers = files.filter((file) => readSource(file).includes('setInterval('));
    expect(callers).toEqual(['web/series/clock-ticker.ts']);
    expect(readSource('web/components/series/CountdownClock.tsx')).not.toContain('setInterval');
  });

  it('AC-001-114: a 59 to 00 transition cannot reflow', () => {
    const clockCss = CSS.slice(CSS.indexOf('.clock {'));
    expect(clockCss).toContain('font-variant-numeric: tabular-nums');
    expect(clockCss).toContain('min-inline-size: var(--clock-unit-min)');
    expect(clockCss).toContain('min-inline-size: var(--clock-days-min)');
    const tokens = readFileSync('web/styles/tokens.css', 'utf8');
    expect(tokens).toContain('--clock-unit-min: 2ch');
    expect(tokens).toContain('--clock-days-min: 5ch');
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()], 'es', SECONDS_OUT));
    expect(clock).toContain('>09<');
    expect((readClock(ANCHOR, SECONDS_OUT).seconds + '').length).toBe(1);
  });
});

describe('AC-001-115: the elapsed state means the date passed, and nothing more', () => {
  it('AC-001-115: all four fields render 0 and the elapsed sentence replaces the definition', () => {
    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()], 'es', AFTER));
    expect(readClock(ANCHOR, AFTER).elapsed).toBe(true);
    expect(clock.split('>0<').length - 1).toBe(1);
    expect(clock.split('>00<').length - 1).toBe(3);

    const method = decodeText(methodRegion(pageWith([pyramidSeries(), countdownSeries()], 'es', AFTER)));
    expect(method).toContain(ES.t('countdown.clock.elapsed'));
    expect(method).not.toContain(ES.t('countdown.clock.definition', { date: anchorDate('es') }));
  });

  it('AC-001-115: no timer runs once the anchor has passed', () => {
    const created: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => AFTER,
      motionQuery: { matches: false },
      schedule: () => created.push(1),
      cancel: () => undefined,
    });
    expect(created).toEqual([]);
    ticker.stop();
  });

  it('AC-001-115: no string states the threshold was crossed, or that the projection was validated', () => {
    const method = decodeText(methodRegion(pageWith([pyramidSeries(), countdownSeries()], 'es', AFTER)));
    for (const locale of LOCALES) {
      const elapsed = content(locale).t('countdown.clock.elapsed');
      expect(method + elapsed, locale).not.toMatch(/cruza|cruz|alcanza|alcanz|valid|supera|corrobor/i);
    }
    const page = pageWith([pyramidSeries(), countdownSeries()], 'es', AFTER);
    expect(page).toContain(ES.t('countdown.definition'));
    expect(page).toContain(ES.t('countdown.range', { min: 2039, max: 2043 }));
  });
});

describe('AC-001-116: the clock is confined to the instrument register', () => {
  it('AC-001-116: the clock resolves only ink, projection and neutral structural tokens', () => {
    const clockCss = CSS.slice(CSS.indexOf('/* ---------- The number group'));
    const colourTokens = [...clockCss.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((match) => match[1]);
    const forbidden = ['data-deficit', 'state-danger', 'state-pending', 'surface-3', 'font-serif', 'border-register'];
    for (const token of forbidden) expect(colourTokens, token).not.toContain(token);
    expect(colourTokens).toContain('ink-1');
    expect(colourTokens).toContain('ink-2');
    expect(colourTokens).toContain('ink-3');
  });

  it('AC-001-116: no clock string resolves from the thesis namespace, and none carries thesis vocabulary', () => {
    const CLOCK_KEYS = Object.keys(ES.strings).filter((key) => key.startsWith('countdown.clock.'));
    expect(CLOCK_KEYS.length).toBe(10);
    const thesisWords = /fraude|pirámide|piramide|estafa|colapso|destrucci|explosi|insostenible/i;
    for (const locale of LOCALES) {
      const local = content(locale);
      for (const key of CLOCK_KEYS) {
        const value = local.strings[key as keyof typeof local.strings];
        expect(value, `${locale}/${key}`).not.toMatch(thesisWords);
      }
      const clock = decodeText(clockRegion(pageWith([pyramidSeries(), countdownSeries()], locale)));
      expect(clock, locale).not.toContain(local.editorial.thesis.statement);
      for (const paragraph of local.editorial.thesis.paragraphs) {
        expect(clock, locale).not.toContain(paragraph);
      }
    }
  });

  it('AC-001-116: the clock appears in one block only, and not in the share card or metadata', () => {
    const html = pageWith([pyramidSeries(), countdownSeries()]);
    expect(html.split('class="clock"').length - 1).toBe(1);
    expect(html.split('clock__fields').length - 1).toBe(1);

    for (const locale of LOCALES) {
      const card = shareCard(locale);
      if (!card) throw new Error(`no share card for ${locale}`);
      expect(JSON.stringify(card), locale).not.toContain('clock');
      expect(card.alt, locale).not.toContain(anchorDate(locale));
    }
    for (const file of listSourceFiles('web/seo')) {
      expect(readSource(file), file).not.toContain('clock');
    }

    const importers = listSourceFiles('web/components').filter((file) =>
      /from '.*(CountdownClock|clock-ticker)'/.test(readSource(file)),
    );
    expect(importers).toEqual([
      'web/components/public/NumberStep.tsx',
      'web/components/series/CountdownClock.tsx',
    ]);
  });
});

describe('AC-001-119: the two reference instants are disclosed', () => {
  it('AC-001-119: the arithmetic sentence names both year numbers and the anchor date', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const sentence = local.t('countdown.clock.arithmetic', arithmetic(locale));
      const method = decodeText(methodRegion(pageWith([pyramidSeries(), countdownSeries()], locale)));
      expect(method, locale).toContain(sentence);
      expect(sentence, locale).toContain('16');
      expect(sentence, locale).toContain('2042');
      expect(sentence, locale).toContain('2026');
      expect(sentence, locale).toContain(anchorDate(locale));
    }
  });

  it('AC-001-119: the years numeral and the day count are one group, with no rule between them', () => {
    const rule = CSS.slice(CSS.indexOf('.clock {'), CSS.indexOf('.clock__fields {'));
    expect(rule).not.toContain('border-top');

    const clock = clockRegion(pageWith([pyramidSeries(), countdownSeries()]));
    const yearsNumeralAt = clock.indexOf('countdown__numeral');
    const fieldsAt = clock.indexOf('clock__fields');
    expect(yearsNumeralAt).toBeGreaterThan(-1);
    expect(fieldsAt).toBeGreaterThan(-1);
    // One group: a reader is read `16 años` then `1.234 días …` and may divide one by the other.
    // That is the accepted risk of spec 002 §T3, not an accident.
    expect(yearsNumeralAt).toBeLessThan(fieldsAt);
    const between = clock.slice(yearsNumeralAt, fieldsAt);
    expect(between).not.toContain('<hr');
    expect(between).not.toContain('countdown__rule');
    expect(between).not.toContain('clock__value--days');
  });

  it('AC-002-15: AC-001-119 asserts the group, never the 1px rule it replaced', () => {
    // The authorized rewrite (`docs/TESTING.md §Tests That Encode a Defect`): the assertion above
    // encodes the decision spec 002 reverts, so it is re-pointed rather than deleted. This test
    // reads its neighbour's body, because "the assertion changed" is itself the claim.
    const own = readFileSync('tests/acceptance/clock.test.ts', 'utf8');
    const start = own.indexOf("it('AC-001-119: the years numeral and the day count are one group");
    const body = own.slice(start, own.indexOf('\n  });', start));
    expect(body).not.toContain("toContain('border-top: var(--border-hair)')");
    expect(body).toContain('toBeLessThan(fieldsAt)');
    expect(body).toContain('AC-001-119');
  });

  it('AC-001-119: Reproducir states it too, in the countdown’s own group', () => {
    const html = pageWith([pyramidSeries(), countdownSeries()]);
    const sentence = ES.t('countdown.clock.arithmetic', arithmetic('es'));
    expect(html.split(sentence).length - 1).toBe(2);
    expect(html).toContain('reproduce__note');
  });
});
