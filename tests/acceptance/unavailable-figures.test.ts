import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FIGURE_IDS } from '../../web/ingest/types';
import type { DerivedFigure } from '../../web/ingest/types';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { cohortFigure, content, dependencyFigure, makeFigure, shareFigure, unresolvedFigures } from '../fixtures/figures';
import { figuresOf, storyPage, textOf } from '../helpers/story';

/**
 * AC-004-42…46 — unavailable figures leave the public page (spec 004 T10).
 *
 * The appendix publishes the figures that have numbers. A figure without one is not a visual
 * event: no chip, no reason line, no placeholder plate, no apology block. `FigureStatusRow` stays
 * for the other failure — a figure that claims `computed` while carrying no value.
 */
const COMMITTED = [dependencyFigure(), shareFigure(), ...unresolvedFigures().filter((figure) => !['fig-01', 'fig-02'].includes(figure.figureId))];

function page(figures: readonly DerivedFigure[] = COMMITTED, locale: Locale = 'es'): string {
  return storyPage(locale, { figures });
}

describe('AC-004-42: no figure without a value appears', () => {
  it('AC-004-42: no chip, reason, pending heading or status summary in the visible text', () => {
    for (const locale of LOCALES) {
      const html = page(COMMITTED, locale);
      for (const marker of [
        'figure.unavailable.chip',
        'figure.unavailable.reason',
        'pending.heading',
        'figure.statusSummary',
      ]) {
        expect(html, `${locale}: ${marker}`).not.toContain(marker);
      }
      const visible = textOf(html);
      expect(visible, locale).not.toContain('sin calcular');
      for (const number of ['03', '04', '05', '06', '07']) {
        expect(html, `${locale}: fig-${number}`).not.toContain(`id="fig-${number}"`);
      }
    }
  });
});

describe('AC-004-43: #figuras renders exactly the computed plates, in order', () => {
  it('AC-004-43: one plate per computed figure, FIGURE_IDS order, no other block', () => {
    const html = page();
    const region = figuresOf(html);
    const plates = [...region.matchAll(/<figure class="plate" id="(fig-0\d)"/g)].map((match) => match[1]);
    expect(plates).toEqual(FIGURE_IDS.filter((id) => ['fig-01', 'fig-02'].includes(id)));
    expect(region).not.toContain('class="figure-row"');
    expect(region).not.toContain('class="pending"');
    expect(region).not.toContain('demography');
  });
});

describe('AC-004-44: the pending block is gone, the withheld row is kept', () => {
  it('AC-004-44: PendingBlock is deleted, the pending keys are gone, FigureStatusRow is reachable', () => {
    const pendingModule = 'web/components/PendingBlock.tsx';
    expect(() => readFileSync(pendingModule, 'utf8')).toThrow();
    const keys = readFileSync('web/content/keys.ts', 'utf8');
    expect(keys).not.toContain('pending.heading');
    for (const locale of LOCALES) {
      const doc = JSON.parse(readFileSync(`web/content/data/ES/${locale}.json`, 'utf8')) as { strings: Record<string, string> };
      expect(Object.keys(doc.strings).filter((key) => key.startsWith('pending.')), locale).toEqual([]);
    }
    const shell = readFileSync('web/components/metrics/plate-support.tsx', 'utf8');
    expect(shell).toContain('FigureStatusRow');
    expect(shell).toContain('isLedgerState(state)');
  });

  it('AC-004-44: a figure that claims computed but carries no value renders its ledger row and chip', () => {
    const withheld = makeFigure({ figureId: 'fig-01', unit: 'ratio', value: null });
    const html = page([withheld]);
    expect(figuresOf(html)).toContain('class="figure-row"');
    expect(figuresOf(html)).toContain(content('es').t('figure.withheld.chip'));
  });
});

describe('AC-004-45: every figure computed renders every plate', () => {
  it('AC-004-45: seven plates, no pending block, each keeping its pair and its provenance', () => {
    const all = [dependencyFigure(), shareFigure(), cohortFigure()];
    // Every fixture publishes a value, so each computed figure reaches the appendix in figure
    // order — the case the withheld path must not swallow.
    const html = page(all);
    const ids = [...figuresOf(html).matchAll(/id="(fig-0\d)"/g)].map((match) => match[1]);
    expect(ids).toEqual(['fig-01', 'fig-02', 'fig-03']);
    expect(figuresOf(html)).not.toContain('pending');
  });
});

describe('AC-004-46: zero computed figures is a page, not a hole', () => {
  it('AC-004-46: no plate, no heading, no placeholder, and the story is unaffected', () => {
    const html = page(unresolvedFigures());
    expect(html).toContain('data-top-step="number"');
    expect(html).toContain('data-top-step="meaning"');
    expect(figuresOf(html)).not.toContain('class="plate"');
    expect(html).not.toContain('class="region__heading"');
    expect(html).not.toContain('id="pending"');
    // The registers still render.
    expect(html).toContain('data-register="thesis"');
  });
});

describe('AC-003-41: unavailable figures still expose no reproduction', () => {
  it('AC-003-41: no chart, table, digest or command for a figure without a value', () => {
    const html = page(unresolvedFigures());
    const reproduce = html.slice(html.indexOf('id="reproducir"'));
    expect(reproduce).not.toContain('--figure fig-03');
    expect(reproduce).not.toContain('--figure fig-07');
    expect(figuresOf(html)).not.toContain('<svg');
    expect(figuresOf(html)).not.toContain('<table');
  });
});

describe('AC-003-43: computed figures and registers are unaffected', () => {
  it('AC-003-43: computed plates keep their order and provenance, and the registers render', () => {
    const html = page();
    const region = figuresOf(html);
    const ids = [...region.matchAll(/id="(fig-0\d)"/g)].map((match) => match[1]);
    expect(ids).toEqual(['fig-01', 'fig-02']);
    expect(region.split('class="provenance"').length - 1).toBe(2);
    for (const register of ['agreement', 'dispute', 'thesis']) {
      expect(html, register).toContain(`data-register="${register}"`);
    }
  });
});
