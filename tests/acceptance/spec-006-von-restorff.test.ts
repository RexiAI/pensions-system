import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-10…13 — Von Restorff has one winner (Task 5). The numeral is the one element that
 * differs, by hue and by size; no ground competes above the fold and the current locale is marked
 * without colour.
 */
const SCENE = `(() => {
  ${DOM_PREAMBLE}
  const channel = (value) => {
    const match = value.match(/rgba?\\(([^)]+)\\)/);
    if (!match) return null;
    const parts = match[1].split(',').map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
  };
  const transparent = (colour) => colour === null || colour.a === 0;
  const nearestPainted = (el) => {
    let parent = el.parentElement;
    while (parent) {
      const colour = channel(getComputedStyle(parent).backgroundColor);
      if (!transparent(colour)) return colour;
      parent = parent.parentElement;
    }
    return null;
  };
  const grounds = [];
  for (const el of document.querySelectorAll('header *, main *')) {
    if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
    if (!aboveFold(el)) continue;
    const colour = channel(getComputedStyle(el).backgroundColor);
    if (transparent(colour)) continue;
    const ground = nearestPainted(el);
    const same = ground && ground.r === colour.r && ground.g === colour.g && ground.b === colour.b;
    if (same) continue;
    const box = el.getBoundingClientRect();
    if (box.width * box.height < 1024) continue;
    grounds.push({ cls: el.className, area: box.width * box.height });
  }
  const leaves = leavesAboveFold().map((el) => ({
    cls: el.className,
    colour: getComputedStyle(el).color,
    size: parseFloat(getComputedStyle(el).fontSize),
    text: (el.textContent || '').trim().slice(0, 24),
  }));
  // AC-006-10: a thick border or a shadow is the competing rectangle by another channel.
  const thickBorders = [];
  const shadows = [];
  for (const el of document.querySelectorAll('header *, main *')) {
    if (!aboveFold(el)) continue;
    const style = getComputedStyle(el);
    if (style.boxShadow !== 'none') shadows.push(String(el.className));
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const width = parseFloat(style['border' + side + 'Width']);
      const colour = style['border' + side + 'Color'];
      const painted = colour !== 'rgba(0, 0, 0, 0)' && colour !== 'transparent';
      if (width >= 2 && painted) {
        thickBorders.push({ cls: String(el.className), side, width, colour });
        break;
      }
    }
  }
  const numeral = document.querySelector('[data-top-step="number"] .clock__value--days');
  const h1 = document.querySelector('[data-top-step="number"] h1');
  const cells = [...document.querySelectorAll('.locale-group__cell')].map((el) => {
    const style = getComputedStyle(el);
    return {
      current: el.getAttribute('aria-current'),
      background: style.backgroundColor,
      weight: style.fontWeight,
      decoration: style.textDecorationLine,
      borders: Object.fromEntries(['Top', 'Right', 'Bottom', 'Left'].map((side) => [
        side.toLowerCase(),
        {
          painted: style['border' + side + 'Style'] !== 'none' && parseFloat(style['border' + side + 'Width']) > 0,
          colour: style['border' + side + 'Color'],
        },
      ])),
    };
  });
  return {
    grounds,
    thickBorders,
    shadows,
    leaves,
    accent: numeral ? getComputedStyle(numeral).color : null,
    numeralSize: numeral ? parseFloat(getComputedStyle(numeral).fontSize) : 0,
    h1Size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
    ink: {
      one: h1 ? getComputedStyle(h1).color : null,
      two: getComputedStyle(document.querySelector('[data-top-step="number"] .step__sentence')).color,
      three: getComputedStyle(document.querySelector('[data-top-step="number"] .step__label')).color,
    },
    cells,
  };
})()`;

interface Leaf {
  cls: string;
  colour: string;
  size: number;
  text: string;
}

interface Cell {
  current: string | null;
  background: string;
  weight: string;
  decoration: string;
  borders: Record<string, { painted: boolean; colour: string }>;
}

interface Scene {
  grounds: { cls: string; area: number }[];
  thickBorders: { cls: string; side: string; width: number; colour: string }[];
  shadows: string[];
  leaves: Leaf[];
  accent: string | null;
  numeralSize: number;
  h1Size: number;
  ink: { one: string | null; two: string | null; three: string | null };
  cells: Cell[];
}

