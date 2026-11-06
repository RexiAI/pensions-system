import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-22, AC-006-23 — the box is removed (Task 8). Step 1 is the number on the page's own
 * ground: no panel, no border, no shadow, and the chrome does not butt against it.
 */
const BOX = `(() => {
  ${DOM_PREAMBLE}
  const pageGround = getComputedStyle(document.documentElement).backgroundColor;
  const steps = [...document.querySelectorAll('[data-top-step]')].map((el) => {
    const style = getComputedStyle(el);
    return {
      id: el.getAttribute('data-top-step'),
      background: style.backgroundColor,
      borderWidth:
        parseFloat(style.borderTopWidth) + parseFloat(style.borderRightWidth) +
        parseFloat(style.borderBottomWidth) + parseFloat(style.borderLeftWidth),
      shadow: style.boxShadow,
    };
  });
  const step = document.querySelector('[data-top-step="number"]');
  const header = document.querySelector('.site-header');
  const titleInk = inkOf(step.querySelector('h1'));
  const next = document.querySelectorAll('[data-top-step]')[1];
  return {
    pageGround,
    steps,
    gap: titleInk.top - header.getBoundingClientRect().bottom,
    hairline: parseFloat(getComputedStyle(next).borderTopWidth),
  };
})()`;

interface BoxMeasurement {
  pageGround: string;
  steps: { id: string | null; background: string; borderWidth: number; shadow: string }[];
  gap: number;
  hairline: number;
}

describe.skipIf(!BROWSER_READY)('step 1 paints nothing', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-22: no step paints a ground, step 1 has no edge, and the story clears the header', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const measured = await served.measure<BoxMeasurement>(locale, viewport, BOX);
        for (const step of measured.steps) {
          const transparent = step.background === 'rgba(0, 0, 0, 0)';
          expect(transparent || step.background === measured.pageGround, `${locale} ${viewport.width}: ${step.id} ground`).toBe(true);
          if (step.id === 'number') {
            expect(step.borderWidth, `${locale} ${viewport.width}: step 1 border`).toBe(0);
            expect(step.shadow, `${locale} ${viewport.width}: step 1 shadow`).toBe('none');
          }
        }
        // At least --space-6 (32 px) between the header's bottom edge and the number's first ink.
        expect(measured.gap, `${locale} ${viewport.width}: clearance`).toBeGreaterThanOrEqual(32);
        // The steps remain distinct: the shared `.step + .step` hairline survives.
        expect(measured.hairline, `${locale} ${viewport.width}: hairline`).toBeGreaterThan(0);
      }
    }
  }, 300_000);

  it('AC-006-23: the peach cannot come back', () => {
    const tokens = readFileSync('web/styles/tokens.css', 'utf8');
    const css = readFileSync('web/styles/globals.css', 'utf8');
    for (const source of [tokens, css]) {
      expect(source.toLowerCase()).not.toContain('#fee8d0');
      expect(source.toLowerCase()).not.toContain('#201406');
      expect(source).not.toContain('var(--surface-hero)');
      expect(source).not.toContain('--surface-hero:');
    }
    // No colour literal outside the token file.
    const literal = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
    const outside = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of outside.matchAll(/(?:^|;)\s*(color|background|background-color|border-color|fill|stroke):\s*([^;]+);/g)) {
      expect(match[2] ?? '', match[1] ?? '').not.toMatch(literal);
    }
  });
});
