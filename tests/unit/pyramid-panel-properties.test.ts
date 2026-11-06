import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { Panel } from '../../web/components/series/PyramidPanel';
import { AGE_BANDS } from '../../web/series/age-bands';
import type { BandShare, YearStructure } from '../../web/series/age-structure';
import { content, renderComponent } from '../fixtures/figures';

/**
 * Property tests for one demography panel's geometry.
 *
 * The acceptance suite checks the shipped three panels and the committed shares; it cannot check
 * the scale itself. Two invariants of `PyramidPanel.tsx` are what make the chart comparable rather
 * than merely correct on today's data, and both are cheap to state over generated shares:
 *
 *  1. every bar length is the share's place on the shared axis, so it stays inside the half-width
 *     and never inverts — a share that is larger never draws shorter;
 *  2. the panel always draws one bar group per band it is given, and marks exactly one of them.
 *
 * A hand-picked fixture proves (1) for one pair of numbers and (2) for the committed payload.
 * A clamp written as `min(max(…))` in the wrong order, or an annotation that falls out of the band
 * list, passes those and fails here.
 */

const CONTENT = content('es');
const SIDE = 150;

/** The panel's own half-width, restated so a change to it fails this file loudly. */
const BAR_PATTERN =
  /<rect class="demography__bar" x="[^"]*" y="[^"]*" width="([^"]*)" height="[^"]*"/g;

/** One panel rendered with the given bands and axis — the shape every assertion below reads. */
function panelMarkup(bands: BandShare[], axisMax: number): string {
  const year: YearStructure = {
    year: 2025,
    state: 'observed',
    hue: 'measured',
    population: 48_000_000,
    bands,
    readout: { over65: 0, under20: 0 },
  };
  return renderComponent(Panel, { year, content: CONTENT, axisMax });
}

/** The rendered bar lengths of one panel, left (male) then right (female) per band. */
function barWidths(bands: BandShare[], axisMax: number): number[] {
  return [...panelMarkup(bands, axisMax).matchAll(BAR_PATTERN)].map((match) => Number(match[1]));
}

/** Bands are distinct and in the order they are drawn, so the panel never renders a repeated key. */
function bandsFor(shares: readonly number[]): BandShare[] {
  return shares.map((share, index) => ({
    band: AGE_BANDS[index] as number,
    male: share,
    female: share,
    total: share * 2,
  }));
}

/**
 * A share on the panel's axis. Published shares are never negative — the lower bound is the small
 * overshoot a rounded or hand-edited payload can carry, and the panel's clamp exists to keep it
 * from drawing a bar the wrong way round, so the generator reaches it.
 */
const share = fc.double({ min: -0.5, max: 20, noNaN: true });
const shares = fc.array(share, { minLength: 1, maxLength: AGE_BANDS.length });
const axisMax = fc.double({ min: 1, max: 10, noNaN: true });

describe('the demography panel’s scale (property tests)', () => {
  it('keeps every bar inside the half-width, on the axis’s own rounding', () => {
    fc.assert(
      fc.property(shares, axisMax, (generated, max) => {
        const bands = bandsFor(generated);
        const widths = barWidths(bands, max);
        expect(widths, 'two bars per band').toHaveLength(bands.length * 2);

        for (const width of widths) {
          expect(Number.isFinite(width), `${width} is finite`).toBe(true);
          expect(width, `${width} is never negative`).toBeGreaterThanOrEqual(0);
          expect(width, `${width} stays inside the half-width`).toBeLessThanOrEqual(SIDE);
          // One decimal at build time, exactly: a second decimal would mean the rounding moved.
          expect(Math.round(width * 10) / 10, `${width} is one decimal`).toBe(width);
        }
      }),
      { numRuns: 50 },
    );
  });

  it('draws a zero-length bar at zero and a full one at or past the axis', () => {
    fc.assert(
      fc.property(axisMax, (max) => {
        const [zero] = barWidths(bandsFor([0]), max);
        expect(zero, 'a zero share draws nothing').toBe(0);

        for (const beyond of [max, max * 2, max * 10]) {
          const [full] = barWidths(bandsFor([beyond]), max);
          expect(full, `${beyond} saturates at the axis`).toBe(SIDE);
        }
      }),
      { numRuns: 30 },
    );
  });

  it('never draws a larger share shorter', () => {
    fc.assert(
      fc.property(share, share, axisMax, (first, second, max) => {
        const [smaller, larger] = first <= second ? [first, second] : [second, first];
        const widths = barWidths(bandsFor([smaller, larger]), max);
        const [smallerWidth, largerWidth] = [widths[0], widths[2]] as [number, number];
        expect(smallerWidth, `${smaller} vs ${larger} at axis ${max}`).toBeLessThanOrEqual(largerWidth);
      }),
      { numRuns: 50 },
    );
  });

  it('draws one bar group per band and marks exactly one of them', () => {
    fc.assert(
      fc.property(shares, axisMax, (generated, max) => {
        const bands = bandsFor(generated);
        const markup = panelMarkup(bands, max);

        expect(
          markup.split('class="demography__bar-group').length - 1,
          'one group per band',
        ).toBe(bands.length);
        expect(markup.split('data-annotated="true"').length - 1, 'one annotation').toBe(1);
        // Every band is labelled: the age gutter is never short of the bars it names.
        expect(markup.split('class="demography__age').length - 1, 'one age label per band').toBe(
          bands.length,
        );
      }),
      { numRuns: 30 },
    );
  });
});
