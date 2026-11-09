import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { CHROME_PATH, launchBrowser, type Browser, type BrowserPage } from '../helpers/chromium';
import { BUILD_PRESENT, routePath, startServedApp, type ServedApp } from '../helpers/served-app';
import { allPages } from '../helpers/story';

/**
 * AC-004-55…59 — no empty column at any width, in any locale (spec 004 T13).
 *
 * The defect was a two-track grid whose first track had no tenant, so the rule that prevents it
 * is a runtime measurement, not a spacing convention: every grid inside `<main>` with two or more
 * resolved tracks must have an in-flow child intersecting each track of 8px or more.
 */
const READY = BUILD_PRESENT && CHROME_PATH !== undefined;

const SCAN = `(() => {
  const wide = ['320','360','390','768','1024','1280','1366','1440'];
  const grids = [];
  const unoccupied = [];
  for (const el of document.querySelectorAll('main *')) {
    const style = getComputedStyle(el);
    if (style.display !== 'grid') continue;
    const tracks = style.gridTemplateColumns.split(' ').map((value) => parseFloat(value)).filter((value) => Number.isFinite(value));
    if (tracks.length < 2) continue;
    grids.push(el.className || el.tagName);
    const children = [...el.children].filter((child) => getComputedStyle(child).position !== 'absolute');
    let start = el.getBoundingClientRect().left;
    for (const width of tracks) {
      const end = start + width;
      if (width >= 8) {
        const occupied = children.some((child) => {
          const box = child.getBoundingClientRect();
          return box.right > start && box.left < end && box.width > 0;
        });
        if (!occupied) unoccupied.push({ grid: el.className || el.tagName, track: [start, end] });
      }
      start = end;
    }
  }
  return { grids: grids.length, unoccupied, scrollWidth: document.documentElement.scrollWidth, viewport: window.innerWidth };
})()`;

interface Scan {
  grids: number;
  unoccupied: { grid: string; track: [number, number] }[];
  scrollWidth: number;
  viewport: number;
}

describe.skipIf(!READY)('no unoccupied grid track', () => {
  let app: ServedApp;
  let browser: Browser;
  const pages: BrowserPage[] = [];

  beforeAll(async () => {
    app = await startServedApp();
    browser = await launchBrowser();
  });

  afterAll(async () => {
    for (const page of pages) await page.close();
    browser?.close();
    await app?.close();
  });

  async function scan(locale: Locale, width: number, height = 900): Promise<Scan> {
    const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, { width, height });
    pages.push(page);
    return page.evaluate<Scan>(SCAN);
  }

  it('AC-004-55: no track of 8px or more is unoccupied at 1440x900 in es', async () => {
    const result = await scan('es', 1440, 900);
    expect(result.grids).toBeGreaterThan(0);
    expect(result.unoccupied).toEqual([]);
  }, 60_000);

  it('AC-004-56: the count is zero at every measured width', async () => {
    for (const width of [320, 360, 390, 768, 1024, 1280, 1366, 1440]) {
      const result = await scan('es', width);
      expect(result.unoccupied, `width ${width} (${result.grids} grids scanned)`).toEqual([]);
    }
  }, 180_000);

  it('AC-004-57: the count is zero in all five locales', async () => {
    for (const locale of LOCALES) {
      for (const width of [390, 768, 1440]) {
        const result = await scan(locale, width);
        expect(result.unoccupied, `${locale} at ${width}`).toEqual([]);
      }
    }
  }, 180_000);

  it('AC-004-58: no horizontal overflow at the 320 floor', async () => {
    for (const locale of LOCALES) {
      const result = await scan(locale, 320);
      expect(result.scrollWidth, locale).toBeLessThanOrEqual(result.viewport);
    }
  }, 120_000);
});

/** One parsed CSS rule: its selector list and its declaration block, both comment-free. */
interface CssRule {
  selectors: string[];
  body: string;
  line: number;
}

function rulesOf(sheet: string): CssRule[] {
  const clean = sheet.replace(/\/\*[\s\S]*?\*\//g, (comment) => ' '.repeat(comment.length));
  return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: (match[1] ?? '')
      .split(',')
      .map((selector) => selector.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
    body: match[2] ?? '',
    line: clean.slice(0, match.index ?? 0).split('\n').length,
  }));
}

