/**
 * @vitest-environment jsdom
 */
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Panel } from '../../web/components/series/PyramidPanel';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { AGE_BANDS } from '../../web/series/age-bands';
import type { PyramidValue, YearStructure } from '../../web/series/age-structure';
import { content } from '../fixtures/figures';
import { pyramidSeries } from '../fixtures/series';

/**
 * Mutation-killing test for the plate's generated keys (stage 5a, spec 006).
 *
 * A `key` never reaches the document, so no rendered-string assertion can see one. What a key is
 * *for* is reconciliation, and React reports the failure mode directly: two children under one
 * parent with the same key produce a duplicate-key warning. The readout lists six items and the
 * age gutter lists one `<text>` per band, so a flattened key collides immediately.
 */

const ES = content('es');
const mounted: Root[] = [];

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(async () => {
  for (const root of mounted.splice(0)) {
    await act(async () => root.unmount());
  }
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

async function mount(element: ReactElement): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => root.render(element));
  return container;
}

describe('AC-006-27: the lists the plate renders carry unique keys', () => {
  it('AC-006-27: the readout and the age gutter reconcile without a duplicate-key warning', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const value = pyramidSeries().value as PyramidValue;

    const plate = await mount(createElement(PyramidPlate, { content: ES, series: pyramidSeries() }));
    const panel = await mount(
      createElement(Panel, {
        year: value.years[1] as YearStructure,
        content: ES,
        axisMax: value.axisMaxPercent,
      }),
    );

    expect(plate.querySelectorAll('.demography__readout-item').length).toBe(value.years.length * 2);
    expect(panel.querySelectorAll('.demography__age').length).toBe(AGE_BANDS.length);

    const keyWarnings = error.mock.calls.filter((call) => String(call[0]).includes('same key'));
    expect(keyWarnings).toEqual([]);
  });
});
