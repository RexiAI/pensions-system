/**
 * @vitest-environment jsdom
 */
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareRow } from '../../web/components/share/ShareRow';
import type { ShareRowProps, ShareStrings } from '../../web/components/share/ShareRow';
import { formatYear, integerFormatter } from '../../web/content/format';
import { canonicalUrl } from '../../web/content/site';
import type { CountryLocaleContent, Locale } from '../../web/content/types';
import { publicPathFor } from '../../web/seo/routes';
import { readClock } from '../../web/series/clock';
import { DAYS_PLACEHOLDER, messageAt, shareHref } from '../../web/share/links';
import { content } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';

/**
 * The share row's client behaviour, mounted in a DOM (spec 003 T3). These are the scenarios that
 * used to be asserted by scanning the component's own source text for the expressions they hoped
 * to find — an assertion that cannot fail when the behaviour is wrong, and that made both
 * components unmeasurable by Stryker (a reprint removes the literal it looked for).
 *
 * Everything here is observed the way a reader or the browser API observes it: the controls that
 * exist after hydration, the payload handed to `navigator.share`, what reaches the clipboard, the
 * text on screen, and the `href` a link carries at the click instant.
 *
 * The server-side half of the same scenarios — the no-JS markup, which has no native control and
 * no live region — stays in `share.test.ts`, where it is rendered without a browser.
 */
const NOW = Date.parse('2026-10-31T10:00:00Z');
const DAY_MS = 86_400_000;
const CLICK = NOW + DAY_MS;
const CONFIRMATION_MS = 2000;

const nav = navigator as unknown as Record<string, unknown>;
const mounted: Root[] = [];

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function shareStrings(local: CountryLocaleContent): ShareStrings {
  return {
    label: local.t('share.label'),
    native: local.t('share.native'),
    copy: local.t('share.copy'),
    copied: local.t('share.copied'),
    linkLabel: local.t('share.linkLabel'),
    newWindow: local.t('share.newWindow'),
    networks: {
      whatsapp: local.t('share.whatsapp'),
      telegram: local.t('share.telegram'),
      x: local.t('share.x'),
      linkedin: local.t('share.linkedin'),
    },
  };
}

/** The props `StoryStrip` hands the share row: the same templates, anchor and canonical URL. */
function shareProps(locale: Locale = 'es'): ShareRowProps {
  const local = content(locale);
  const countdown = countdownValue();
  const year = formatYear(countdown.thresholdYear ?? 0, locale);
  const url = canonicalUrl(publicPathFor(locale));
  return {
    url,
    anchor: countdown.anchor ?? '',
    locale,
    withDays: local.t('share.text', { year, url, days: DAYS_PLACEHOLDER }),
    withoutDays: local.t('share.textNoJs', { year, url }),
    strings: shareStrings(local),
  };
}

/** The message the row should build at an instant: the component's own contract, not a copy of it. */
function messageFor(props: ShareRowProps, nowMs: number): string {
  const templates = { withDays: props.withDays, withoutDays: props.withoutDays };
  return messageAt(templates, props.anchor, nowMs, integerFormatter(props.locale));
}

interface Mounted {
  container: HTMLElement;
  /** Re-renders the same root, the way a parent re-render reaches the row. */
  rerender(element: ReactElement): Promise<void>;
}

async function render(element: ReactElement): Promise<Mounted> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push(root);
  const rerender = async (next: ReactElement): Promise<void> => {
    await act(async () => {
      root.render(next);
    });
  };
  await rerender(element);
  return { container, rerender };
}

