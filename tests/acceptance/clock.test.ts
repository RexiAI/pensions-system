import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CountdownClock } from '../../web/components/series/CountdownClock';
import { CountdownBlock } from '../../web/components/series/CountdownBlock';
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
import type { CountdownValue } from '../../web/series/countdown';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import {
  countdownAt,
  countdownSeries,
  countdownValue,
  pyramidSeries,
  unavailableSeries,
} from '../fixtures/series';
import { decodeText } from '../helpers/render-document';
import { listSourceFiles, readSource, stripComments } from '../helpers/source-scan';

const ES = content('es');
const ANCHOR = '2042-01-01T00:00:00+01:00';
/** 3 days, 2 hours, 2 minutes and 5 seconds before the anchor instant. */
const THREE_DAYS_OUT = Date.parse('2041-12-28T20:57:55Z');
/** 2 hours, 2 minutes and 9 seconds before the anchor instant: a sub-day value that must pad. */
const SECONDS_OUT = Date.parse('2041-12-31T20:57:51Z');

/** The clock's own subtree: it is the last child of the countdown section. */
function clockRegion(html: string): string {
  const at = html.indexOf('<div class="clock"');
  return at === -1 ? '' : html.slice(at, html.indexOf('</section>', at));
}

function renderBlock(locale: Locale, nowMs: number, value: CountdownValue = countdownValue()): string {
  return renderComponent(CountdownBlock, { content: content(locale), countdown: value, nowMs });
}

function renderClock(locale: Locale, nowMs: number): string {
  return clockRegion(renderBlock(locale, nowMs));
}

/** This file's own source: an assertion that a *test* changed has to read the test. */
const OWN_SOURCE = readFileSync('tests/acceptance/clock.test.ts', 'utf8');

/** The body of one `it(...)` in this file, from its name to its closing `});`. */
function testBody(namePrefix: string): string {
  const start = OWN_SOURCE.indexOf(`it('${namePrefix}`);
  expect(start, `${namePrefix} must exist in this file`).toBeGreaterThan(-1);
  return OWN_SOURCE.slice(start, OWN_SOURCE.indexOf('\n  });', start));
}

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

describe('AC-001-108: the anchor is derived from the threshold year, never authored', () => {
  it('AC-001-108: anchor is the threshold year’s first instant at +01:00', () => {
    expect(anchorFor(2042)).toBe(ANCHOR);
    expect(anchorFor(2050)).toBe('2050-01-01T00:00:00+01:00');
    expect(anchorFor(null)).toBeNull();
    expect(anchorFor(2042.5)).toBeNull();
    // A month boundary cannot be off by the offset: the instant is 31 December 23:00 UTC.
    expect(new Date(ANCHOR).toISOString()).toBe('2041-12-31T23:00:00.000Z');
  });

  it('AC-001-108: changing the threshold parameter moves the anchor with the year', () => {
    const lower = countdownAt(40);
    const higher = countdownAt(60);
    expect(lower.thresholdYear).not.toBe(higher.thresholdYear);
    expect(lower.anchor).toBe(anchorFor(lower.thresholdYear));
    expect(higher.anchor).toBe(anchorFor(higher.thresholdYear));
    expect(lower.anchor).not.toBe(higher.anchor);

    // The committed deployment's own value, and the field is in the documented schema.
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
    // The one place the string is assembled is the derivation itself.
    expect(readSource('web/series/clock.ts')).toContain('-01-01T00:00:00');
  });

  it('AC-001-108: the derived schema is closed, and a published anchor must match its threshold year', () => {
    // The happy path is the committed artefact; these are the failure paths the build must take
    // when the data drifts from the derivation (verify-derived runs both checks).
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
      const page = content(locale);
      const clock = decodeText(renderClock(locale, THREE_DAYS_OUT));
      expect(clock, locale).not.toBe('');
      expect(clock, locale).toContain(page.t('countdown.clock.anchorLabel'));
      expect(clock, locale).toContain(page.t('countdown.clock.definition', { date: anchorDate(locale) }));
      expect(clock, locale).toContain(anchorDate(locale));
    }
  });

  it('AC-001-109: nothing in the disclosure is behind a details, a title or a tooltip', () => {
    const clock = renderClock('es', THREE_DAYS_OUT);
    expect(clock).not.toContain('<details');
    expect(clock).not.toContain('title=');
    expect(clock).not.toContain('<abbr');
    // The three disclosure slots are ordinary paragraphs in document order.
    const anchorAt = clock.indexOf(ES.t('countdown.clock.anchorLabel'));
    const definitionAt = clock.indexOf(ES.t('countdown.clock.definition', { date: anchorDate('es') }));
    expect(anchorAt).toBeGreaterThan(-1);
    expect(definitionAt).toBeGreaterThan(anchorAt);
  });

  it('AC-001-109: all seven disclosure slots render, in every locale', () => {
    // §P2's disclosure table: six keys, plus the field-label row. A reader who never opens a
    // disclosure and never runs a script still receives every one of them as text or as the
    // group's accessible name.
    const AFTER = Date.parse(ANCHOR) + 1000;
    for (const locale of LOCALES) {
      const page = content(locale);
      const date = anchorDate(locale);
      const clock = decodeText(renderClock(locale, THREE_DAYS_OUT));
      const visible = [
        page.t('countdown.clock.anchor', { date }),
        page.t('countdown.clock.anchorLabel'),
        page.t('countdown.clock.definition', { date }),
        page.t('countdown.clock.arithmetic', arithmetic(locale)),
        page.t('countdown.clock.days'),
        page.t('countdown.clock.hours'),
        page.t('countdown.clock.minutes'),
        page.t('countdown.clock.seconds'),
      ];
      for (const slot of visible) expect(clock, `${locale}: ${slot}`).toContain(slot);
      // The sixth key is the group's name; the seventh is the elapsed replacement.
      expect(clock, locale).toContain(page.t('countdown.clock.a11y', { date }));
      expect(decodeText(renderClock(locale, AFTER)), locale).toContain(page.t('countdown.clock.elapsed'));
      // Seven slots, no more: the clock resolves nothing outside `countdown.clock.*` labels.
      expect(Object.keys(page.strings).filter((key) => key.startsWith('countdown.clock.'))).toHaveLength(10);
    }
  });
});

