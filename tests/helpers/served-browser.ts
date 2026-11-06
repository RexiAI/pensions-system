import { CHROME_PATH, launchBrowser, type BrowserPage } from './chromium';
import { BUILD_PRESENT, routePath, startServedApp } from './served-app';
import type { Locale } from '../../web/content/types';

/**
 * A served app plus a real Chromium, for the spec-006 layout criteria.
 *
 * The pipeline's measurement contract (`10-tasks.md` §2) is stated in `getBoundingClientRect`,
 * `getComputedStyle` and per-text-node `Range.getClientRects`; a string assertion cannot reach it.
 * Each file that needs a live page starts one app and one browser through here, so the boot and
 * teardown are written once.
 */
export const BROWSER_READY = BUILD_PRESENT && CHROME_PATH !== undefined;

export interface Viewport {
  width: number;
  height: number;
}

/** The three viewports the suite already uses (contract §2.10). */
export const MATRIX: readonly Viewport[] = [
  { width: 390, height: 844 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
];

/** The eight-width sweep AC-004-56 walks (contract §2.10): height 900 except 390's 844. */
export const SWEEP = [
  { width: 320, height: 900 },
  { width: 360, height: 900 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1366, height: 900 },
  { width: 1440, height: 900 },
] as const;

export interface ServedBrowser {
  baseUrl: string;
  open(locale: Locale, viewport: Viewport): Promise<BrowserPage>;
  /** Open one route at one viewport, evaluate one expression, and keep the page for teardown. */
  measure<T>(locale: Locale, viewport: Viewport, expression: string): Promise<T>;
  close(): Promise<void>;
}

export async function startServedBrowser(): Promise<ServedBrowser> {
  const app = await startServedApp();
  const browser = await launchBrowser();
  const pages: BrowserPage[] = [];
  const open = async (locale: Locale, viewport: Viewport): Promise<BrowserPage> => {
    const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, viewport);
    pages.push(page);
    return page;
  };
  return {
    baseUrl: app.baseUrl,
    open,
    async measure<T>(locale: Locale, viewport: Viewport, expression: string): Promise<T> {
      const page = await open(locale, viewport);
      return page.evaluate<T>(expression);
    },
    async close(): Promise<void> {
      // Pages close concurrently. Closing 15 pages with one CDP round trip each, serially, was a
      // measurable share of the `afterAll` cost the 10 s hook budget could not absorb.
      await Promise.all(pages.map((page) => page.close()));
      browser.close();
      await app.close();
    },
  };
}

/**
 * The contract's "rendered" and "above the fold" predicates (§2.1, §2.2), as browser-side source.
 * A closed `<details>` is excluded except for its *own* `<summary>`: the trigger is painted,
 * focusable and a real target; the panel's contents are not.
 */
export const DOM_PREAMBLE = `
const rendered = (el) => {
  if (!el || el.getClientRects().length === 0) return false;
  const closed = el.closest('details:not([open])');
  if (!closed) return true;
  const summary = closed.querySelector(':scope > summary');
  return !!summary && (summary === el || summary.contains(el));
};
const aboveFold = (el) => {
  if (!rendered(el)) return false;
  const box = el.getBoundingClientRect();
  return box.top < window.innerHeight && box.bottom > 0;
};
const INTERACTIVE = 'a[href], button, summary, input, select, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]';
/* Contract §2.3: at least one direct text child with non-empty text, and no child element that
   itself carries text. */
const isLeaf = (el) => {
  const own = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent || '').trim() !== '');
  if (!own) return false;
  return ![...el.children].some((child) => (child.textContent || '').trim() !== '');
};
const leavesAboveFold = () => [...document.querySelectorAll('main *, header *, body > *')].filter(
  (el) => aboveFold(el) && isLeaf(el),
);
/* Contract §2.4: ink extent is the union of per-text-node Range rects, keeping rects wider than 1px. */
const inkOf = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const rects = [];
  let node = walker.nextNode();
  while (node) {
    if ((node.textContent || '').trim() !== '') {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 1) rects.push(rect);
    }
    node = walker.nextNode();
  }
  if (rects.length === 0) return null;
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return { left, right, top, bottom, width: right - left, centre: (left + right) / 2 };
};
/* The rendered set for the ink pass: the contract excludes the closed details panel's contents but
   keeps its summary, which carries no text leaf. */
const visible = (el) => rendered(el);
`;
