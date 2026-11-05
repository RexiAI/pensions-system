import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { countdownAt, countdownSeries, pyramidSeries } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

/**
 * Spec 002's clock-merge criteria (nine through twelve) are retired with the band: they asserted a
 * separation and a centring inside one 477px panel, and spec 004 removes both the panel and the
 * centred face. What survives is the integrity of the group itself (`AC-002-13`, `AC-002-14`),
 * re-pointed at step 1.
 */
const NOW = Date.parse('2041-12-28T20:57:55Z');

function page(series: readonly DerivedSeries[], locale: Locale = 'es'): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures: [dependencyFigure(), shareFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series,
    now: new Date(NOW),
  });
}

/** The clock group's own subtree: from its opening tag to the end of the step that holds it. */
function clockRegion(html: string): string {
  const at = html.indexOf('<div class="clock"');
  const end = html.indexOf('class="step__sentence"', at === -1 ? 0 : at);
  return at === -1 || end === -1 ? '' : html.slice(at, end);
}

describe('AC-002-13: “no anchor, no clock” still holds', () => {
  it('AC-002-13: the not-crossed state renders no years numeral and no clock', () => {
    const html = page([pyramidSeries(), { ...countdownSeries(), value: countdownAt(90) }]);
    expect(html).not.toContain('class="clock"');
    expect(html).not.toContain('countdown__numeral');
    expect(html).toContain(content('es').t('countdown.notCrossed', { year: 2100 }));
  });

  it('AC-002-13: the computed state renders both, as one group', () => {
    const clock = clockRegion(page([pyramidSeries(), countdownSeries()]));
    expect(clock).toContain('class="clock"');
    expect(clock).toContain('countdown__numeral');
    expect(clock).toContain('clock__fields');
    expect(clock.indexOf('countdown__numeral')).toBeLessThan(clock.indexOf('clock__fields'));
  });
});

describe('AC-002-14: the integrity invariants are preserved', () => {
  it('AC-002-14: the anchor date stays visible text, in every locale', () => {
    for (const locale of LOCALES) {
      const html = decodeText(page([pyramidSeries(), countdownSeries()], locale));
      const method = html.slice(html.indexOf('id="metodo"'));
      expect(method, locale).toContain('2042');
      expect(method, locale).toContain(content(locale).t('countdown.clock.anchorLabel'));
    }
  });

  it('AC-002-14: the clock never states the threshold has been crossed', () => {
    for (const locale of LOCALES) {
      const clock = clockRegion(page([pyramidSeries(), countdownSeries()], locale));
      expect(clock, locale).not.toMatch(/cruza|cruz|alcanza|alcanz|valid|supera|corrobor|cross|reaches|atteint|erreicht|raggiunge/i);
    }
  });

  it('AC-002-14: the clock is server-rendered complete and owns no React state', () => {
    const clock = decodeText(clockRegion(page([pyramidSeries(), countdownSeries()])));
    expect(clock).toContain('clock__value--days');
    expect(clock.split('clock__field--sub').length - 1).toBe(3);
    const source = readFileSync('web/components/series/CountdownClock.tsx', 'utf8');
    expect(source).not.toContain('useState');
    expect(source.split('startClockTicker(').length - 1).toBe(1);
  });

  it('AC-002-14: the years quantity keeps its unit and carries no sub-annual unit', () => {
    const clock = decodeText(clockRegion(page([pyramidSeries(), countdownSeries()])));
    const years = clock.slice(clock.indexOf('countdown__value'), clock.indexOf('clock__fields'));
    expect(years).toContain(`>${content('es').t('countdown.unit')}<`);
    for (const key of ['countdown.clock.days', 'countdown.clock.hours', 'countdown.clock.minutes'] as const) {
      expect(years).not.toContain(content('es').t(key));
    }
  });

  it('AC-002-14: the day and sub-day fields keep their labels, in every locale', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const clock = clockRegion(page([pyramidSeries(), countdownSeries()], locale));
      for (const key of ['countdown.clock.days', 'countdown.clock.hours', 'countdown.clock.minutes', 'countdown.clock.seconds'] as const) {
        expect(clock, `${locale}/${key}`).toContain(local.t(key));
      }
    }
  });
});