describe('AC-001-110: no clock renders without a threshold year', () => {
  const CLOCK_MARKERS = ['clock__fields', 'clock__value', 'clock__anchor', 'clock__definition'];

  it('AC-001-110: not-crossed renders no field, no anchor and the fixed sentence instead', () => {
    const html = renderBlock('es', THREE_DAYS_OUT, countdownAt(90));
    for (const marker of CLOCK_MARKERS) expect(html, marker).not.toContain(marker);
    expect(html).not.toContain(anchorDate('es'));
    expect(html).toContain(ES.t('countdown.notCrossed', { year: 2100 }));
  });

  it('AC-001-110: unavailable and withheld render no block at all, and the hero falls back', () => {
    const forState = (entry: DerivedSeries) =>
      pageWith([pyramidSeries(), entry]);

    for (const entry of [
      unavailableSeries(countdownSeries()),
      { ...countdownSeries(), availability: 'computed' as const, value: null },
    ]) {
      const html = forState(entry);
      for (const marker of [...CLOCK_MARKERS, 'class="clock"']) expect(html, marker).not.toContain(marker);
      // The figure ladder keeps the hero: the countdown numeral is absent, the figure value is not.
      expect(html).not.toContain('countdown__numeral');
      expect(html).toContain('hero__value');
    }
  });
});

