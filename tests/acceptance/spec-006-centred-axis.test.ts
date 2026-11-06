import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, SWEEP, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser, Viewport } from '../helpers/served-browser';

/**
 * AC-006-01, AC-006-02 — step 1 composed on one axis (Task 1).
 *
 * Measured against the contract in `10-tasks.md` §2: per-text-node `Range` rects for ink, step 1's
 * content box (not the window) as the reference, five locales by three viewports. A test that
 * measured an element's box instead of its glyphs would pass while the text sat flush left.
 */
const MEASURE = `(() => {
  ${DOM_PREAMBLE}
  const step = document.querySelector('[data-top-step="number"]');
  const style = getComputedStyle(step);
  const box = step.getBoundingClientRect();
  const contentLeft = box.left + parseFloat(style.paddingLeft);
  const contentRight = box.right - parseFloat(style.paddingRight);
  const centre = (contentLeft + contentRight) / 2;
  // The centred units are derived from the DOM, not listed: every direct child of the step's
  // content column that carries text. A fifth text-bearing block is centred by the same rule.
  const units = [...step.children]
    .filter((el) => (el.textContent || '').trim() !== '')
    .map((el) => ({ name: el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0], el }));
  const results = units.map(({ name, el }) => {
    const ink = inkOf(el);
    if (!ink) return { name, missing: true };
    return {
      name,
      missing: false,
      offset: Math.abs(ink.centre - centre),
      residual: Math.abs((contentRight - ink.right) - (ink.left - contentLeft)),
      width: ink.width,
    };
  });
  const sentence = step.querySelector('.step__sentence');
  const numeral = inkOf(step.querySelector('.clock__value--days'));
  const unit = inkOf(step.querySelector('.clock__label'));
  return {
    derived: units.length,
    results,
    numeral,
    unit,
    measure: parseFloat(getComputedStyle(sentence).maxInlineSize),
  };
})()`;

interface UnitMeasurement {
  name: string;
  missing: boolean;
  offset: number;
  residual: number;
  width: number;
}

interface AxisMeasurement {
  derived: number;
  results: UnitMeasurement[];
  numeral: { top: number; bottom: number; right: number } | null;
  unit: { top: number; bottom: number; left: number } | null;
  measure: number;
}

const OFFSET_MAX = 4;
const RESIDUAL_MAX = 8;

function assertAxis(measurement: AxisMeasurement, label: string): void {
  // The derived set is exactly four: a fifth text-bearing block must be centred too.
  expect(measurement.derived, `${label}: derived units`).toBe(4);
  expect(measurement.results.length, `${label}: measured units`).toBe(4);
  for (const unit of measurement.results) {
    expect(unit.missing, `${label}: ${unit.name} has no ink`).toBe(false);
    expect(unit.offset, `${label}: ${unit.name} centre offset`).toBeLessThanOrEqual(OFFSET_MAX);
    expect(unit.residual, `${label}: ${unit.name} residual asymmetry`).toBeLessThanOrEqual(RESIDUAL_MAX);
  }
}

function assertOneLine(measured: AxisMeasurement, label: string): void {
  expect(measured.numeral, `${label}: numeral ink`).not.toBeNull();
  expect(measured.unit, `${label}: unit ink`).not.toBeNull();
  const numeral = measured.numeral as NonNullable<AxisMeasurement['numeral']>;
  const unit = measured.unit as NonNullable<AxisMeasurement['unit']>;
  expect(numeral.top, `${label}: numeral/unit one line`).toBeLessThan(unit.bottom);
  expect(numeral.bottom, `${label}: numeral/unit one line`).toBeGreaterThan(unit.top);
}

describe.skipIf(!BROWSER_READY)('step 1 on one axis', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-01: every centred unit sits on the content box’s centre in all fifteen pages', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const measured = await served.measure<AxisMeasurement>(locale, viewport, MEASURE);
        assertAxis(measured, `${locale} ${viewport.width}`);
        assertOneLine(measured, `${locale} ${viewport.width}`);
      }
    }
  }, 300_000);

  it('AC-006-02: the axis holds across the width sweep, including German at 320', async () => {
    for (const viewport of SWEEP) {
      const measured = await served.measure<AxisMeasurement>('es', viewport, MEASURE);
      assertAxis(measured, `es ${viewport.width}`);
      const sentence = measured.results.find((unit) => unit.name.includes('step__sentence')) as UnitMeasurement;
      // Not centred by widening: the sentence's ink stays inside its declared measure.
      expect(sentence.width, `es ${viewport.width}: sentence ink`).toBeLessThanOrEqual(measured.measure);
    }
  }, 300_000);

  it('AC-006-02: German holds at the narrowest and the widest widths', async () => {
    for (const viewport of [{ width: 320, height: 900 }, { width: 1440, height: 900 }] as Viewport[]) {
      const measured = await served.measure<AxisMeasurement>('de', viewport, MEASURE);
      assertAxis(measured, `de ${viewport.width}`);
    }
  }, 180_000);
});
