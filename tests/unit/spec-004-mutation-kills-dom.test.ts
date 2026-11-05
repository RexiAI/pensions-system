/**
 * @vitest-environment jsdom
 */
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountdownClock } from '../../web/components/series/CountdownClock';
import { StoryStrip } from '../../web/components/public/StoryStrip';
import { integerFormatter } from '../../web/content/format';
import { canonicalUrl } from '../../web/content/site';
import type { CountryLocaleContent } from '../../web/content/types';
import { publicPathFor } from '../../web/seo/routes';
import { readClock } from '../../web/series/clock';
import { DAYS_PLACEHOLDER, messageAt } from '../../web/share/links';
import { content } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';

/**
 * Mutation-killing tests for spec 004 (stage 5a), mounted in a DOM.
 *
 * Two surfaces cannot be observed from a rendered string: the clock's client tick (a
 * `useLayoutEffect` that writes four fields through refs) and the share row's click-time
 * `href`. Stryker reported 16 unkilled mutants in `CountdownClock.tsx` and the anchor's
 * `??` in `StoryStrip.tsx` for exactly that reason — the server markup is correct while the
 * client half is never executed by a `renderToStaticMarkup` test.
 */
const NOW = Date.parse('2026-10-31T10:00:00Z');
const DAY_MS = 86_400_000;
const CLICK = NOW + 3 * DAY_MS;

const ES = content('es');
const COUNTDOWN = countdownValue();
const ANCHOR = COUNTDOWN.anchor ?? '';

const mounted: Root[] = [];

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function render(element: ReactElement): Promise<{ container: HTMLElement; rerender: (next: ReactElement) => Promise<void> }> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push(root);
  const rerender = async (next: ReactElement): Promise<void> => {
    await act(async () => root.render(next));
  };
  await rerender(element);
  return { container, rerender };
}

function clockProps(locale: CountryLocaleContent['locale'], nowMs: number, anchor = ANCHOR) {
  return {
    anchor,
    nowMs,
    locale,
    strings: {
      a11y: ES.t('countdown.clock.a11y', { date: '1 de enero de 2042' }),
      days: ES.t('countdown.clock.days'),
      hours: ES.t('countdown.clock.hours'),
      minutes: ES.t('countdown.clock.minutes'),
      seconds: ES.t('countdown.clock.seconds'),
    },
    years: '16',
    yearsUnit: ES.t('countdown.unit'),
  };
}

function daysText(container: HTMLElement): string {
  return container.querySelector('.clock__value--days')?.textContent ?? '';
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(async () => {
  for (const root of mounted.splice(0)) {
    await act(async () => root.unmount());
  }
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('CountdownClock: the client tick', () => {
  /**
   * Kills the L54, L76, L77, L78, L84, L86, L89, L161 survivors: nothing else in the suite
   * executes the layout effect, so every way of emptying it left the server markup green.
   */
  it('rewrites the four fields from the device clock before paint', async () => {
    // The server's reading is five days stale, which is what the effect exists to correct.
    const { container } = await render(createElement(CountdownClock, clockProps('es', NOW - 5 * DAY_MS)));
    expect(daysText(container)).toBe(integerFormatter('es')(readClock(ANCHOR, NOW).days));
    expect(daysText(container)).not.toBe(integerFormatter('es')(readClock(ANCHOR, NOW - 5 * DAY_MS).days));
    const subs = [...container.querySelectorAll('.clock__value--sub')].map((node) => node.textContent ?? '');
    const reading = readClock(ANCHOR, NOW);
    expect(subs).toEqual([
      String(reading.hours).padStart(2, '0'),
      String(reading.minutes).padStart(2, '0'),
      String(reading.seconds).padStart(2, '0'),
    ]);
  });

  /** Kills the L91 survivor: the interval is cleared on unmount, not left running. */
  it('runs one interval while mounted and clears it on unmount', async () => {
    const { container } = await render(createElement(CountdownClock, clockProps('es', NOW)));
    expect(vi.getTimerCount()).toBe(1);
    expect(container.querySelector('.clock')?.getAttribute('data-clock-state')).toBe('running');
    await act(async () => {
      mounted.splice(0).forEach((root) => root.unmount());
    });
    expect(vi.getTimerCount()).toBe(0);
    document.body.replaceChildren();
  });

  /** Kills the L94 survivor: a new anchor re-subscribes instead of keeping the first one. */
  it('re-reads the clock when the anchor changes', async () => {
    const { container, rerender } = await render(createElement(CountdownClock, clockProps('es', NOW - 5 * DAY_MS)));
    const next = '2043-01-01T00:00:00+01:00';
    await rerender(createElement(CountdownClock, clockProps('es', NOW - 5 * DAY_MS, next)));
    expect(daysText(container)).toBe(integerFormatter('es')(readClock(next, NOW).days));
  });

  /** Kills the L159 survivor: the day formatter follows the locale it was resolved for. */
  it('reformats the day count when the locale changes', async () => {
    const { container, rerender } = await render(createElement(CountdownClock, clockProps('es', NOW)));
    expect(daysText(container)).toBe(integerFormatter('es')(readClock(ANCHOR, NOW).days));
    await rerender(createElement(CountdownClock, clockProps('en', NOW)));
    expect(daysText(container)).toBe(integerFormatter('en')(readClock(ANCHOR, NOW).days));
    // The two locales really differ for this magnitude, so the assertion above can fail.
    expect(integerFormatter('en')(readClock(ANCHOR, NOW).days)).not.toBe(integerFormatter('es')(readClock(ANCHOR, NOW).days));
  });

  /** The elapsed state is the other half of `data-clock-state`, and it starts no timer. */
  it('states an elapsed clock and starts no interval once the anchor has passed', async () => {
    const past = '2020-01-01T00:00:00+01:00';
    const { container } = await render(createElement(CountdownClock, clockProps('es', NOW, past)));
    expect(container.querySelector('.clock')?.getAttribute('data-clock-state')).toBe('elapsed');
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('StoryStrip: the share row gets the countdown’s own anchor', () => {
  /**
   * Kills the L54:15 survivor (`anchor ?? ''` mutated to `anchor && ''`). The anchor is only
   * read when a control is clicked, so the rendered `href` — which carries the year-led
   * message — cannot see it.
   */
  it('builds the click-time href against the countdown’s anchor, day count included', async () => {
    const { container } = await render(createElement(StoryStrip, { content: ES, countdown: COUNTDOWN }));
    const link = container.querySelector<HTMLAnchorElement>('.share a[target="_blank"]');
    expect(link).not.toBeNull();
    expect(link?.href).not.toContain(String(readClock(ANCHOR, CLICK).days));

    // The click instant is what the day count is read against, so move the device clock there.
    vi.spyOn(Date, 'now').mockReturnValue(CLICK);
    await act(async () => {
      link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    const url = canonicalUrl(publicPathFor('es'));
    const year = String(COUNTDOWN.thresholdYear);
    const expected = messageAt(
      {
        withDays: ES.t('share.text', { year, url, days: DAYS_PLACEHOLDER }),
        withoutDays: ES.t('share.textNoJs', { year, url }),
      },
      ANCHOR,
      CLICK,
      integerFormatter('es'),
    );
    expect(link?.href).toContain(String(readClock(ANCHOR, CLICK).days));
    expect(decodeURIComponent(link?.href ?? '')).toContain(expected);
  });
});
