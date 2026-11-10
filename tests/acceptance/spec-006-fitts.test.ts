import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-07…09 — Fitts' law above the fold (Task 4). The box grows, the type does not, and no
 * target is hidden to reach the floor. "Rendered above the fold" is the contract's §2.1–2.2 rule,
 * which counts a closed `<details>`'s `<summary>` and excludes the panel it opens.
 */
const TARGETS = `(() => {
  ${DOM_PREAMBLE}
  const targets = [...document.querySelectorAll(INTERACTIVE)]
    .filter(aboveFold)
    .map((el) => {
      const box = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute('href'),
        name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
        width: box.width,
        height: box.height,
        short: Math.min(box.width, box.height),
        fontSize: parseFloat(getComputedStyle(el).fontSize),
      };
    });
  const root = getComputedStyle(document.documentElement);
  return {
    targets,
    tapMin: root.getPropertyValue('--tap-min').trim(),
    localeCell: root.getPropertyValue('--locale-cell').trim(),
  };
})()`;

interface Target {
  tag: string;
  href: string | null;
  name: string;
  width: number;
  height: number;
  short: number;
  fontSize: number;
}

interface TargetMeasurement {
  targets: Target[];
  tapMin: string;
  localeCell: string;
}

describe.skipIf(!BROWSER_READY)('the above-the-fold target set, measured', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-07: every rendered target above the fold reaches --tap-min, skip link included', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const measured = await served.measure<TargetMeasurement>(locale, viewport, TARGETS);
        expect(measured.tapMin, `${locale} ${viewport.width}`).toBe('44px');
        for (const target of measured.targets) {
          expect(Number(target.short.toFixed(2)), `${locale} ${viewport.width}: ${target.tag} ${target.name}`).toBeGreaterThanOrEqual(44);
        }
        // The off-canvas skip link is a target by name and by measurement.
        expect(measured.targets.some((target) => target.href === '#main'), `${locale} ${viewport.width}: skip link`).toBe(true);
      }
    }
  }, 300_000);

  it('AC-006-08: the target grows, the type does not, and the cell token is untouched', async () => {
    for (const viewport of MATRIX) {
      const measured = await served.measure<TargetMeasurement>('es', viewport, TARGETS);
      expect(measured.localeCell, `${viewport.width}: --locale-cell`).toBe('36px');
      for (const target of measured.targets) {
        expect(target.fontSize, `${viewport.width}: ${target.tag} ${target.name}`).toBeLessThanOrEqual(17);
      }
    }
    const css = readFileSync('web/styles/globals.css', 'utf8');
    expect(css).toMatch(/\.locale-group__cell\s*\{[^}]*inline-size:\s*var\(--locale-cell\)/s);
    expect(css).toMatch(/\.locale-group__cell\s*\{[^}]*block-size:\s*var\(--locale-cell\)/s);
  }, 180_000);

  it('AC-006-09: nothing is hidden to reach the floor', async () => {
    for (const viewport of [MATRIX[1], MATRIX[2]] as const) {
      const measured = await served.measure<TargetMeasurement>('es', viewport, TARGETS);
      expect(measured.targets.length, `${viewport.width}: desktop targets`).toBeGreaterThanOrEqual(12);
      const hrefs = measured.targets.map((target) => target.href);
      for (const href of ['#main', '/', '/cifras', '/metodo', '/debate', '/en', '/fr', '/de', '/it']) {
        expect(hrefs, `${viewport.width}: ${href}`).toContain(href);
      }
      expect(measured.targets.some((target) => target.tag === 'button'), `${viewport.width}: theme toggle`).toBe(true);
    }
    const phone = await served.measure<TargetMeasurement>('es', MATRIX[0], TARGETS);
    expect(phone.targets.length).toBeGreaterThanOrEqual(4);
    expect(phone.targets.map((target) => target.href)).toContain('#main');
    expect(phone.targets.map((target) => target.href)).toContain('/');
    expect(phone.targets.some((target) => target.tag === 'summary'), 'index trigger counted').toBe(true);
    expect(phone.targets.some((target) => target.tag === 'button'), 'theme toggle').toBe(true);
  }, 180_000);
});
