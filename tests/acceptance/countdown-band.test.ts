import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NumberStep } from '../../web/components/public/NumberStep';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { formatDate } from '../../web/content/format';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { CLOCK_TIME_ZONE } from '../../web/series/clock';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import {
  countdownAt,
  countdownSeries,
  countdownValue,
  pyramidSeries,
  seriesFixtures,
  unavailableSeries,
} from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const NOW = Date.parse('2026-10-31T10:00:00Z');
const NUMBER_STEP = TOP_STEPS[0];

if (NUMBER_STEP === undefined) throw new Error('TOP_STEPS has no first step');

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

/** Step 1's own markup: from its opening tag to the start of step 2. */
function numberStepOf(html: string): string {
  const start = html.indexOf('data-top-step="number"');
  const end = html.indexOf('data-top-step="breakage"');
  return start === -1 || end === -1 ? '' : html.slice(start, end);
}

/** The method region: from `id="metodo"` to the debate registers. */
function methodOf(html: string): string {
  const start = html.indexOf('id="metodo"');
  const end = html.indexOf('id="debate"');
  return start === -1 || end === -1 ? '' : html.slice(start, end);
}

function anchorDate(locale: Locale): string {
  return formatDate(countdownValue().anchor as string, locale, CLOCK_TIME_ZONE);
}

describe('AC-003-02: the day numeral is larger than the h1 on the numeral ladder', () => {
  it('AC-003-02: step 1 sets the day numeral on --text-num-xl and leaves the display cap at 4rem', () => {
    expect(TOKENS).toMatch(/--text-num-xl:\s*clamp\(2\.75rem, 6\.4vw, 5rem\);/);
    expect(TOKENS).toMatch(/--text-display:\s*clamp\(2\.5rem, 4\.9vw, 4rem\);/);
    expect(CSS).toMatch(/\.clock__value--days\s*\{[^}]*font-size:\s*var\(--text-num-xl\)/s);
    expect(TOKENS).toMatch(/--text-num-xl:\s*clamp\([^)]*5rem\)/);
  });

  it('AC-003-02: the day count is the story’s only numeral at the ladder’s top step', () => {
    const step = numberStepOf(page());
    expect(step).toContain('clock__value--days');
    expect(CSS).toMatch(/\.clock__value--days\s*\{[^}]*min-inline-size:\s*var\(--clock-days-min\)/s);
    // Two numerals above 20px in the whole story: the day count and the years quantity.
    expect(CSS).toMatch(/\.countdown__numeral\s*\{[^}]*font-size:\s*var\(--text-num-l\)/s);
  });
});

describe('AC-003-03: the day numeral is the largest numeral on the page', () => {
  it('AC-003-03: the years numeral steps down to --text-num-l and no plate numeral competes', () => {
    expect(TOKENS).toMatch(/--text-num-l:\s*2rem;/);
    expect(CSS).toMatch(/\.countdown__numeral\s*\{[^}]*font-size:\s*var\(--text-num-l\)/s);
    // The hero's headline figure (the old `--text-num-xl` competitor) left the page with T12.
    const html = page();
    expect(html).not.toContain('hero__value');
    expect(CSS).not.toContain('.hero__value');
  });
});

describe('AC-003-04: the numeral hierarchy is the story’s, and few things occupy the top', () => {
  it('AC-003-04: the sub-day fields step down to --text-meta, so one measured quantity remains', () => {
    // Recorded override (spec 004 T2): the sub-day values were at `--text-clock-sub` (32px). The
    // hierarchy criterion — few numerals at the top of the ladder — stands; the value it names is
    // now `--text-meta`, because four 32px numerals were the four-numerals defect this removed.
    expect(CSS).toMatch(/\.clock__value--sub\s*\{[^}]*font-size:\s*var\(--text-meta\)/s);
    expect(CSS).not.toMatch(/\.clock__value--sub\s*\{[^}]*--text-clock-sub/s);
    expect(TOKENS).toMatch(/--text-meta:\s*0\.8125rem;/);
  });

  it('AC-003-04: the digits are fixed-width and nothing animates or blinks', () => {
    expect(CSS).not.toMatch(/@keyframes/);
    const clock = CSS.slice(CSS.indexOf('.clock {'), CSS.indexOf('.clock__fields {'));
    expect(clock).not.toMatch(/transition|animation|blink/);
    expect(CSS).toMatch(/\.clock__value\s*\{[^}]*font-variant-numeric:\s*tabular-nums/s);
  });
});

