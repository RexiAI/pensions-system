import { describe, expect, it } from 'vitest';
import { buildCashflows, cohortIrr, cohortReturn } from '../../web/metrics/cohort-irr';
import type { CohortInput } from '../../web/metrics/cohort-irr';
import { countSignChanges, npv } from '../../web/metrics/npv';
import { definitionFor, internationalRendering } from '../../web/manifest/definitions';
import { FIGURES } from '../../web/ingest/figures';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { renderPlate } from '../fixtures/figures';

const BASE: CohortInput = {
  entryAge: 25,
  retirementAge: 65,
  lifeExpectancyAtRetirement: 20,
  averageMonthlyContribution: 100,
  averageMonthlyPension: 200,
};

describe('cohort return (IRR)', () => {
  it('AC-001-18: the IRR solves NPV to tolerance', () => {
    const input: CohortInput = {
      entryAge: 25,
      retirementAge: 65,
      lifeExpectancyAtRetirement: 20,
      averageMonthlyContribution: 100 / 12,
      averageMonthlyPension: 210 / 14,
    };
    const { flows, annualContribution, annualPension } = buildCashflows(input);
    const rate = cohortIrr(input);

    expect(annualContribution).toBeCloseTo(100, 9);
    expect(annualPension).toBeCloseTo(210, 9);
    expect(rate).not.toBeNull();
    expect(Number.isFinite(rate as number)).toBe(true);
    // 40 x 100 paid in, 20 x 210 drawn out: the unique root is positive.
    expect(rate as number).toBeGreaterThan(0);
    expect(Math.abs(npv(rate as number, flows))).toBeLessThanOrEqual(1e-6);
    // One sign change, so the root is unique.
    expect(countSignChanges(flows)).toBe(1);
  });

  it('AC-001-19: zero benefit years is a -100% return', () => {
    const rate = cohortIrr({ ...BASE, lifeExpectancyAtRetirement: 0 });

    expect(rate).toBe(-1);
  });

  it('AC-001-20: zero contributions is undefined', () => {
    const rate = cohortIrr({ ...BASE, averageMonthlyContribution: 0 });

    expect(rate).toBeNull();
  });

  it('AC-001-21: the sensitivity band contains the central value', () => {
    const result = cohortReturn(BASE);

    expect(result.central).not.toBeNull();
    expect(result.band).not.toBeNull();
    expect(result.band?.min).toBeLessThanOrEqual(result.central as number);
    expect(result.band?.max).toBeGreaterThanOrEqual(result.central as number);
  });

  it('AC-001-22: the IRR increases with the pension', () => {
    const lower = cohortIrr(BASE);
    const higher = cohortIrr({ ...BASE, averageMonthlyPension: BASE.averageMonthlyPension * 1.1 });

    expect(higher as number).toBeGreaterThan(lower as number);
  });

  it('AC-001-23: the IRR decreases with the contribution', () => {
    const lower = cohortIrr(BASE);
    const higher = cohortIrr({ ...BASE, averageMonthlyContribution: BASE.averageMonthlyContribution * 1.1 });

    expect(higher as number).toBeLessThan(lower as number);
  });

  it('AC-001-76: a negative return is computed and reported as negative when flows are inverted', () => {
    const input: CohortInput = {
      entryAge: 25,
      retirementAge: 65,
      lifeExpectancyAtRetirement: 20,
      averageMonthlyContribution: 100 / 12,
      averageMonthlyPension: 150 / 14,
    };
    const { flows, annualContribution, annualPension } = buildCashflows(input);
    const rate = cohortIrr(input);

    expect(annualContribution * 40).toBeGreaterThan(annualPension * 20);
    expect(countSignChanges(flows)).toBe(1);
    expect(rate).not.toBeNull();
    expect(Number.isFinite(rate as number)).toBe(true);
    expect(rate as number).toBeLessThan(0);
    expect(Math.abs(npv(rate as number, flows))).toBeLessThanOrEqual(1e-6);
    // Reported as the negative value itself: never clamped to zero, never undefined.
    expect(rate).not.toBe(0);
    expect(rate).not.toBeNull();
  });

  it('AC-001-21: the cash-flow shape is contribution years then benefit years', () => {
    const cashflows = buildCashflows(BASE);

    expect(cashflows.yearsContributing).toBe(40);
    expect(cashflows.yearsDrawing).toBe(20);
    expect(cashflows.annualContribution).toBe(1200);
    expect(cashflows.annualPension).toBe(2800);
    expect(cashflows.flows).toHaveLength(60);
  });

  it('AC-001-88: no internationally comparable cohort return is presented', () => {
    const published = readDerivedFigures('data/derived');
    const rendering = internationalRendering('cohort-return', published);

    expect(rendering.metric).toBe('cohort-return');
    expect(rendering.definitionId).toBe('cohort-return.national');
    expect(rendering.availability).toBe('unavailable');
    expect(rendering.reason).toContain('no internationally comparable source for average contributions');

    // No internationally comparable IRR figure is published: the only cohort figure carries
    // the national definition and no value at all.
    const cohortFigures = FIGURES.filter(
      (figure) => definitionFor(figure.definitionId).metric === 'cohort-return',
    );
    expect(cohortFigures.length).toBe(1);
    const figure = published.find((entry) => entry.figureId === 'fig-03');
    expect(figure?.definitionId).toBe('cohort-return.national');
    expect(figure?.value).toBeNull();

    // The reason reaches the reader, not only the data contract.
    if (!figure) throw new Error('fig-03 is not published');
    const row = renderPlate(figure, 'en').toLowerCase();
    expect(row).toContain('internationally comparable source for average contributions');
  });
});
