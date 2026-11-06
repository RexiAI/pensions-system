/**
 * @vitest-environment jsdom
 */
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoryStrip } from '../../web/components/public/StoryStrip';
import { integerFormatter } from '../../web/content/format';
import { canonicalUrl } from '../../web/content/site';
import { publicPathFor } from '../../web/seo/routes';
import { readClock } from '../../web/series/clock';
import { DAYS_PLACEHOLDER, messageAt } from '../../web/share/links';
import { content } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';

/**
 * Mutation-killing tests for spec 004 (stage 5a), mounted in a DOM.
 *
 * One surface cannot be observed from a rendered string: the share row's click-time `href`.
 * Stryker reported an unkilled mutant on the anchor's `??` in `StoryStrip.tsx` for exactly that
 * reason — the server markup is correct while the client half is never executed by a
 * `renderToStaticMarkup` test.
 *
 * The clock's client tick used to live here too; spec 006 T12 deletes the client component and
 * its ticker, so there is no timer left to mount.
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

afterEach(async () => {
  for (const root of mounted.splice(0)) {
    await act(async () => root.unmount());
  }
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
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
