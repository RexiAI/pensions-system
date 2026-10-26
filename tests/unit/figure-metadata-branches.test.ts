import { describe, expect, it } from 'vitest';
import { FIGURES, figureById } from '../../web/ingest/figures';
import { FIGURE_IDS } from '../../web/ingest/types';
import { definitionFor } from '../../web/manifest/definitions';
import { FORMULA_IDS } from '../../web/manifest/formula-ids';

/**
 * The published figure table (T1, T3–T7).
 *
 * Each figure is a *split* claim: which definition produced it, which unit it is expressed in,
 * and which snapshots must exist before its value may be published. Those three fields are the
 * difference between "a number" and "a number a reader can attribute", so they are pinned here
 * rather than inferred from the compute function.
 */

const EXPECTED = [
  {
    figureId: 'fig-01',
    definitionId: 'dependency-ratio.international',
    unit: 'ratio',
    requirementSources: [],
  },
  {
    figureId: 'fig-02',
    definitionId: 'pension-expenditure-gdp.international',
    unit: 'percent',
    requirementSources: [],
  },
  {
    figureId: 'fig-03',
    definitionId: 'cohort-return.national',
    unit: 'percent',
    requirementSources: ['ss-average-contribution-pension', 'ine-life-expectancy-at-65'],
  },
  {
    figureId: 'fig-04',
    definitionId: 'implicit-debt.national',
    unit: 'EUR',
    requirementSources: ['airef-obligations', 'fondo-de-reserva'],
  },
  {
    figureId: 'fig-05',
    definitionId: 'required-base-growth.national',
    unit: 'percent',
    requirementSources: [
      'ss-average-contribution-pension',
      'ine-life-expectancy-at-65',
      'ine-population-projection-working-age',
    ],
  },
  {
    figureId: 'fig-06',
    definitionId: 'dependency-ratio.national',
    unit: 'ratio',
    requirementSources: ['ss-pensioners', 'ss-affiliates'],
  },
  {
    figureId: 'fig-07',
    definitionId: 'contribution-cover.national',
    unit: 'ratio',
    requirementSources: ['igae-social-contributions', 'igae-pension-expenditure'],
  },
] as const;

describe('the published figure table', () => {
  it('publishes every figure id, in order, and nothing else', () => {
    expect(FIGURES.map((figure) => figure.figureId)).toEqual([...FIGURE_IDS]);
  });

  it('gives each figure its own definition, unit and required sources', () => {
    for (const expected of EXPECTED) {
      const figure = figureById(expected.figureId);
      if (!figure) throw new Error(`no figure ${expected.figureId}`);

      expect(figure.definitionId, expected.figureId).toBe(expected.definitionId);
      expect(figure.unit, expected.figureId).toBe(expected.unit);
      expect(figure.requirementSources, expected.figureId).toEqual([...expected.requirementSources]);
    }
  });

  it('takes the formula and the geography from the definition it publishes', () => {
    for (const expected of EXPECTED) {
      const figure = figureById(expected.figureId);
      const definition = definitionFor(expected.definitionId);

      expect(figure?.formulaId, expected.figureId).toBe(definition.formulaId);
      expect(FORMULA_IDS).toContain(figure?.formulaId);
      expect(figure?.geography, expected.figureId).toBe(definition.geography);
    }
  });

  it('puts the two international figures first and the national ones after', () => {
    expect(FIGURES.filter((figure) => figure.geography === 'international').map((figure) => figure.figureId)).toEqual([
      'fig-01',
      'fig-02',
    ]);
    expect(FIGURES.filter((figure) => figure.geography === 'national')).toHaveLength(5);
  });

  it('resolves a figure by id and reports an unknown id as absent', () => {
    expect(figureById('fig-04')?.definitionId).toBe('implicit-debt.national');
    expect(figureById('fig-99')).toBeUndefined();
    expect(figureById('')).toBeUndefined();
  });
});
