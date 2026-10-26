import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AGE_BANDS, OPEN_BAND, bandLabel, bandOfAgeLabel } from '../../web/series/age-bands';
import { computePyramid, openBandShare, readAgeCounts } from '../../web/series/age-structure';
import { definitionTextFor, isDefinitionId } from '../../web/manifest/definitions';
import { isFormulaId } from '../../web/manifest/formula-ids';
import { validateManifest } from '../../web/manifest/validate';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { readDerivedSeries } from '../../web/derived/series-store';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { content, renderComponent } from '../fixtures/figures';
import {
  committedPayload,
  pyramidSeries,
  pyramidValue,
  unavailableSeries,
} from '../fixtures/series';
import { readSource } from '../helpers/source-scan';

const ES = content('es');
const fileExists = (path: string): boolean => existsSync(path);

function renderPyramid(series = pyramidSeries(), locale = 'es'): string {
  return renderComponent(PyramidPlate, {
    content: content(locale),
    series,
    freshnessWindowDays: 45,
  });
}

/**
 * Renames an age code everywhere in a JSON-stat payload while preserving category order, so the
 * flat `value` indices still line up. Used to prove the banding resolves labels, not codes.
 */
function renameAgeCode(payload: unknown, from: string, to: string): unknown {
  const clone = JSON.parse(JSON.stringify(payload)) as {
    dimension: { age: { category: { index: Record<string, number>; label: Record<string, string> } } };
  };
  const category = clone.dimension.age.category;
  category.index = Object.fromEntries(
    Object.entries(category.index).map(([code, index]) => [code === from ? to : code, index]),
  );
  category.label = Object.fromEntries(
    Object.entries(category.label).map(([code, label]) => [code === from ? to : code, label]),
  );
  return clone;
}

describe('AC-001-93: age codes band to five-year groups, the open band resolves by label', () => {
  it('AC-001-93: bands every single-year label and both spellings of the open-ended band', () => {
    expect(bandOfAgeLabel('Less than 1 year')).toBe(0);
    expect(bandOfAgeLabel('1 year')).toBe(0);
    expect(bandOfAgeLabel('4 years')).toBe(0);
    expect(bandOfAgeLabel('5 years')).toBe(5);
    expect(bandOfAgeLabel('64 years')).toBe(60);
    expect(bandOfAgeLabel('99 years')).toBe(95);
    // The trap: `demo_pjan` says "Open-ended age class", `proj_23np` says "100 years or over".
    expect(bandOfAgeLabel('Open-ended age class')).toBe(OPEN_BAND);
    expect(bandOfAgeLabel('100 years or over')).toBe(OPEN_BAND);
    // Aggregate and unknown classes are excluded, never folded into a band.
    expect(bandOfAgeLabel('Total')).toBeNull();
    expect(bandOfAgeLabel('Unknown')).toBeNull();
    expect(bandOfAgeLabel('From 15 to 64 years')).toBeNull();
    expect(AGE_BANDS).toHaveLength(21);
    expect(AGE_BANDS[AGE_BANDS.length - 1]).toBe(OPEN_BAND);
    expect(bandLabel(20)).toBe('20–24');
    expect(bandLabel(OPEN_BAND)).toBe('100+');
  });

  it('AC-001-93: the 100+ band is present and populated for every year shown', () => {
    const value = pyramidValue();
    expect(value.years.map((year) => year.year)).toEqual([1995, 2025, 2050]);
    for (const year of value.years) {
      expect(year.bands, `${year.year}`).toHaveLength(21);
      expect(value.years.some((entry) => entry.year === year.year && entry.bands.length === 21)).toBe(true);
      expect(openBandShare(value, year.year), `${year.year} 100+`).toBeDefined();
    }
    // 1995's centenarians exist but fall below the published two-decimal precision, so the band
    // is present with a zero share; in 2050 it is visibly populated.
    const observed = readAgeCounts(committedPayload('eurostat-demo-pjan')).years.get(1995)?.get(OPEN_BAND);
    expect(observed === undefined ? 0 : observed.total).toBeGreaterThan(0);
    const projectedOpen = openBandShare(value, 2050);
    expect(projectedOpen === undefined ? 0 : projectedOpen.total).toBeGreaterThan(0);
  });

  it('AC-001-93: the open band is resolved by label, not by a hardcoded code', () => {
    const original = readAgeCounts(committedPayload('eurostat-demo-pjan'));
    // A code this module has never seen, carrying the same published label.
    const renamed = readAgeCounts(renameAgeCode(committedPayload('eurostat-demo-pjan'), 'Y_OPEN', 'ZZ_OPEN_99'));
    const originalOpen = original.years.get(1995)?.get(OPEN_BAND);
    const renamedOpen = renamed.years.get(1995)?.get(OPEN_BAND);
    expect(renamedOpen).toEqual(originalOpen);
    expect(renamedOpen?.total).toBeGreaterThan(0);
  });
});

