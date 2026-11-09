import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import {
  countdownAt,
  countdownSeries,
  countdownValue,
  pyramidSeries,
  seriesFixtures,
  unavailableSeries,
} from '../fixtures/series';
import { numberSentence } from '../helpers/story';
import { decodeText } from '../helpers/render-document';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const NOW = Date.parse('2026-10-31T10:00:00Z');

function page(series: readonly DerivedSeries[] = seriesFixtures(), locale: Locale = 'es', nowMs = NOW): string {
  const props = {
    content: content(locale),
    figures: [dependencyFigure(), shareFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series,
    now: new Date(nowMs),
  } as const;
  return (
    renderComponent(PublicPage, { ...props, pageKind: 'historia' }) +
    renderComponent(PublicPage, { ...props, pageKind: 'metodo' })
  );
}

/** Step 1's own markup: from its opening tag to the start of step 2. */
function numberStepOf(html: string): string {
  const start = html.indexOf('data-top-step="number"');
  const end = html.indexOf('data-top-step="breakage"');
  return start === -1 || end === -1 ? '' : html.slice(start, end);
}

/** The method region: from `id="metodo"` to the page's closing pager. */
function methodOf(html: string): string {
  const start = html.indexOf('id="metodo"');
  const end = html.indexOf('class="pager"', start === -1 ? 0 : start);
  return start === -1 || end === -1 ? '' : html.slice(start, end);
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
    // Clause-level re-point (spec 006 T10, §4.2): the `5ch` reservation is dropped because with the
    // unit on the same line it measures 40.23 px of ink gap and pushes the numeral's union 14.11 px
    // off the axis. The token keeps its value; nothing places with it (AC-006-01, AC-006-03).
    expect(CSS).not.toMatch(/\.clock__value--days\s*\{[^}]*min-inline-size:\s*var\(--clock-days-min\)/s);
    expect(TOKENS).toMatch(/--clock-days-min:\s*5ch;/);
  });
});

describe('AC-003-03: the day numeral is the largest numeral on the page', () => {
  it('AC-003-03: no plate numeral competes with the day count', () => {
    // Clause-level re-point (spec 006 T11, §4.2): the years numeral leaves the story, so its
    // step-down rule on the ladder has no user and is asserted by nothing. The invariant — no
    // numeral larger than the day count — is AC-006-12's and the browser measurement's.
    const html = page();
    expect(html).not.toContain('hero__value');
    expect(CSS).not.toContain('.hero__value');
    expect(html).not.toContain('countdown__numeral');
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

describe('the number group’s own copy', () => {
  it('names the target date once, in step 1’s sentence', () => {
    for (const locale of LOCALES) {
      const step = decodeText(numberStepOf(page(seriesFixtures(), locale)));
      expect(step, locale).toContain(numberSentence(locale));
    }
  });

  it('renders no footnote: no definition, range, source, back-cast or year label', () => {
    const step = numberStepOf(page());
    for (const marker of ['countdown__definition', 'countdown__range', 'countdown__source', 'countdown__backcast', 'countdown__year-line']) {
      expect(step, marker).not.toContain(marker);
    }
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