async function click(element: Element): Promise<void> {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function controls(container: HTMLElement): { buttons: HTMLButtonElement[]; links: HTMLAnchorElement[] } {
  return {
    buttons: [...container.querySelectorAll('button')],
    links: [...container.querySelectorAll<HTMLAnchorElement>('.share a')],
  };
}

function stubApi(field: 'share' | 'clipboard', value: unknown): void {
  Object.defineProperty(nav, field, { value, configurable: true, writable: true });
}

let nowSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  nowSpy = vi.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(async () => {
  for (const root of mounted.splice(0)) {
    await act(async () => {
      root.unmount();
    });
  }
  document.body.replaceChildren();
  delete nav.share;
  delete nav.clipboard;
  vi.restoreAllMocks();
});

describe('AC-003-27: the native share control exists only where navigator.share does', () => {
  it('AC-003-27: hydrated without navigator.share, the row has no native control and no native label', async () => {
    const props = shareProps();
    const { container } = await render(createElement(ShareRow, props));
    const { buttons } = controls(container);
    // The copy control is the only button: the native one is not rendered, not merely hidden.
    expect(buttons).toHaveLength(1);
    expect(container.textContent).not.toContain(props.strings.native);
  });

  it('AC-003-27: with navigator.share, a labelled native control appears and sends the click-instant message and the canonical URL', async () => {
    const share = vi.fn((_data: { text: string; url: string }) => Promise.resolve());
    stubApi('share', share);
    const props = shareProps();
    const { container } = await render(createElement(ShareRow, props));
    const { buttons } = controls(container);
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toBe(props.strings.native);

    nowSpy.mockReturnValue(CLICK);
    await click(buttons[0] as HTMLButtonElement);

    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith({ text: messageFor(props, CLICK), url: props.url });
    // The click instant's day count, not the render instant's, and never the placeholder.
    const sent = share.mock.calls[0]?.[0] as { text: string };
    expect(sent.text).not.toBe(messageFor(props, NOW));
    expect(sent.text).not.toContain(DAYS_PLACEHOLDER);
    const days = integerFormatter(props.locale)(readClock(props.anchor, CLICK).days);
    expect(sent.text).toContain(days);
  });
});

describe('AC-003-25: the click-time day count is formatted in the row’s own locale', () => {
  it('AC-003-25: the message follows the locale it is given, not the one it first rendered with', async () => {
    const share = vi.fn((_data: { text: string; url: string }) => Promise.resolve());
    stubApi('share', share);
    const es = shareProps('es');
    const en = shareProps('en');
    const { container, rerender } = await render(createElement(ShareRow, es));
    const days = readClock(es.anchor, CLICK).days;
    const inEs = integerFormatter('es')(days);
    const inEn = integerFormatter('en')(days);
    // Makes the assertion below mean something: the two locales really do write this number
    // differently, so a formatter frozen at the first render cannot satisfy both.
    expect(inEs).not.toBe(inEn);

    nowSpy.mockReturnValue(CLICK);
    await click(controls(container).buttons[0] as HTMLButtonElement);
    await rerender(createElement(ShareRow, en));
    await click(controls(container).buttons[0] as HTMLButtonElement);

    const [first, second] = share.mock.calls.map(([data]) => data);
    expect(first?.text).toBe(messageFor(es, CLICK));
    expect(first?.text).toContain(inEs);
    expect(second).toEqual({ text: messageFor(en, CLICK), url: en.url });
    expect(second?.text).toContain(inEn);
  });
});

describe('AC-003-28: the copy control writes the canonical URL and confirms', () => {
  it('AC-003-28: with no Clipboard API, the click brings back the labelled URL field, focused and fully selected', async () => {
    const props = shareProps();
    const { container } = await render(createElement(ShareRow, props));
    expect(nav.clipboard).toBeUndefined();
    await click(controls(container).buttons[0] as HTMLButtonElement);

    const field = container.querySelector<HTMLInputElement>('input.share__url');
    expect(field).not.toBeNull();
    expect(field?.value).toBe(props.url);
    expect(container.textContent).toContain(props.strings.linkLabel);
    expect(controls(container).buttons).toHaveLength(0);
    // The reader is placed in the field with the whole URL selected, so a manual copy is one key.
    expect(document.activeElement).toBe(field);
    expect(field?.selectionStart).toBe(0);
    expect(field?.selectionEnd).toBe(props.url.length);
  });

  it('AC-003-28: with a Clipboard API, the click writes the URL and announces the locale confirmation', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubApi('clipboard', { writeText });
    const props = shareProps('en');
    const { container } = await render(createElement(ShareRow, props));
    const button = controls(container).buttons[0] as HTMLButtonElement;
    expect(button.textContent).toBe(props.strings.copy);

    await click(button);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(props.url);
    expect(button.textContent).toBe(props.strings.copied);
    expect(container.querySelector('[role="status"]')?.textContent).toBe(props.strings.copied);
  });

  it('AC-003-28: the confirmation is a live status region that clears itself, leaving the idle label', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubApi('clipboard', { writeText });
    const props = shareProps();
    const { container } = await render(createElement(ShareRow, props));
    const timeouts: { handler: TimerHandler; delay: number }[] = [];
    vi.spyOn(window, 'setTimeout').mockImplementation(((handler: TimerHandler, delay?: number) => {
      timeouts.push({ handler, delay: delay ?? 0 });
      return 0;
    }) as typeof window.setTimeout);

    const button = controls(container).buttons[0] as HTMLButtonElement;
    await click(button);
    expect(container.querySelector('[role="status"]')?.textContent).toBe(props.strings.copied);
    expect(timeouts).toHaveLength(1);
    expect(timeouts[0]?.delay).toBe(CONFIRMATION_MS);

    await act(async () => {
      (timeouts[0]?.handler as () => void)();
    });
    expect(button.textContent).toBe(props.strings.copy);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
  });

  it('AC-003-28: a rejected write falls back to the field instead of claiming a copy', async () => {
    const writeText = vi.fn(() => Promise.reject(new Error('denied')));
    stubApi('clipboard', { writeText });
    const props = shareProps();
    const { container } = await render(createElement(ShareRow, props));
    await click(controls(container).buttons[0] as HTMLButtonElement);

    expect(writeText).toHaveBeenCalledWith(props.url);
    expect(container.querySelector<HTMLInputElement>('input.share__url')?.value).toBe(props.url);
    // Nothing claims a copy happened: the field comes back and no announcement is made.
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.textContent).not.toContain(props.strings.copied);
  });
});

describe('AC-003-31: a link retargets its own href; the navigation stays the browser’s', () => {
  it('AC-003-31: clicking a network link rewrites only that link, to the click-instant share URL, without cancelling the navigation', async () => {
    const props = shareProps();
    const { container } = await render(createElement(ShareRow, props));
    const { links } = controls(container);
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link.target).toBe('_blank');
      expect(link.rel).toBe('noopener noreferrer');
    }

    const opened = vi.spyOn(window, 'open').mockReturnValue(null);
    const prevented: boolean[] = [];
    // A window-level bubble listener sees the event after React's handler has run and before
    // jsdom's own navigation: it records whether the page cancelled the navigation, then cancels
    // it so the test does not try to reach the network.
    const watch = (event: MouseEvent): void => {
      prevented.push(event.defaultPrevented);
      event.preventDefault();
    };
    window.addEventListener('click', watch);
    nowSpy.mockReturnValue(CLICK);
    await act(async () => {
      (links[0] as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    window.removeEventListener('click', watch);

    expect(prevented).toEqual([false]);
    expect(opened).not.toHaveBeenCalled();
    expect((links[0] as HTMLAnchorElement).href).toBe(shareHref('whatsapp', messageFor(props, CLICK), props.url));
    // The other three keep the server's year-led target: the click retargets its own link only.
    expect((links[1] as HTMLAnchorElement).href).toBe(shareHref('telegram', props.withoutDays, props.url));
  });
});
