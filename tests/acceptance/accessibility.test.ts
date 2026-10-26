import { describe, expect, it } from 'vitest';
import { formatValue } from '../../web/content/format';
import type { DerivedFigure } from '../../web/ingest/types';
import type { CohortReturnValue } from '../../web/metrics/cohort-irr';
import type { ImplicitDebtValue } from '../../web/metrics/implicit-debt';
import type { BaseGrowthFigureValue } from '../../web/metrics/required-base-growth';
import {
  baseGrowthFigure,
  cohortFigure,
  content,
  coverFigure,
  debtFigure,
  dependencyFigure,
  makeFigure,
  renderPlate,
  shareFigure,
  unavailable,
} from '../fixtures/figures';

const ES = content('es');
const ratio = (value: number) => formatValue(value, 'ratio', 'es', '');
const percent = (value: number) => formatValue(value, 'percent', 'es', '');
const money = (value: number) => formatValue(value, 'currencyMinor', 'es', '');
const integer = (value: number) => formatValue(value, 'integer', 'es', '');
const years = (value: number) => formatValue(value, 'years', 'es', '');

/**
 * The fig-02 share is percentage **points** (AC-001-86), stated as an exact string rather than
 * derived through the formatter under test: an expectation computed by the same function that
 * scales its input cannot fail when it scales its input, which is how `1323 %` shipped green.
 */
const SHARE_POINTS = '13,23\u00A0%';

function tablePart(html: string): string {
  const start = html.indexOf('<details class="data-table"');
  return start === -1 ? '' : html.slice(start);
}

function svgPart(html: string): string {
  const start = html.indexOf('<svg');
  const end = html.indexOf('</svg>');
  return start === -1 || end === -1 ? '' : html.slice(start, end);
}

function readoutPart(html: string, number: number): string {
  const start = html.indexOf(`id="fig-0${number}-readout"`);
  return start === -1 ? '' : html.slice(start, html.indexOf('</dl>', start));
}

interface Case {
  label: string;
  figure: DerivedFigure;
  number: number;
  headline: string;
  chartValues: string[];
  tableValues: string[];
}

const cohort = cohortFigure();
const cohortValue = cohort.value as CohortReturnValue;
const debt = debtFigure();
const debtValue = debt.value as ImplicitDebtValue;
const growth = baseGrowthFigure();
const growthValue = growth.value as BaseGrowthFigureValue;
const growthGaps = growthValue.grid.map((cell) => cell.gap);

const CASES: Case[] = [
  {
    label: 'fig-01 dependency ratio',
    figure: dependencyFigure(),
    number: 1,
    headline: ratio(0.33),
    chartValues: [ratio(0.33)],
    tableValues: [integer(7_059_353), integer(21_300_000), ratio(0.33)],
  },
  {
    label: 'fig-02 pension expenditure as % of GDP',
    figure: shareFigure(),
    number: 2,
    headline: SHARE_POINTS,
    chartValues: [SHARE_POINTS],
    tableValues: ['2024', SHARE_POINTS],
  },
  {
    label: 'fig-03 cohort return',
    figure: cohort,
    number: 3,
    headline: percent(cohortValue.central as number),
    chartValues: [percent(cohortValue.central as number)],
    tableValues: [years(20), integer(40), percent(cohortValue.central as number)],
  },
  {
    label: 'fig-04 implicit debt',
    figure: debt,
    number: 4,
    headline: money(debtValue.byRate['0.01'] as number),
    chartValues: [money(debtValue.byRate['0.01'] as number)],
    tableValues: [percent(0.04), money(500_000_00)],
  },
  {
    label: 'fig-07 contribution cover',
    figure: coverFigure(),
    number: 7,
    headline: ratio(0.88),
    chartValues: [ratio(0.88)],
    tableValues: [ratio(0.88), money(160_000_000_00)],
  },
  {
    label: 'fig-05 required base growth',
    figure: growth,
    number: 5,
    headline: percent(growthValue.central.gRequired),
    chartValues: [percent(growthValue.central.gRequired)],
    tableValues: [percent(0.01), percent(Math.min(...growthGaps))],
  },
];

describe('accessibility: non-visual data for charts', () => {
  it('AC-001-44: when a chart renders, it renders non-visual data with the same values', () => {
    for (const testCase of CASES) {
      const html = renderPlate(testCase.figure);
      const table = tablePart(html);

      expect(html, testCase.label).toContain('<svg');
      expect(table, testCase.label).not.toBe('');
      expect(table, testCase.label).toContain('<caption>');
      for (const value of testCase.tableValues) {
        expect(table, `${testCase.label} table must carry ${value}`).toContain(value);
      }
      for (const value of testCase.chartValues) {
        expect(svgPart(html), `${testCase.label} chart must carry ${value}`).toContain(value);
      }
    }
  });

  it('AC-001-44: a table is emitted if and only if a chart is emitted', () => {
    const chartedButTableless = makeFigure({
      figureId: 'fig-03',
      formulaId: 'cohort-irr.v1',
      unit: 'percent',
      value: { ...cohortValue, band: null } as CohortReturnValue,
    });
    const html = renderPlate(chartedButTableless);

    expect(html).toContain('<svg');
    expect(tablePart(html)).toBe('');

    for (const testCase of CASES) {
      const plate = renderPlate(testCase.figure);
      expect(plate.includes('<svg'), testCase.label).toBe(tablePart(plate) !== '');
    }
  });

  it('AC-001-45: when a chart renders, the data is exposed with an accessible name and role', () => {
    for (const testCase of CASES) {
      const html = renderPlate(testCase.figure);
      const number = testCase.number;

      expect(html, testCase.label).toContain('role="img"');
      expect(html).toContain(`aria-labelledby="fig-0${number}-title"`);
      expect(html).toContain(`id="fig-0${number}-title"`);
      expect(html).toContain(`aria-describedby="fig-0${number}-readout"`);

      const table = tablePart(html);
      expect(table).toContain('<caption>');
      expect(table).toContain('scope="col"');
      expect(table).toContain('scope="row"');
      expect(table).toContain('role="region"');
      expect(table).toContain('tabindex="0"');

      expect(readoutPart(html, number), testCase.label).toContain(testCase.headline);
    }
  });

  it('AC-001-75: an unresolved figure renders no chart and no table, deliberately', () => {
    const unavailableFigure = unavailable(dependencyFigure());
    const withheld: DerivedFigure = {
      ...dependencyFigure(),
      availability: 'computed',
      value: null,
      unresolvedReason: 'manifest did not validate',
    };

    for (const figure of [unavailableFigure, withheld]) {
      const html = renderPlate(figure);

      expect(html).toContain('data-state=');
      expect(html).not.toContain('<svg');
      expect(html).not.toContain('<table');
      expect(html).not.toContain('<details class="data-table"');
      expect(html).not.toContain('role="img"');
      expect(html).not.toContain('aria-live');
      expect(html).not.toContain('<figcaption');
    }

    const row = renderPlate(unavailableFigure);
    // A level-2 heading naming the figure, one sentence, one method link. Nothing else.
    expect(row).toContain('<h2');
    expect(row).toContain('id="fig-01-title"');
    expect(row).toContain(ES.t('fig.01.title'));
    expect(row.includes(ES.t('figure.unavailable.reason')) || row.includes(ES.t('figure.withheld.reason'))).toBe(
      true,
    );
    expect(row).toContain(ES.t('figure.methodLink'));
    expect(row).toContain('href="#metodo"');
  });
});