describe('AC-001-111: without JavaScript the server-rendered clock is complete and correct', () => {
  it('AC-001-111: the four fields, the anchor and the definition are in the markup from the render instant', () => {
    // `renderToStaticMarkup` runs no effect: this is exactly what ships without JavaScript.
    const clock = renderClock('es', THREE_DAYS_OUT);
    expect(clock).toContain('>3<');
    expect(clock).toContain('>02<');
    expect(clock).toContain('>05<');
    expect(clock).toContain(anchorDate('es'));
    expect(clock).toContain(ES.t('countdown.clock.definition', { date: anchorDate('es') }));

    const reading = readClock(ANCHOR, THREE_DAYS_OUT);
    expect(reading).toEqual({ days: 3, hours: 2, minutes: 2, seconds: 5, elapsed: false });
    expect(clock).toContain(`>${reading.days}<`);
  });

  it('AC-001-111: no sub-day value renders without a day value beside it', () => {
    const clock = renderClock('es', THREE_DAYS_OUT);
    const fields = clock.slice(clock.indexOf('clock__fields'), clock.indexOf('clock__anchor'));
    const dayAt = fields.indexOf('clock__value--days');
    expect(dayAt).toBeGreaterThan(-1);
    // Every sub-day value sits after the day value, inside the same fields container.
    for (const sub of fields.matchAll(/clock__value--sub/g)) {
      expect(sub.index ?? -1).toBeGreaterThan(dayAt);
    }
    expect(fields.split('clock__label').length - 1).toBe(4);
  });

  it('AC-001-111: the day field renders even at zero, and pads the sub-day fields', () => {
    const clock = renderClock('es', SECONDS_OUT);
    expect(clock).toContain('>0<');
    expect(clock).toContain('>09<');
    expect(clock).toContain('>02<');
  });

  it('AC-001-111: the correction is pre-paint, and the suppression is confined to the four value spans', () => {
    // §P2 "No JavaScript": a page served from cache must not paint a stale clock, so the
    // correction is a layout effect (before paint), not an effect. And the hydration warning is
    // suppressed on the four value spans only — suppressing it on the anchor or the definition
    // would hide a real content bug behind the same mechanism.
    const source = readSource('web/components/series/CountdownClock.tsx');
    expect(source).toMatch(/useLayoutEffect\(/);
    expect(source).not.toMatch(/\buseEffect\(/);
    // Two authoring sites — the day span and the mapped sub-day span that renders three times —
    // and no third: four value spans in the markup, and nothing else suppressing a mismatch.
    const sites = source.split('suppressHydrationWarning').slice(0, -1);
    expect(sites).toHaveLength(2);
    for (const site of sites) expect(site.slice(-240)).toContain('clock__value');
    expect(source.slice(source.indexOf('clock__anchor'), source.indexOf('clock__arithmetic'))).not.toContain(
      'suppressHydrationWarning',
    );
    // Zero React renders per tick: the leaf writes refs, it does not hold state.
    expect(source).not.toContain('useState');
  });
});

describe('AC-001-112: reduced motion shows the static value and creates no tick', () => {
  const CSS = readFileSync('web/styles/globals.css', 'utf8');

  it('AC-001-112: the sub-day fields are display:none under prefers-reduced-motion', () => {
    const block = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'));
    const rule = block.slice(0, block.indexOf('}', block.indexOf('.clock__field--sub')));
    expect(rule).toContain('.clock__field--sub');
    expect(rule).toContain('display: none');
    // Hidden, never frozen: a frozen seconds field is a stopped clock (P2 §Reduced motion).
    expect(rule).not.toContain('visibility');
    expect(rule).not.toContain('animation-play-state');
  });

  it('AC-001-112: no interval is created at all, and the day count, anchor and definition remain', () => {
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

    const clock = renderClock('es', THREE_DAYS_OUT);
    expect(clock).toContain('>3<');
    expect(clock).toContain(anchorDate('es'));
    expect(clock).toContain(ES.t('countdown.clock.definition', { date: anchorDate('es') }));
    ticker.stop();
  });
});

describe('AC-001-113: the accessible tree is stable and the animated region is hidden', () => {
  const clock = renderClock('es', THREE_DAYS_OUT);
  const fields = clock.slice(clock.indexOf('clock__fields'), clock.indexOf('clock__anchor'));

  it('AC-001-113: each sub-day field is aria-hidden and the day field is exposed', () => {
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

  it('AC-001-113: the group is labelled with the anchor and the conventional-date clause', () => {
    expect(clock).toContain('role="group"');
    expect(clock).toContain(`aria-label="${ES.t('countdown.clock.a11y', { date: anchorDate('es') })}"`);
  });

  it('AC-001-113: the accessible tree is identical in both motion modes', () => {
    // Motion is a CSS and timer concern only: the component takes no motion prop, so the
    // markup — and therefore what assistive technology receives — cannot differ.
    expect(renderClock('es', THREE_DAYS_OUT)).toBe(clock);
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
    // Idempotent: a second stop clears nothing twice.
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
    // One client leaf owns it, and no component creates its own.
    expect(readSource('web/components/series/CountdownClock.tsx')).not.toContain('setInterval');
  });

  it('AC-001-114: a 59 to 00 transition cannot reflow', () => {
    const CSS = readFileSync('web/styles/globals.css', 'utf8');
    const clockCss = CSS.slice(CSS.indexOf('.clock {'));
    expect(clockCss).toContain('font-variant-numeric: tabular-nums');
    expect(clockCss).toContain('min-inline-size: var(--clock-unit-min)');
    expect(clockCss).toContain('min-inline-size: var(--clock-days-min)');
    const tokens = readFileSync('web/styles/tokens.css', 'utf8');
    expect(tokens).toContain('--clock-unit-min: 2ch');
    expect(tokens).toContain('--clock-days-min: 5ch');
    // Two digits, always: `09` and `00` occupy the same two character cells.
    expect(renderClock('es', SECONDS_OUT)).toContain('>09<');
    expect((readClock(ANCHOR, SECONDS_OUT).seconds + '').length).toBe(1);
  });
});

describe('AC-001-115: the elapsed state means the date passed, and nothing more', () => {
  const AFTER = Date.parse('2042-01-01T00:00:00+01:00') + 60_000;

  it('AC-001-115: all four fields render 0 and the elapsed sentence replaces the definition', () => {
    const clock = renderClock('es', AFTER);
    expect(readClock(ANCHOR, AFTER).elapsed).toBe(true);
    expect(clock).toContain(ES.t('countdown.clock.elapsed'));
    expect(clock).not.toContain(ES.t('countdown.clock.definition', { date: anchorDate('es') }));
    expect(clock.split('>0<').length - 1).toBe(1);
    expect(clock.split('>00<').length - 1).toBe(3);
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
    const clock = renderClock('es', AFTER);
    for (const locale of LOCALES) {
      const elapsed = content(locale).t('countdown.clock.elapsed');
      expect(clock + elapsed, locale).not.toMatch(/cruza|cruz|alcanza|alcanz|valid|supera|corrobor/i);
    }
    // The projection group above the rail keeps stating whatever the data says.
    const block = renderBlock('es', AFTER);
    expect(block).toContain(ES.t('countdown.definition'));
    expect(block).toContain(ES.t('countdown.range', { min: 2039, max: 2043 }));
  });
});

describe('AC-001-116: the clock is confined to the instrument register', () => {
  const CSS = readFileSync('web/styles/globals.css', 'utf8');

  it('AC-001-116: the clock resolves only ink, projection and neutral structural tokens', () => {
    const clockCss = CSS.slice(CSS.indexOf('/* ---------- Revision 3: the anchored clock'));
    const colourTokens = [...clockCss.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((match) => match[1]);
    const forbidden = ['data-deficit', 'state-danger', 'state-pending', 'surface-3', 'font-serif', 'border-register'];
    for (const token of forbidden) {
      expect(colourTokens, token).not.toContain(token);
    }
    expect(colourTokens).toContain('ink-1');
    expect(colourTokens).toContain('ink-2');
    expect(colourTokens).toContain('ink-3');
  });

  it('AC-001-116: no clock string resolves from the thesis namespace, and none carries thesis vocabulary', () => {
    const CLOCK_KEYS = Object.keys(ES.strings).filter((key) => key.startsWith('countdown.clock.'));
    expect(CLOCK_KEYS.length).toBe(10);
    const thesisWords = /fraude|pirámide|piramide|estafa|colapso|destrucci|explosi|insostenible/i;
    for (const locale of LOCALES) {
      const page = content(locale);
      for (const key of CLOCK_KEYS) {
        const value = page.strings[key as keyof typeof page.strings];
        expect(value, `${locale}/${key}`).not.toMatch(thesisWords);
      }
      const clock = renderClock(locale, THREE_DAYS_OUT);
      expect(clock, locale).not.toContain(page.editorial.thesis.statement);
      for (const paragraph of page.editorial.thesis.paragraphs) {
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

    // One continuous element: only the countdown block imports the clock at all.
    const importers = listSourceFiles('web/components').filter((file) =>
      /from '.*(CountdownClock|clock-ticker)'/.test(readSource(file)),
    );
    expect(importers).toEqual(['web/components/series/CountdownBlock.tsx', 'web/components/series/CountdownClock.tsx']);
  });
});

describe('AC-001-119: the two reference instants are disclosed', () => {
  it('AC-001-119: the arithmetic sentence names both year numbers and the anchor date', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      const clock = decodeText(renderClock(locale, THREE_DAYS_OUT));
      const sentence = page.t('countdown.clock.arithmetic', {
        years: '16',
        thresholdYear: '2042',
        snapshotYear: '2026',
        date: anchorDate(locale),
      });
      expect(clock, locale).toContain(sentence);
      expect(sentence, locale).toContain('16');
      expect(sentence, locale).toContain('2042');
      expect(sentence, locale).toContain('2026');
      expect(sentence, locale).toContain(anchorDate(locale));
    }
  });

  it('AC-001-119: the years numeral and the day count are one group, with no rule between them', () => {
    const CSS = readFileSync('web/styles/globals.css', 'utf8');
    const rule = CSS.slice(CSS.indexOf('.clock {'), CSS.indexOf('.clock__fields'));
    // Spec 002 §T3 removed the 1px separator this assertion used to require. The old rationale
    // — keep the two numerals out of one typographic group — is the decision the spec reverts;
    // the risk it mitigated is recorded as accepted in `CountdownBlock.tsx`.
    expect(rule).not.toContain('border-top');

    const block = renderBlock('es', THREE_DAYS_OUT);
    const yearsNumeralAt = block.indexOf('countdown__numeral');
    const railAt = block.indexOf('class="clock"');
    const fieldsAt = block.indexOf('clock__fields');
    expect(yearsNumeralAt).toBeGreaterThan(-1);
    expect(railAt).toBeGreaterThan(-1);
    // The numeral renders *inside* the clock, above the four-field band: one group, so a reader
    // is read `16 años` then `1.234 días …` and may divide one by the other. That is the
    // accepted risk, not an accident.
    expect(yearsNumeralAt).toBeGreaterThan(railAt);
    expect(yearsNumeralAt).toBeLessThan(fieldsAt);
    const between = block.slice(yearsNumeralAt, fieldsAt);
    expect(between).not.toContain('<hr');
    expect(between).not.toContain('countdown__rule');
    expect(between).not.toContain('clock__value--days');
  });

  it('AC-002-15: AC-001-119 asserts the new structure, never the 1px rule', () => {
    // The authorized rewrite (`docs/TESTING.md §Tests That Encode a Defect`): the assertion above
    // encodes the decision spec 002 reverts, so it is re-pointed rather than deleted. This test
    // reads its neighbour's body, because "the assertion changed" is itself the claim.
    const body = testBody('AC-001-119: the years numeral and the day count are one group');
    expect(body).not.toContain("toContain('border-top: var(--border-hair)')");
    expect(body).not.toContain("not.toContain('clock__fields')");
    // In the other direction: the two numerals are now asserted to be in one group.
    expect(body).toContain('toBeGreaterThan(railAt)');
    expect(body).toContain('toBeLessThan(fieldsAt)');
    // The scenario ID survives the rewrite — traceability is why it is pinned.
    expect(body).toContain('AC-001-119');
  });

  it('AC-001-119: Reproducir states it too, in the countdown’s own group', () => {
    const html = pageWith([pyramidSeries(), countdownSeries()]);
    const sentence = ES.t('countdown.clock.arithmetic', {
      years: '16',
      thresholdYear: '2042',
      snapshotYear: '2026',
      date: anchorDate('es'),
    });
    expect(html.split(sentence).length - 1).toBe(2);
    expect(html).toContain('reproduce__note');
  });
});

/**
 * Revision 4 §C1: the clock face is centred within its panel, at both breakpoints, in every state
 * that renders a clock.
 *
 * **How this is checked.** vitest runs with `environment: 'node'` and there is no layout engine,
 * so the centring is asserted as the mechanism that produces it — the grid, the span, the
 * centring keywords, and the absence of every left-aligning alternative — and the geometry below
 * is the documented manual measurement: Chromium against the built app (`npm run build`,
 * `next start`), `getBoundingClientRect()` for the boxes and a `Range` over the numeral's text
 * node for the glyph run, taken 2026-10-28.
 *
 *   viewport   panel content (x)    day numeral glyphs (x)   optical centre − axis
 *   390x844    40.00 – 335.00       148.95 – 226.02          −0.02px  (`5543`, 4 chars)
 *              40.00 – 335.00       177.86 – 197.13          −0.01px  (forced `9`, 1 char)
 *   1440x900   847.83 – 1276.50     1023.61 – 1100.67        −0.02px  (`5543`, 4 chars)
 *              847.83 – 1276.50     1052.52 – 1071.78        −0.02px  (forced `9`, 1 char)
 *
 * Two things that table is there to prove, and that a `text-align: center` on the numeral would
 * not have proved: the numeral is centred on the panel's axis to within a hundredth of a pixel,
 * and its centre does not move when the numeral's own width changes from one character to four.
 * Before the fix it sat 68.00px left of the axis at both widths — the flex row put the day field
 * first and the three sub-day fields after it, so the face was measured from its own left edge.
 * At 390x844 the panel is `display: contents` (the mobile reorder) and the material lives on
 * `.hero__panel-countdown`; both are the same 295px box, so both have the same axis.
 *
 * **Revision 4 §C2 — the whole face.** Centring only the numeral row left the panel carrying two
 * alignment systems: everything above and below it was flush left. The entire section now shares
 * one axis — `text-align: center` and `justify-items: center` on `.countdown`, `text-align:
 * center` on the rail — and the prose that wraps centres as a block inside `--measure-face`.
 * Measured in Chromium against the built app (`npm run build`, `next start`), 2026-10-28, as the
 * offset between each block's glyph run and the section's axis (a `Range` over the text, so it is
 * the ink and not the box):
 *
 *   block                    390x844 (axis 187.50)   1440x900 (axis 1062.16)   measure / longest line
 *   eyebrow                  0.00px                   0.00px                    —
 *   years numeral + unit    −0.01px                   0.00px                    —
 *   threshold year + label   0.00px                   0.00px                    —
 *   definition               0.00px                   0.00px                    280 / 259.09
 *   variants                 0.01px                   0.00px                    280 / 131.48
 *   source                   0.01px                   0.01px                    280 / 142.36
 *   back-cast sentence       0.00px                   0.00px                    280 / 240.13
 *   day numeral             −0.02px                  −0.02px                    —
 *   anchor line              0.00px                   0.00px                    280 / 184.69
 *   disclosure               0.00px                   0.00px                    280 / 275.13
 *   arithmetic (>=1024px)    —                        0.00px                    280 / 276.81
 *
 * No prose block exceeds its measure at either width, and the panel is 295px / 428.67px, so the
 * measure is 95% / 65% of it — the phone is the binding case, because the first-viewport guarantee
 * (`AC-001-107`) forbids a narrower one there.
 */
/** One parsed CSS rule: its selector list and its declaration block, both comment-free. */
interface StyleRule {
  selectors: string[];
  body: string;
}

describe('AC-001-111: the clock face is horizontally centred within its panel', () => {
  const CSS = readFileSync('web/styles/globals.css', 'utf8');
  const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');

  /** Every rule in one region of the stylesheet, selector list split. Comments are stripped
   *  first — a declaration that follows a comment inside a rule body would otherwise be
   *  invisible to the `;`-anchored match. A rule inside a media query is included: that is how a
   *  breakpoint override would be caught. */
  function rulesIn(region: string): StyleRule[] {
    return [...stripComments(region).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
      selectors: (match[1] ?? '')
        .split(',')
        .map((selector) => selector.trim().replace(/\s+/g, ' '))
        .filter(Boolean),
      body: match[2] ?? '',
    }));
  }

  /** The clock's own section, from its Revision 3 heading to the end of the file. */
  const CLOCK_RULES = rulesIn(CSS.slice(CSS.indexOf('/* ---------- Revision 3: the anchored clock')));
  /** The countdown block's section: the face's heading block, above the clock rail's own rule. */
  const COUNTDOWN_RULES = rulesIn(
    CSS.slice(
      CSS.indexOf('/* ---------- Revision 2: the countdown'),
      CSS.indexOf('/* ---------- Revision 2: the scope mark'),
    ),
  );
  /** The face is both sections: Revision 4 §C2 centres the projection block and the rail below. */
  const FACE_RULES = [...COUNTDOWN_RULES, ...CLOCK_RULES];

  function valueIn(rules: readonly StyleRule[], selector: string, property: string): string[] {
    return rules
      .filter((rule) => rule.selectors.includes(selector))
      .map((rule) => new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`).exec(rule.body)?.[1]?.trim())
      .filter((value): value is string => Boolean(value));
  }

  /** Every value the clock's section declares for `selector { property }`, in document order. */
  function declared(selector: string, property: string): string[] {
    return valueIn(CLOCK_RULES, selector, property);
  }

  /** Every value either section of the face declares for `selector { property }`. */
  function declaredOnFace(selector: string, property: string): string[] {
    return valueIn(FACE_RULES, selector, property);
  }

  /**
   * Every element the countdown section renders that can hold a line of text or a rule, and
   * therefore has to be on the face's axis. Written out rather than derived so that an element
   * *joining* the face is a test failure rather than a silent left-aligned straggler — the defect
   * this describe exists for was exactly one block (the numeral row) being centred while its
   * eleven neighbours stayed flush left.
   */
  const FACE_ELEMENTS = [
    'countdown',
    'countdown--not-crossed',
    'countdown__eyebrow',
    'countdown__rule',
    'countdown__value',
    'countdown__numeral',
    'countdown__unit',
    'countdown__year-line',
    'countdown__year',
    'countdown__year-label',
    'countdown__definition',
    'countdown__range',
    'countdown__source',
    'countdown__backcast',
    'countdown__statement',
    'clock',
    'clock__fields',
    'clock__field',
    'clock__field--days',
    'clock__field--sub',
    'clock__value',
    'clock__value--days',
    'clock__value--sub',
    'clock__label',
    'clock__anchor',
    'clock__anchor-label',
    'clock__anchor-date',
    'clock__definition',
    'clock__arithmetic',
  ];

  /** The elements that centre as a block within a measure, because they are prose that wraps. */
  const FACE_PROSE = [
    '.countdown__definition',
    '.countdown__statement',
    '.countdown__range',
    '.countdown__source',
    '.countdown__backcast',
    '.clock__anchor',
    '.clock__definition',
    '.clock__arithmetic',
  ];

  /** Every `countdown__*` / `clock__*` class in a piece of rendered markup, deduplicated. */
  function faceClasses(html: string): string[] {
    const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap((match) => (match[1] ?? '').split(/\s+/));
    return [...new Set(classes.filter((name) => /^(countdown|clock)(__|--|$)/.test(name)))].sort();
  }

  it('AC-001-111: the face is a centred grid, not a left-aligned flex row', () => {
    expect(declared('.clock__fields', 'display')).toEqual(['grid']);
    expect(declared('.clock__fields', 'display')).not.toContain('flex');
    expect(declared('.clock__fields', 'justify-content')).toEqual(['center']);
    expect(declared('.clock__fields', 'justify-items')).toEqual(['center']);
    // One declaration each, so no breakpoint and no state re-declares them: the face is centred
    // at 320px and at 1440px from the same rule, and reduced motion only hides the sub-day fields.
    expect(CLOCK_RULES.filter((rule) => rule.selectors.includes('.clock__fields'))).toHaveLength(1);
  });

  it('AC-001-111: the day count spans the whole row, so its centre is the row’s centre', () => {
    // The span is what makes the centring geometric rather than measured: the day cell is as wide
    // as the three sub-day columns and their gaps, so its centre cannot drift from theirs.
    expect(declared('.clock__field--days', 'grid-column')).toEqual(['1 / -1']);
    const clock = renderClock('es', THREE_DAYS_OUT);
    const fields = clock.slice(clock.indexOf('clock__fields'), clock.indexOf('clock__anchor'));
    expect(fields).toContain('clock__field clock__field--days');
    // The spanning field is the day count, and it comes first: a span declared on a sub-day field
    // would centre the wrong element.
    expect(fields.indexOf('clock__field--days')).toBeLessThan(fields.indexOf('clock__field--sub'));
    expect(fields.slice(fields.indexOf('clock__field--days'), fields.indexOf('clock__field--sub'))).toContain(
      'clock__value--days',
    );
  });

  it('AC-001-111: the three sub-day columns are equal and fixed, so no numeral can inflate them', () => {
    // `auto` tracks would absorb the spanning numeral's width — the measured failure: the first
    // column grew to 96px and the three numerals then sat at 119 / 213 / 281 instead of symmetric
    // about the axis. Fixed equal columns plus equal gaps are symmetric by construction.
    expect(declared('.clock__fields', 'grid-template-columns')).toEqual([
      'repeat(3, var(--clock-sub-col))',
    ]);
    expect(declared('.clock__fields', 'grid-template-columns').join('')).not.toMatch(/\bauto\b/);
    expect(declared('.clock__fields', 'column-gap')).toEqual(['var(--clock-gap)']);
    // The one size the row depends on: wide enough for the longest label any published locale
    // uses (`Stunden`), and narrow enough that three columns and two gaps fit the 320px floor.
    const subCol = /--clock-sub-col:\s*([^;]+);/.exec(TOKENS)?.[1]?.trim();
    expect(subCol).toBe('3rem');
  });

  it('AC-001-111: the numeral and its label share one axis, so a wide label cannot drag the numeral', () => {
    // The failure the brief names: a short numeral over a wide label row. The numeral is a grid
    // item with `justify-items: center`, so the *box* is centred in the cell and the label's width
    // never becomes the numeral's sizing authority; `text-align: center` then centres the glyphs
    // inside the box that `min-inline-size` makes width-invariant.
    expect(declared('.clock__field', 'justify-items')).toEqual(['center']);
    expect(declared('.clock__field', 'text-align')).toEqual(['center']);
    expect(declared('.clock__value--days', 'min-inline-size')).toEqual(['var(--clock-days-min)']);
    // The label is not given a width, an order, or an inline size: it is centred, not load-bearing.
    for (const property of ['inline-size', 'width', 'min-inline-size', 'order', 'float', 'position']) {
      expect(declared('.clock__label', property), `.clock__label { ${property} }`).toEqual([]);
    }
  });

  it('AC-001-111: nothing in either section re-aligns the face to the left', () => {
    const LEFT = /^(start|flex-start|left|self-start)$/;
    for (const rule of FACE_RULES) {
      for (const property of ['justify-content', 'justify-items', 'justify-self', 'text-align', 'float']) {
        const value = new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`).exec(rule.body)?.[1]?.trim();
        if (value) expect(value, `${rule.selectors.join(', ')} { ${property} }`).not.toMatch(LEFT);
      }
      expect(rule.body, rule.selectors.join(', ')).not.toMatch(/(^|;)\s*margin-(left|inline-start):\s*0/);
    }
  });

  it('AC-001-111: the elapsed state renders the same centred face', () => {
    // The layout is state-independent: the elapsed clock keeps the same grid, the same span and
    // the same class, and only the four values and the definition sentence change.
    const AFTER = Date.parse(ANCHOR) + 60_000;
    const clock = renderClock('es', AFTER);
    expect(clock).toContain('clock__field clock__field--days');
    expect(clock).toContain('data-clock-state="elapsed"');
    expect(declared('.clock__field--days', 'grid-column')).toEqual(['1 / -1']);
  });

  /**
   * Revision 4 §C2: the *whole* face, not just the numeral row. The projection block above the
   * rail — eyebrow, years numeral, threshold year, definition, variants, source, back-cast
   * sentence — was flush left while the clock below it was centred, so the panel carried two
   * alignment systems. These five tests are the contract for one axis: one text alignment on the
   * section, one centring keyword on its grid, one measure for the prose that wraps, and the two
   * rules still spanning the face.
   */
  it('AC-001-111: the section and the rail both centre their text, from one declaration each', () => {
    // `text-align` is inherited, so one declaration on `.countdown` reaches the eyebrow, the
    // numeral row, the threshold year line, the definition, the variants, the source and the
    // back-cast sentence; `.clock` declares it too so the rail does not depend on its mount.
    expect(valueIn(COUNTDOWN_RULES, '.countdown', 'text-align')).toEqual(['center']);
    expect(valueIn(COUNTDOWN_RULES, '.countdown', 'justify-items')).toEqual(['center']);
    expect(declared('.clock', 'text-align')).toEqual(['center']);
    // One rule each: no breakpoint and no state re-declares the alignment, so mobile and desktop
    // and the elapsed and not-crossed states are the same axis.
    expect(COUNTDOWN_RULES.filter((rule) => rule.selectors.includes('.countdown'))).toHaveLength(1);
    expect(CLOCK_RULES.filter((rule) => rule.selectors.includes('.clock'))).toHaveLength(1);
  });

  it('AC-001-111: the two baseline-aligned rows centre their contents', () => {
    // `justify-items: center` makes each row a fit-content box on the axis; `justify-content`
    // then centres the pair inside it, so the numeral-and-unit and the year-and-label groups
    // centre as groups rather than the numerals centring and their labels trailing.
    for (const selector of ['.countdown__value', '.countdown__year-line']) {
      expect(valueIn(COUNTDOWN_RULES, selector, 'justify-content'), `${selector}`).toEqual(['center']);
    }
  });

  it('AC-001-111: the threshold rule and the clock group still span the whole face', () => {
    // A centred grid item shrinks to fit its content, and a rule has no content: without an
    // explicit stretch the 3px threshold rule would collapse to zero width. Spec 002 §T3 removed
    // the rail's hairline, so the clock's span is carried by `justify-self: stretch` alone — the
    // span is asserted here, the removed hairline is not.
    expect(valueIn(COUNTDOWN_RULES, '.countdown__rule', 'justify-self')).toEqual(['stretch']);
    expect(declared('.clock', 'justify-self')).toEqual(['stretch']);
    expect(valueIn(COUNTDOWN_RULES, '.countdown__rule', 'height')).toEqual(['var(--rule-projection)']);
    expect(declared('.clock', 'border-top')).toEqual([]);
  });

  it('AC-001-111: prose that wraps centres as a block inside a measure, never across the panel', () => {
    // Centred ragged-right prose spanning the full panel reads worse than flush left, so the
    // wrapping sentences are given their own measure and centred as a block inside it.
    const measure = /--measure-face:\s*([^;]+);/.exec(TOKENS)?.[1]?.trim();
    expect(measure, '--measure-face').toBe('17.5rem');
    for (const selector of FACE_PROSE) {
      expect(declaredOnFace(selector, 'max-inline-size'), `${selector} { max-inline-size }`).toEqual([
        'var(--measure-face)',
      ]);
      expect(declaredOnFace(selector, 'margin-inline'), `${selector} { margin-inline }`).toEqual(['auto']);
      const wrap = declaredOnFace(selector, 'text-wrap').join('');
      expect(wrap, `${selector} { text-wrap }`).toMatch(/^(balance|pretty)$/);
    }
  });

  it('AC-002-16: the face element list is left unchanged by the merge, and reviewable as such', () => {
    // The merge moved the years numeral into `.clock` and kept every class — `countdown__value`,
    // `countdown__numeral` and `countdown__unit` all still render, only their container changed —
    // so no entry is added or removed. A reviewed-and-unchanged list and a forgotten one look
    // identical in a diff; this assertion is what makes it a review.
    expect(FACE_ELEMENTS).toHaveLength(29);
    for (const element of [
      'countdown__value',
      'countdown__numeral',
      'countdown__unit',
      'clock__fields',
      'clock__value--days',
    ]) {
      expect(FACE_ELEMENTS).toContain(element);
    }
    const merged = renderBlock('es', THREE_DAYS_OUT);
    for (const element of FACE_ELEMENTS) {
      // `countdown__statement` and the `--not-crossed` modifier belong to the other branch.
      if (element === 'countdown__statement' || element === 'countdown--not-crossed') continue;
      expect(merged, `${element} renders`).toContain(element);
    }
    // The centring invariant is not traded for the new structure: a centred grid, not a flex row;
    // one axis; prose centred inside its measure.
    expect(declared('.clock__fields', 'display')).toEqual(['grid']);
    expect(declared('.clock__fields', 'display')).not.toContain('flex');
    expect(declared('.clock__fields', 'justify-items')).toEqual(['center']);
    expect(declared('.clock', 'text-align')).toEqual(['center']);
    expect(declaredOnFace('.clock__anchor', 'max-inline-size')).toEqual(['var(--measure-face)']);
  });

  it('AC-002-29: AC-001-111’s hairline assertion is re-pointed to the surviving span', () => {
    // The span did not go away with the hairline: it is carried by `justify-self: stretch` on the
    // rule and on `.clock`. Re-pointing the assertion keeps the guard; deleting it would not.
    const body = testBody(
      'AC-001-111: the threshold rule and the clock group still span the whole face',
    );
    expect(body).not.toContain("toEqual(['var(--border-hair)'])");
    expect(body).toContain(
      "valueIn(COUNTDOWN_RULES, '.countdown__rule', 'justify-self')).toEqual(['stretch'])",
    );
    expect(body).toContain("declared('.clock', 'justify-self')).toEqual(['stretch'])");
    expect(body).toContain(
      "valueIn(COUNTDOWN_RULES, '.countdown__rule', 'height')).toEqual(['var(--rule-projection)'])",
    );
    // The removed hairline is asserted absent, never left unmentioned.
    expect(body).toContain("declared('.clock', 'border-top')).toEqual([])");
    expect(body).toContain('AC-001-111');
  });

  it('AC-001-111: every element the face renders is one this contract covers', () => {
    // The failure mode this catches: a new element joining the face and inheriting the browser's
    // default left edge. The expected list is written out, so adding one is a deliberate edit
    // here rather than a silent straggler in the panel.
    const rendered = faceClasses(renderBlock('es', THREE_DAYS_OUT));
    // `countdown__statement` and the `--not-crossed` modifier belong to the other branch below.
    const computedOnly = FACE_ELEMENTS.filter(
      (element) => element !== 'countdown__statement' && element !== 'countdown--not-crossed',
    );
    for (const element of computedOnly) {
      expect(rendered, `${element} renders`).toContain(element);
    }
    expect(rendered.filter((element) => !FACE_ELEMENTS.includes(element)), 'uncovered elements').toEqual([]);

    // The not-crossed branch renders no clock (AC-001-110) and has its own prose. It is centred
    // by the same `.countdown` rule — the alignment is not a property of the clock's presence.
    const notCrossed = faceClasses(renderBlock('es', THREE_DAYS_OUT, countdownAt(99)));
    expect(notCrossed).toContain('countdown__statement');
    expect(notCrossed.filter((element) => !FACE_ELEMENTS.includes(element))).toEqual([]);
    expect(notCrossed.filter((element) => element.startsWith('clock'))).toEqual([]);
  });
});

