import { describe, expect, it } from 'vitest';
import { FIGURE_IDS } from '../../web/ingest/types';
import type { DerivedFigure } from '../../web/ingest/types';
import { LOCALES } from '../../web/content/types';
import { dependencyFigure, makeFigure, PLATE_FIXTURES, shareFigure } from '../fixtures/figures';
import { cifrasPage } from '../helpers/story';

/** The seven computed plates: the six grammars plus the national dependency figure. */
function sevenFigures(): DerivedFigure[] {
  return [
    ...PLATE_FIXTURES.map((fixture) => fixture()),
    makeFigure({ figureId: 'fig-06', unit: 'ratio', value: dependencyFigure().value }),
  ];
}

/**
 * AC-007-08 — Cifras owns the seven plates (spec 007 T3).
 */
describe('AC-007-08: Cifras renders the seven figure plates and one h1, nothing else', () => {
  it('AC-007-08: #figuras holds the seven computed plates in figure order', () => {
    const html = cifrasPage('es', { figures: sevenFigures() });
    const region = html.slice(html.indexOf('id="figuras"'), html.indexOf('class="pager"'));
    const plates = [...region.matchAll(/<figure class="plate" id="(fig-0\d)"/g)].map((match) => match[1]);
    expect(plates).toEqual([...FIGURE_IDS]);
    expect(html.split('<h1').length - 1).toBe(1);
  });

  it('AC-007-08: an unavailable or withheld figure keeps its state treatment', () => {
    const unavailable = makeFigure({ figureId: 'fig-06', unit: 'ratio', value: null, availability: 'unavailable' });
    const withheld = makeFigure({ figureId: 'fig-01', unit: 'ratio', value: null, availability: 'computed' });
    const html = cifrasPage('es', { figures: [withheld, unavailable, shareFigure()] });
    const region = html.slice(html.indexOf('id="figuras"'), html.indexOf('class="pager"'));
    expect(region).toContain('class="figure-row"');
    expect(region).toContain('class="plate"');
    expect(region).toContain('data-state="withheld"');
  });

  it('AC-007-08: no story, no method, no register, no reproduce, no ledger', () => {
    for (const locale of LOCALES) {
      const html = cifrasPage(locale);
      expect(html, locale).not.toContain('data-top-step');
      expect(html, locale).not.toContain('id="metodo"');
      expect(html, locale).not.toContain('data-register');
      expect(html, locale).not.toContain('class="reproduce"');
      expect(html, locale).not.toContain('class="assumptions"');
    }
  });

  it('AC-007-08: the page’s own #figuras resolves and no in-page href dangles', () => {
    const html = cifrasPage('es');
    expect(html.split('id="figuras"').length - 1).toBe(1);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const target of [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1])) {
      expect(ids.has(target), `#${target}`).toBe(true);
    }
  });
});
