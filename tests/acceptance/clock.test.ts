import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { COUNTDOWN_VALUE_FIELDS, anchorFor, anchorProblem, countdownSchemaProblems, readClock } from '../../web/series/clock';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { countdownAt, countdownSeries, countdownValue, pyramidSeries, unavailableSeries } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';
import { listSourceFiles, readSource } from '../helpers/source-scan';
import { numberSentence } from '../helpers/story';

/**
 * The anchored clock's surviving criteria, re-pointed at spec 006's one-number step.
 *
 * Spec 006 T12 deletes the client component and its 1 Hz ticker: with no seconds there is nothing
 * to tick, so the served markup is the value. The clock's *behaviour* that survives is the derived
 * anchor (AC-001-108) and the two states that decide whether a numeral renders at all — no
 * threshold year (AC-001-110) and the elapsed anchor (AC-001-115). The clock-behaviour ids that
 * went with the deleted component and ticker are retired; their subjects are covered by
 * AC-006-29…33.
 */
const ANCHOR = '2042-01-01T00:00:00+01:00';
/** 3 days before the anchor instant: the numeral the served HTML carries. */
const THREE_DAYS_OUT = Date.parse('2041-12-29T00:00:00Z');
/** A minute after the anchor: the elapsed state. */
const AFTER = Date.parse(ANCHOR) + 60_000;

const ES = content('es');

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

/** Step 1's own markup: from its opening tag to the start of step 2. */
function numberStepOf(html: string): string {
  const at = html.indexOf('data-top-step="number"');
  const end = html.indexOf('data-top-step="breakage"', at === -1 ? 0 : at);
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

describe('AC-001-110: no numeral renders without a threshold year', () => {
  const NUMERAL_MARKERS = ['clock__value--days', 'class="clock"'];

  it('AC-001-110: not-crossed renders no numeral and the projection’s own sentence instead', () => {
    const html = pageWith([pyramidSeries(), { ...countdownSeries(), value: countdownAt(90) }]);
    for (const marker of NUMERAL_MARKERS) expect(html, marker).not.toContain(marker);
    expect(html).toContain(ES.t('countdown.notCrossed', { year: 2100 }));
  });

  it('AC-001-110: unavailable and withheld render no numeral at all, and step 1 keeps its title', () => {
    for (const entry of [
      unavailableSeries(countdownSeries()),
      { ...countdownSeries(), availability: 'computed' as const, value: null },
    ]) {
      const html = pageWith([pyramidSeries(), entry]);
      for (const marker of NUMERAL_MARKERS) expect(html, marker).not.toContain(marker);
      expect(html).toContain('id="hero-title"');
      expect(html).toContain('data-top-step="number"');
      expect(html).toContain('data-top-step="meaning"');
    }
  });
});

describe('AC-001-115: the elapsed state means the date passed, and nothing more', () => {
  it('AC-001-115: once the anchor has passed, step 1 renders the sentence and no numeral', () => {
    const html = pageWith([pyramidSeries(), countdownSeries()], 'es', AFTER);
    expect(readClock(ANCHOR, AFTER).elapsed).toBe(true);
    const step = numberStepOf(html);
    expect(step).not.toContain('clock__value--days');
    expect(decodeText(step)).toContain(numberSentence('es'));
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

  it('AC-001-119: the years quantity and the day count are no longer one group', () => {
    // The years numeral left step 1 for `#metodo` (spec 006 T11), so the group clause cannot hold.
    // What the criterion now asserts is the relocation: the day count is alone in step 1 and the
    // years quantity's detail is visible text in the method region (AC-006-31).
    const html = pageWith([pyramidSeries(), countdownSeries()]);
    const step = numberStepOf(html);
    expect(step).toContain('clock__value--days');
    expect(step).not.toContain('countdown__numeral');
    const method = decodeText(methodRegion(html));
    expect(method).toContain(ES.t('countdown.clock.arithmetic', arithmetic('es')));
  });

  it('AC-002-15: AC-001-119 asserts the relocation, never the 1px rule it replaced', () => {
    // The authorized rewrite (`docs/TESTING.md §Tests That Encode a Defect`): the assertion above
    // encodes the decision spec 006 supersedes, so it is re-pointed rather than deleted. This test
    // reads its neighbour's body, because "the assertion changed" is itself the claim.
    const own = readFileSync('tests/acceptance/clock.test.ts', 'utf8');
    const start = own.indexOf("it('AC-001-119: the years quantity and the day count are no longer one group");
    const body = own.slice(start, own.indexOf('\n  });', start));
    expect(body).not.toContain("toContain('border-top: var(--border-hair)')");
    expect(body).toContain('countdown__numeral');
    expect(body).toContain('AC-001-119');
  });

  it('AC-001-119: Reproducir states it too, in the countdown’s own group', () => {
    const html = pageWith([pyramidSeries(), countdownSeries()]);
    const sentence = ES.t('countdown.clock.arithmetic', arithmetic('es'));
    expect(html.split(sentence).length - 1).toBe(2);
    expect(html).toContain('reproduce__note');
  });
});