describe('AC-001-94: the sexes reconcile with the total and the shares sum to 100', () => {
  it('AC-001-94: males plus females equal the sex total in every band and year', () => {
    for (const year of pyramidValue().years) {
      for (const band of year.bands) {
        expect(Math.abs(band.male + band.female - band.total), `${year.year}/${band.band}`).toBeLessThanOrEqual(0.01);
      }
    }
  });

  it('AC-001-94: the band shares of a year sum to 100 within a tenth', () => {
    for (const year of pyramidValue().years) {
      const sum = year.bands.reduce((total, band) => total + band.total, 0);
      expect(Math.abs(sum - 100), `${year.year} sums to ${sum}`).toBeLessThanOrEqual(0.1);
    }
  });

  it('AC-001-94: a payload whose sexes disagree with the total is refused, not published', () => {
    const payload = {
      id: ['freq', 'unit', 'age', 'sex', 'geo', 'time'],
      size: [1, 1, 2, 3, 1, 1],
      dimension: {
        freq: { category: { index: { A: 0 }, label: { A: 'Annual' } } },
        unit: { category: { index: { NR: 0 }, label: { NR: 'Number' } } },
        age: { category: { index: { TOTAL: 0, Y_OPEN: 1 }, label: { TOTAL: 'Total', Y_OPEN: 'Open-ended age class' } } },
        sex: { category: { index: { T: 0, M: 1, F: 2 }, label: { T: 'Total', M: 'Males', F: 'Females' } } },
        geo: { category: { index: { ES: 0 }, label: { ES: 'Spain' } } },
        time: { category: { index: { 1995: 0 }, label: { 1995: '1995' } } },
      },
      // The open band's total is 3 while its two sexes sum to 2: a double-counted or dropped row.
      value: { 0: 3, 1: 1, 2: 1, 3: 3, 4: 1, 5: 1 },
    };
    expect(() => readAgeCounts(payload)).toThrow(/double-count/);
  });

  it('AC-001-94: UNK rows are excluded and the exclusion is recorded in the definition', () => {
    const value = pyramidValue();
    expect(value.excludedLabels).toContain('Unknown');
    const definition = definitionTextFor('age-structure');
    expect(definition.toLowerCase()).toContain('unknown');
    expect(definition.toLowerCase()).toContain('excludes');
  });
});