/** The anchor date as the page renders it: `formatDate` in Madrid, never in UTC. */
function anchorDate(locale: Locale): string {  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(new Date(ANCHOR));
}

/** The two reference instants' sentence, with this deployment's own numbers in it. */
function arithmetic(locale: Locale): Record<string, string> {
  return {
    years: '16',
    thresholdYear: '2042',
    snapshotYear: '2026',
    date: anchorDate(locale),
  };
}

/** Renders the client leaf directly, so a test can pin the instant it server-renders at. */
describe('the client leaf renders the same four fields the block does', () => {
  it('renders the fields, the anchor and the definition from the injected instant', () => {
    const html = renderComponent(CountdownClock, {
      anchor: ANCHOR,
      nowMs: THREE_DAYS_OUT,
      locale: 'es' as Locale,
      // Spec 002 §T3: the years numeral is the group's first child, resolved by the parent.
      years: '16',
      yearsUnit: ES.t('countdown.unit'),
      strings: {
        a11y: ES.t('countdown.clock.a11y', { date: anchorDate('es') }),
        anchor: ES.t('countdown.clock.anchor', { date: anchorDate('es') }),
        anchorLabel: ES.t('countdown.clock.anchorLabel'),
        definition: ES.t('countdown.clock.definition', { date: anchorDate('es') }),
        arithmetic: ES.t('countdown.clock.arithmetic', {
          years: '16',
          thresholdYear: '2042',
          snapshotYear: '2026',
          date: anchorDate('es'),
        }),
        elapsed: ES.t('countdown.clock.elapsed'),
        days: ES.t('countdown.clock.days'),
        hours: ES.t('countdown.clock.hours'),
        minutes: ES.t('countdown.clock.minutes'),
        seconds: ES.t('countdown.clock.seconds'),
      },
    });
    expect(html).toContain('>3<');
    expect(html).toContain(anchorDate('es'));
    expect(html).toContain('role="group"');
    // The four value spans are the only nodes allowed to differ from the server render.
    expect(html.split('<span class="clock__value').length - 1).toBe(4);
  });
});
