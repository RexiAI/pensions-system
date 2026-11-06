import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-14 — fewer type sizes above the fold (Task 6). The count is per viewport, over rendered
 * text leaves; every counted size must be a `--text-*` token's resolved value, so an ad-hoc
 * `13.5px` cannot dodge the count.
 */
const SIZES = `(() => {
  ${DOM_PREAMBLE}
  // The chart's own axis and age labels are data marks, not reading text: the design records the
  // 9 px literal as chart internals whose size is not a token, and instructs the count to exclude
  // it (Task 6 watch item). The assertion below names it rather than hiding it.
  const reading = leavesAboveFold().filter((el) => !el.closest('.demography__svg'));
  const sizes = [...new Set(reading.map((el) => parseFloat(getComputedStyle(el).fontSize)))].sort((a, b) => a - b);
  const chartSizes = [...new Set([...document.querySelectorAll('.demography__svg text')]
    .map((el) => parseFloat(getComputedStyle(el).fontSize)))];
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const tokens = {};
  for (const name of ['display', 'h2', 'h3', 'plate', 'body-lg', 'body', 'small', 'meta', 'micro', 'num-xl', 'num-l', 'num-m']) {
    probe.style.fontSize = 'var(--text-' + name + ')';
    tokens[name] = parseFloat(getComputedStyle(probe).fontSize);
  }
  probe.remove();
  return { sizes, chartSizes, tokens };
})()`;

interface SizeMeasurement {
  sizes: number[];
  chartSizes: number[];
  tokens: Record<string, number>;
}

describe.skipIf(!BROWSER_READY)('the type-size ledger above the fold', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-14: the distinct size count is at most nine, and every size is a token', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const measured = await served.measure<SizeMeasurement>(locale, viewport, SIZES);
        expect(measured.sizes.length, `${locale} ${viewport.width}: ${measured.sizes.join(', ')}`).toBeLessThanOrEqual(9);
        const values = Object.values(measured.tokens);
        for (const size of measured.sizes) {
          const matches = values.some((value) => Math.abs(value - size) < 0.05);
          expect(matches, `${locale} ${viewport.width}: ${size}px is not a --text-* token`).toBe(true);
        }
        // The one non-token size above the fold is the chart's own 9 px tick/age literal, named so
        // the exclusion is a recorded decision rather than an unexplained gap.
        for (const size of measured.chartSizes) expect(size, `${locale} ${viewport.width}: chart internals`).toBe(9);
      }
    }
  }, 300_000);

  it('AC-006-14: the display scale still resolves its shipped values', () => {
    const tokens = readFileSync('web/styles/tokens.css', 'utf8');
    expect(tokens).toMatch(/--text-display:\s*clamp\(2\.5rem, 4\.9vw, 4rem\);/);
    expect(tokens).toMatch(/--text-h2:\s*clamp\(1\.625rem, 2\.4vw, 2\.375rem\);/);
    expect(tokens).toMatch(/--text-plate:\s*clamp\(1\.1875rem, 1\.55vw, 1\.5rem\);/);
    expect(tokens).toMatch(/--text-body-lg:\s*1\.1875rem;/);
    expect(tokens).toMatch(/--measure:\s*64ch;/);
  });
});