/** The explicit track count a `grid-template-columns` value declares, or 1 when it is unknown. */
function trackCount(value: string): number {
  const repeated = /repeat\(\s*(\d+)\s*,/.exec(value);
  if (repeated) return Number(repeated[1]);
  if (/minmax\(|min-content|max-content|auto|fr|px|rem|ch/.test(value) && !value.includes(' ')) return 1;
  return value.trim().split(/\s+(?![^(]*\))/).filter((token) => token !== '').length;
}

/** The class a selector finally targets: the last `.name` token in it. */
function targetClass(selector: string): string | null {
  const classes = [...selector.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((match) => match[1] ?? '');
  return classes.length === 0 ? null : (classes[classes.length - 1] ?? null);
}

/** The index just past the element that opens at `at`, matched by tag name. */
function endOfElement(html: string, at: number, tag: string): number {
  const pattern = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'g');
  pattern.lastIndex = at + 1;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    if (match[1] === '/') depth -= 1;
    else if (match[2] !== '/') depth += 1;
    if (depth === 0) return match.index + match[0].length;
  }
  return html.length;
}

/** How many element children the inner markup of one element has, nested ones excluded. */
function directChildCount(inner: string): number {
  let depth = 0;
  let count = 0;
  for (const match of inner.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g)) {
    if (match[1] === '/') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) count += 1;
    if (match[4] !== '/') depth += 1;
  }
  return count;
}

/** Whether an opening tag's attribute string carries `className` in its class list. */
function hasClass(attributes: string, className: string): boolean {
  const classAttribute = /class="([^"]*)"/.exec(attributes);
  return classAttribute !== null && (classAttribute[1] ?? '').split(/\s+/).includes(className);
}

/** The element-child count of every rendered element carrying `className`. */
function childCountsOf(html: string, className: string): number[] {
  const found: number[] = [];
  const open = /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  let match: RegExpExecArray | null;
  while ((match = open.exec(html)) !== null) {
    if (!hasClass(match[2] ?? '', className)) continue;
    const tag = match[1] ?? '';
    const end = endOfElement(html, match.index, tag);
    found.push(directChildCount(html.slice(match.index + match[0].length, end)));
  }
  return found;
}

/** One rule's rendered elements must each occupy every track it declares. */
function checkTrackOccupation(selector: string, tracks: number, counts: readonly number[]): void {
  for (const children of counts) {
    expect(children, `${selector} (${tracks} tracks) renders ${children} child(ren)`).toBeGreaterThanOrEqual(tracks);
  }
}

describe('AC-004-59: the retired shape cannot return structurally', () => {
  const SHEET = readFileSync('web/styles/globals.css', 'utf8');
  const RULES = rulesOf(SHEET);
  const PAGE = allPages();

  it('AC-004-59: no rule places a grid child into a track other than the first', () => {
    const placements: string[] = [];
    for (const rule of RULES) {
      for (const match of rule.body.matchAll(/grid-column:\s*([^;]+);/g)) {
        // `1 / -1` starts at the first track and spans them all; `auto` is the initial value.
        expect(match[1]?.trim(), `line ${rule.line}: ${rule.selectors.join(', ')}`).toMatch(/^(1 \/ -1|auto)$/);
        placements.push(rule.selectors.join(', '));
      }
      for (const match of rule.body.matchAll(/grid-(?:row|area):\s*([^;]+);/g)) {
        expect(match[1]?.trim(), `line ${rule.line}: ${rule.selectors.join(', ')}`).toBe('auto');
      }
    }
    // The retired shape was a per-child pin, so the assertion is on every pin in the sheet. Spec
    // 006 T11 deletes `.clock__field--days` with its row, so one pin remains (AC-004-59 re-point).
    expect(placements.sort()).toEqual(['.demography__panel-head']);
  });

  /** The selector/track/child-count record for one rule, for the multi-track grids only. */
  function occupied(rule: CssRule): string[] {
    const declaration = /grid-template-columns:\s*([^;]+);/.exec(rule.body)?.[1];
    if (declaration === undefined) return [];
    const tracks = trackCount(declaration);
    if (tracks < 2) return [];
    return rule.selectors.flatMap((selector) => {
      const className = targetClass(selector);
      if (className === null) return [];
      // The rule is only in scope where the page renders its element: a sheet rule for an element
      // this page does not render cannot leave a track empty on this page.
      const counts = childCountsOf(PAGE, className);
      checkTrackOccupation(selector, tracks, counts);
      return [`${selector}:${tracks}:${counts.length}`];
    });
  }

  it('AC-004-59: every multi-track grid’s element renders a child for each track', () => {
    const checked = RULES.flatMap(occupied);
    // Non-vacuity: the walk really found multi-track grids whose elements the page renders.
    expect(checked.filter((entry) => !entry.endsWith(':0')).length).toBeGreaterThanOrEqual(4);
  });

  it('AC-004-59: no rule moves content away from the first named area', () => {
    for (const rule of RULES) {
      const areas = /grid-template-areas:\s*([^;]+);/.exec(rule.body)?.[1];
      if (areas === undefined) continue;
      // A one-column area list is the only shape that cannot place content off track 1.
      for (const row of areas.match(/"([^"]*)"/g) ?? []) {
        expect(row.replace(/"/g, '').trim().split(/\s+/).length, `line ${rule.line}: ${row}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
