import { describe, expect, it } from 'vitest';
import { contributionCover } from '../../web/metrics/contribution-cover';
import { shareOfGdp } from '../../web/metrics/pension-share';
import { formatFixed } from '../../web/metrics/rounding';
import { definitionFor, definitionsForMetric } from '../../web/manifest/definitions';
import { FIGURES } from '../../web/ingest/figures';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import {
  content,
  coverFigure,
  nationalCoverFigure,
  renderPlate,
  shareFigure,
} from '../fixtures/figures';

describe('contribution cover', () => {
  it('AC-001-13: computes cover to two decimal places', () => {
    const result = contributionCover(120_000_000_000, 150_000_000_000);

    expect(result.cover).toBe(0.8);
    expect(formatFixed(result.cover as number, 2)).toBe('0.80');
    expect(result.status).toBe('gap');
  });

  it('AC-001-14: zero expenditure is undefined', () => {
    const result = contributionCover(100_000_000_000, 0);

    expect(result.cover).toBeNull();
    expect(result.status).toBe('undefined');
    expect(JSON.stringify(result)).not.toMatch(/Infinity|NaN/);
  });

  it('AC-001-15: zero contributions is 0.00', () => {
    const result = contributionCover(0, 50_000_000_000);

    expect(result.cover).toBe(0);
    expect(formatFixed(result.cover as number, 2)).toBe('0.00');
  });

  it('AC-001-16: cover below 1 produces a positive gap', () => {
    const result = contributionCover(120_000_000_000, 150_000_000_000);

    expect(result.cover as number).toBeLessThan(1);
    expect(result.gap).toBe(30_000_000_000);
    expect(result.gap as number).toBeGreaterThan(0);
  });

  it('AC-001-17: cover is never negative', () => {
    for (const [contributions, expenditure] of [
      [0, 1],
      [1, 1],
      [1_000, 1],
      [0, 0],
    ] as const) {
      const result = contributionCover(contributions, expenditure);
      if (result.cover === null) continue;
      expect(result.cover).toBeGreaterThanOrEqual(0);
    }
  });

  it('AC-001-85: the metric publishes two distinct figures, never one merged number', () => {
    const definitions = definitionsForMetric('contribution-cover');
    const figures = FIGURES.filter(
      (figure) => definitionFor(figure.definitionId).metric === 'contribution-cover',
    );
    const es = content('es');

    expect(definitions.length).toBe(2);
    expect(figures.length).toBe(2);
    expect(new Set(figures.map((figure) => figure.definitionId)).size).toBe(2);

    // Different definition families, because the two measure different things: effort and
    // coverage. Neither is a unit-converted view of the other.
    expect(figures.map((figure) => figure.definitionId).sort()).toEqual([
      'contribution-cover.national',
      'pension-expenditure-gdp.international',
    ]);

    const international = renderPlate(shareFigure());
    const national = renderPlate(coverFigure());
    expect(international).toContain(es.t('fig.02.title'));
    expect(international).toContain(es.t('fig.02.definition'));
    expect(national).toContain(es.t('fig.07.title'));
    expect(national).toContain(es.t('fig.07.definition'));
    expect(international).not.toContain(es.t('fig.07.title'));
    expect(national).not.toContain(es.t('fig.02.title'));
  });

  it('AC-001-86: the international figure is pension expenditure as % of GDP', () => {
    expect(formatFixed(shareOfGdp(150_000_000_000, 1_500_000_000_000) as number, 2)).toBe('10.00');
    expect(shareOfGdp(150_000_000_000, 0)).toBeNull();

    const es = content('es');
    expect(es.t('fig.02.title')).toBe('Gasto público en pensiones (% del PIB)');

    const figure = readDerivedFigures('data/derived').find((entry) => entry.figureId === 'fig-02');
    if (!figure) throw new Error('fig-02 is not published');
    expect(figure.availability).toBe('computed');
    expect(figure.definitionId).toBe('pension-expenditure-gdp.international');
    expect(figure.assumptions.unitCode).toBe('PC_GDP');
    expect(definitionFor('pension-expenditure-gdp.international').definition).toContain(
      'as a share of gross domestic product',
    );
  });

  it('AC-001-87: the national figure is unavailable, with its definition stated', () => {
    const published = readDerivedFigures('data/derived').find((entry) => entry.figureId === 'fig-07');
    if (!published) throw new Error('fig-07 is not published');

    expect(published.availability).toBe('unavailable');
    expect(published.value).toBeNull();
    expect(published.definitionId).toBe('contribution-cover.national');
    expect(published.manifest.definitionId).toBe('contribution-cover.national');

    const national = definitionFor('contribution-cover.national').definition;
    expect(national).toContain('social contributions divided by contributory pension expenditure');
    expect(national).toContain('Excludes transfers from general taxation and debt');

    const row = renderPlate(nationalCoverFigure());
    expect(row).toContain(content('es').t('fig.07.definition'));
    expect(row).toContain(content('es').t('fig.07.reason'));
  });
});