/** A rough relative luminance, enough to separate a near-white surface from a dark ink. */
function dark(value: string): boolean {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return false;
  const [r, g, b] = match[1].split(',').map(Number) as [number, number, number];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.6;
}

describe.skipIf(!BROWSER_READY)('one distinct element above the fold', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-10: no element above the fold paints a competing ground, thick border or shadow', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const scene = await served.measure<Scene>(locale, viewport, SCENE);
        expect(scene.grounds, `${locale} ${viewport.width}: grounds`).toEqual([]);
        expect(scene.thickBorders, `${locale} ${viewport.width}: borders ≥ 2px`).toEqual([]);
        expect(scene.shadows, `${locale} ${viewport.width}: shadows`).toEqual([]);
      }
    }
  }, 300_000);

  it('AC-006-11: exactly one text leaf carries the accent, and it is the numeral', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const scene = await served.measure<Scene>(locale, viewport, SCENE);
        const accentLeaves = scene.leaves.filter((leaf) => leaf.colour === scene.accent);
        expect(accentLeaves.length, `${locale} ${viewport.width}: accent leaves`).toBe(1);
        expect(accentLeaves[0]?.cls, `${locale} ${viewport.width}: the numeral`).toContain('clock__value--days');
        const inks = new Set([scene.ink.one, scene.ink.two, scene.ink.three]);
        for (const leaf of scene.leaves) {
          if (leaf.colour === scene.accent) continue;
          expect(inks.has(leaf.colour), `${locale} ${viewport.width}: ${leaf.cls} "${leaf.text}" is ink`).toBe(true);
          // No leaf resolves a surface colour: a near-white text colour would be invisible.
          expect(dark(leaf.colour), `${locale} ${viewport.width}: ${leaf.cls} "${leaf.text}"`).toBe(true);
        }
      }
    }
  }, 300_000);

  it('AC-006-12: the numeral is the only element distinguished by size', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const scene = await served.measure<Scene>(locale, viewport, SCENE);
        const largest = Math.max(...scene.leaves.map((leaf) => leaf.size));
        expect(scene.numeralSize, `${locale} ${viewport.width}: numeral`).toBe(largest);
        expect(scene.leaves.filter((leaf) => leaf.size === largest).length, `${locale} ${viewport.width}`).toBe(1);
        expect(scene.numeralSize, `${locale} ${viewport.width}: > h1`).toBeGreaterThan(scene.h1Size);
      }
    }
  }, 300_000);

  it('AC-006-13: the current locale is marked, without a ground or a colour', async () => {
    for (const viewport of [MATRIX[1], MATRIX[2]] as const) {
      const scene = await served.measure<Scene>('es', viewport, SCENE);
      assertCurrentMarked(scene.cells, `${viewport.width}`);
    }
  }, 180_000);
});

/** No side's border colour differs where both sides are painted: an unpainted side is not a marker. */
function assertBorderColours(winner: Cell, sibling: Cell, label: string): void {
  for (const side of Object.keys(winner.borders)) {
    const mine = winner.borders[side];
    const theirs = sibling.borders[side];
    if (mine?.painted !== true || theirs?.painted !== true) continue;
    expect(mine.colour, `${label}: ${side} border colour`).toBe(theirs.colour);
  }
}

/** Exactly one current cell, sharing its siblings' ground and differing without colour. */
function assertCurrentMarked(cells: Cell[], label: string): void {
  expect(cells.length, `${label}: five cells`).toBe(5);
  const current = cells.filter((cell) => cell.current === 'page');
  expect(current.length, `${label}: one current`).toBe(1);
  const winner = current[0] as Cell;
  for (const sibling of cells.filter((cell) => cell.current !== 'page')) {
    expect(winner.background, `${label}: same ground`).toBe(sibling.background);
    // The marker cannot migrate into a border the ground count would not see.
    assertBorderColours(winner, sibling, label);
    const nonColour = winner.weight !== sibling.weight || winner.decoration !== sibling.decoration;
    expect(nonColour, `${label}: non-colour difference`).toBe(true);
  }
}