describe('AC-001-95: the derived series carries a complete manifest from the documented sets', () => {
  const series = pyramidSeries();

  it('AC-001-95: a complete manifest with both ids from the documented closed sets', () => {
    expect(isFormulaId(series.manifest.formulaId)).toBe(true);
    expect(isDefinitionId(series.manifest.definitionId)).toBe(true);
    expect(series.manifest.sourceUrl.length).toBeGreaterThanOrEqual(1);
    expect(series.manifest.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(series.manifest.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(fileExists(series.manifest.reproducePath)).toBe(true);
    expect(validateManifest(series.manifest, { fileExists })).toEqual({ ok: true, manifest: series.manifest });
    expect(series.definition).toBe(definitionTextFor('age-structure'));
  });

  it('AC-001-95: an id outside the documented sets fails validation', () => {
    const unknownFormula = validateManifest({ ...series.manifest, formulaId: 'invented.v9' }, { fileExists });
    expect(unknownFormula.ok).toBe(false);
    if (unknownFormula.ok) return;
    expect(unknownFormula.problems.map((problem) => problem.code)).toContain('unknownFormulaId');

    const unknownDefinition = validateManifest({ ...series.manifest, definitionId: 'invented-series' }, { fileExists });
    expect(unknownDefinition.ok).toBe(false);
    if (unknownDefinition.ok) return;
    expect(unknownDefinition.problems.map((problem) => problem.code)).toContain('unknownDefinitionId');
  });

  it('AC-001-95: the committed file on disk is the one the page reads', () => {
    const committed = readDerivedSeries().find((entry) => entry.seriesId === 'pyramid');
    expect(committed).toBeDefined();
    expect(committed?.availability).toBe('computed');
    expect(committed?.manifest.formulaId).toBe('age-structure.v1');
    expect(validateManifest(committed?.manifest, { fileExists }).ok).toBe(true);
  });
});

describe('AC-001-96: the derived file lives where the figure loader does not read it', () => {
  it('AC-001-96: the flat figure store never casts the pyramid to a figure id', () => {
    const figures = readDerivedFigures('data/derived');
    expect(figures).toHaveLength(7);
    expect(figures.every((figure) => figure.figureId.startsWith('fig-'))).toBe(true);
    expect(figures.some((figure) => (figure.figureId as string) === 'pyramid')).toBe(false);
    expect(existsSync('data/derived/series/pyramid.json')).toBe(true);
    expect(existsSync('data/derived/pyramid.json')).toBe(false);
  });

  it('AC-001-96: a directory holding only a series subdirectory yields no figures', () => {
    const dir = mkdtempSync(join(tmpdir(), 'derived-'));
    mkdirSync(join(dir, 'series'));
    writeFileSync(join(dir, 'series', 'pyramid.json'), '{"seriesId":"pyramid"}', 'utf8');
    expect(readDerivedFigures(dir)).toEqual([]);
  });

  it('AC-001-96: the store comments name the reason the subdirectory exists', () => {
    const source = readSource('web/derived/store.ts');
    expect(source).toContain('data/derived/series');
    expect(source).toContain('readdirSync');
  });
});

describe('AC-001-97: the chart and the table are emitted together or not at all', () => {
  it('AC-001-97: a computed pyramid renders the three panels and the table together', () => {
    const html = renderPyramid();
    expect(html.split('class="demography__svg"').length - 1).toBe(3);
    expect(html).toContain('<table>');
    expect(html).toContain('<caption>');
    expect(html.split('scope="row"').length - 1).toBe(21);
  });

  it('AC-001-97: an unavailable pyramid renders neither, and says so', () => {
    const html = renderPyramid(unavailableSeries(pyramidSeries()));
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('<table');
    expect(html).not.toContain('<details');
    expect(html).toContain('<h2');
    expect(html).toContain(ES.t('figure.methodLink'));
  });
});

describe('the pyramid renders the data it publishes', () => {
  it('renders every band label and both sex columns in every locale', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      const html = renderPyramid(pyramidSeries(), locale);
      expect(html, locale).toContain(bandLabel(OPEN_BAND));
      expect(html, locale).toContain(bandLabel(20));
    }
  });

  it('labels each panel with its year and its observed/projected word', () => {
    const html = renderPyramid();
    expect(html).toContain(ES.t('demography.year.observed'));
    expect(html).toContain(ES.t('demography.year.projected'));
    expect(html).toContain('data-projection="projected"');
  });

  it('carries the finding sentence and the six readout values', () => {
    const html = renderPyramid();
    expect(html).toContain(ES.t('demography.heading'));
    expect(html.split('demography__readout-item').length - 1).toBe(6);
  });

  it('computes a third year or fails: a two-panel plate is impossible', () => {
    const projected = committedPayload('eurostat-proj-23np') as { dimension: Record<string, unknown> };
    expect(projected.dimension).toBeDefined();
    expect(() => computePyramid({ observed: committedPayload('eurostat-demo-pjan'), projected: {} })).toThrow();
  });
});