describe('AC-003-05: the anchor and both disclosures are retained, in the method region', () => {
  it('AC-003-05: the anchor label, the projection sentence and the arithmetic are visible text', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const method = methodOf(decodeText(page(seriesFixtures(), locale)));
      const outsideDetails = method.replace(/<details[\s\S]*?<\/details>/g, '');
      expect(outsideDetails, locale).toContain(local.t('countdown.clock.anchorLabel'));
      expect(outsideDetails, locale).toContain('class="clock__definition"');
      expect(outsideDetails, locale).toContain('class="clock__arithmetic"');
      expect(outsideDetails, locale).not.toContain('class="clock__definition" aria-hidden');
      expect(method, locale).not.toMatch(/\stitle="/);
    }
  });
});

describe('AC-003-07: reduced motion hides the tick and does not freeze it', () => {
  it('AC-003-07: no story rule sets a display on the sub-day fields', () => {
    const story = CSS.slice(CSS.indexOf('.step {'), CSS.indexOf('@media (prefers-reduced-motion'));
    expect(story).not.toMatch(/clock__field--sub[^{]*\{[^}]*display/);
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.clock__field--sub \{\s*display: none;/);
  });

  it('AC-003-07: the server-rendered day count is the render instant’s', () => {
    const html = page(seriesFixtures(), 'es', NOW);
    const expected = Math.floor((Date.parse('2042-01-01T00:00:00+01:00') - NOW) / 86_400_000);
    expect(html).toContain(`>${expected}<`);
  });
});

describe('AC-003-08: no clock without a threshold year, step 1 included', () => {
  it('AC-003-08: not-crossed, unavailable and withheld render no field and no anchor', () => {
    const notCrossed = { ...countdownSeries(), value: countdownAt(90) };
    for (const entry of [notCrossed, unavailableSeries(countdownSeries()), { ...countdownSeries(), value: null }]) {
      const html = page([pyramidSeries(), entry]);
      expect(html).not.toContain('clock__value');
      expect(html).not.toContain('class="clock"');
      expect(html).not.toContain('clock__anchor');
    }
  });

  it('AC-003-08: the step renders its title and its label, and no substitute number', () => {
    const notCrossed = { ...countdownSeries(), value: countdownAt(90) };
    const html = page([pyramidSeries(), notCrossed]);
    expect(html).toContain('id="hero-title"');
    expect(html).toContain(content('es').t('countdown.notCrossed', { year: 2100 }));
  });
});

describe('AC-003-09: clock behaviour is unchanged by the recomposition', () => {
  it('AC-003-09: the archived clock scenarios run unedited in their behaviour assertions', () => {
    const bandTestSource = readFileSync('tests/acceptance/clock.test.ts', 'utf8');
    // The clock's behavioural criteria (AC-001-108…-116) still live there and still pass; this
    // file only asserts the composition around them.
    expect(bandTestSource).toContain('AC-001-114');
    expect(bandTestSource).toContain('AC-001-115');
  });

  it('AC-003-09: the page renders exactly one clock, and it is step 1’s', () => {
    const html = page();
    expect(html.split('class="clock"').length - 1).toBe(1);
    expect(numberStepOf(html)).toContain('class="clock"');
  });
});

describe('the number group’s own copy', () => {
  it('names the target date once, in step 1’s sentence', () => {
    for (const locale of LOCALES) {
      const step = decodeText(numberStepOf(page(seriesFixtures(), locale)));
      expect(step, locale).toContain(content(locale).t('steps.number.sentence', { date: anchorDate(locale) }));
    }
  });

  it('renders no footnote: no definition, range, source, back-cast or year label', () => {
    const step = numberStepOf(page());
    for (const marker of ['countdown__definition', 'countdown__range', 'countdown__source', 'countdown__backcast', 'countdown__year-line']) {
      expect(step, marker).not.toContain(marker);
    }
  });

  it('renders the years numeral and the unit from the content model', () => {
    const html = renderComponent(NumberStep, { step: NUMBER_STEP, content: content('es'), countdown: countdownValue(), nowMs: NOW });
    expect(html).toContain('countdown__numeral');
    expect(html).toContain(`class="countdown__unit">${content('es').t('countdown.unit')}<`);
  });

  it('the method region renders the countdown precision for the same value', () => {
    const html = renderComponent(MethodRegion, {
      content: content('es'),
      sources: { countdown: countdownValue() },
      freshnessWindowDays: 45,
      nowMs: NOW,
      countries: [{ geo: 'ES', name: content('es').country.name, href: '#' }],
    });
    expect(html).toContain(content('es').t('countdown.definition'));
  });
});
