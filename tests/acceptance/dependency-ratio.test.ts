import { describe, expect, it } from 'vitest';
import { dependencyRatio, dependencyRatioSeries } from '../../web/metrics/dependency-ratio';
import { formatFixed } from '../../web/metrics/rounding';
import { definitionFor, definitionsForMetric } from '../../web/manifest/definitions';
import { FIGURES } from '../../web/ingest/figures';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import {
  content,
  dependencyFigure,
  nationalDependencyFigure,
  renderPlate,
} from '../fixtures/figures';

describe('dependency ratio', () => {
  it('AC-001-08: computes the ratio to two decimal places', () => {
    const result = dependencyRatio(8_400_000, 20_000_000);

    expect(result.ratio).toBe(0.42);
    expect(formatFixed(result.ratio as number, 2)).toBe('0.42');
  });

  it('AC-001-09: zero affiliates is undefined, never Infinity or NaN', () => {
    const result = dependencyRatio(1_000_000, 0);

    expect(result.ratio).toBeNull();
    expect(Number.isFinite(result.ratio as unknown as number)).toBe(false);
    expect(JSON.parse(JSON.stringify(result))).toMatchObject({ ratio: null });
    expect(JSON.stringify(result)).not.toMatch(/Infinity|NaN/);
  });

  it('AC-001-10: zero pensioners is 0.00', () => {
    const result = dependencyRatio(0, 5_000_000);

    expect(result.ratio).toBe(0);
    expect(formatFixed(result.ratio as number, 2)).toBe('0.00');
  });

  it('AC-001-11: both zero is undefined', () => {
    expect(dependencyRatio(0, 0).ratio).toBeNull();
  });

  it('AC-001-12: the ratio rises when affiliates fall', () => {
    const before = dependencyRatio(8_400_000, 20_000_000);
    const after = dependencyRatio(8_400_000, 18_000_000);

    expect(after.ratio as number).toBeGreaterThan(before.ratio as number);
    expect(after.raw as number).toBeGreaterThan(before.raw as number);
  });

  it('AC-001-12: the series reports the latest period, the first, and the ten-year mean', () => {
    const series = dependencyRatioSeries([
      { period: '1996-01', numerator: 5_000_000, denominator: 12_000_000 },
      { period: '2016-01', numerator: 7_000_000, denominator: 17_000_000 },
      { period: '2026-09', numerator: 8_400_000, denominator: 20_000_000 },
    ]);

    expect(series.latest?.period).toBe('2026-09');
    expect(series.first?.period).toBe('1996-01');
    expect(series.meanLastTenYears).not.toBeNull();
  });

  it('AC-001-82: the metric publishes two distinct figures, never one merged number', () => {
    const definitions = definitionsForMetric('dependency-ratio');
    const figures = FIGURES.filter((figure) => figure.definitionId.startsWith('dependency-ratio.'));

    expect(definitions.length).toBe(2);
    expect(figures.length).toBe(2);
    expect(new Set(figures.map((figure) => figure.definitionId)).size).toBe(2);
    expect(new Set(figures.map((figure) => figure.figureId)).size).toBe(2);

    // Two labels, two definitions, each rendered beside its own figure.
    const international = renderPlate(dependencyFigure());
    const national = renderPlate(nationalDependencyFigure());
    const es = content('es');
    expect(international).toContain(es.t('fig.01.title'));
    expect(international).toContain(es.t('fig.01.definition'));
    expect(national).toContain(es.t('fig.06.title'));
    expect(national).toContain(es.t('fig.06.definition'));
    expect(international).not.toContain(es.t('fig.06.title'));
    expect(national).not.toContain(es.t('fig.01.title'));
    expect(es.t('fig.01.title')).not.toBe(es.t('fig.06.title'));
  });

  it('AC-001-83: the international figure is old-age beneficiaries per employed person', () => {
    const figure = readDerivedFigures('data/derived').find((entry) => entry.figureId === 'fig-01');
    if (!figure) throw new Error('fig-01 is not published');

    expect(figure.definitionId).toBe('dependency-ratio.international');
    expect(figure.availability).toBe('computed');
    expect(formatFixed(dependencyRatio(4_000_000, 20_000_000).ratio as number, 2)).toBe('0.20');

    // The published value is the ratio of the two committed series, never a fixture's number.
    const value = figure.value as {
      latest: { numerator: number; denominator: number; ratio: number };
      points: Array<{ period: string }>;
    };
    expect(value.latest.ratio).toBeCloseTo(value.latest.numerator / value.latest.denominator, 2);
    expect(value.points.length).toBeGreaterThan(1);
    expect(figure.assumptions.employmentAge).toBe('From 15 to 64 years');

    expect(definitionFor('dependency-ratio.international').definition).toContain(
      'beneficiaries of old age pensions',
    );
    expect(definitionFor('dependency-ratio.international').definition).toContain(
      'Excludes survivor and disability pension beneficiaries',
    );
  });

  it('AC-001-84: the national figure is unavailable, with its definition stated', () => {
    const figure = nationalDependencyFigure();
    const es = content('es');

    expect(figure.availability).toBe('unavailable');
    expect(figure.value).toBeNull();
    expect(figure.definitionId).toBe('dependency-ratio.national');

    const national = definitionFor('dependency-ratio.national').definition;
    for (const pensionType of ['jubilación', 'viudedad', 'incapacidad', 'orfandad']) {
      expect(national).toContain(pensionType);
    }
    expect(national).toContain('Excludes non-contributory pensions');

    // The difference from the international figure is explicit, never silent: each published
    // definition names its own population, and neither string is the other's.
    const international = definitionFor('dependency-ratio.international').definition;
    expect(national).not.toBe(international);
    expect(national).toContain('all contributory pensioners');
    expect(international).not.toContain('all contributory pensioners');

    const row = renderPlate(figure);
    expect(row).toContain(es.t('fig.06.definition'));
    expect(row).toContain(es.t('fig.06.reason'));
  });
});
