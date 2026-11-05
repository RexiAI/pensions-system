import { describe, expect, it } from 'vitest';
import { SubjectFacts } from '../../web/components/public/SubjectFacts';
import { content, makeFigure, renderComponent, shareValue } from '../fixtures/figures';
import { datasetForUrl, publisherForUrl } from '../../web/sources/labels';
import { decodeText } from '../helpers/render-document';

/**
 * The four facts a plate is read with, beside the plate they belong to (spec 004 T12).
 *
 * These assertions used to target the hero panel's `<dl class="hero__subject">`; the panel is
 * gone and the facts moved into `#figuras`, so they are asserted against the component that
 * renders them rather than through a region of the page. Two of them need a figure citing two
 * publishers: `makeFigure` defaults to a single source URL, under which the join separators
 * (`', '` and `' · '`) are never emitted at all, so a one-source fixture would assert nothing
 * about them.
 */
const ES = content('es');
const INE = 'https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657?nult=5';
const EUROSTAT = 'https://ec.europa.eu/eurostat/databrowser/view/proj_23np/default/table';

const TWO_SOURCES = makeFigure({
  figureId: 'fig-02',
  unit: 'percent',
  value: shareValue(),
  sourceUrl: [INE, EUROSTAT],
});

const html = decodeText(renderComponent(SubjectFacts, { content: ES, figure: TWO_SOURCES }));

function cells(markup: string, tag: 'dt' | 'dd'): string[] {
  return [...markup.matchAll(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g'))].map((match) =>
    decodeText(match[1] as string).trim(),
  );
}

describe('the four facts beside a plate', () => {
  it('labels all four facts, in the order they are read', () => {
    expect(cells(html, 'dt')).toEqual([
      ES.t('hero.definitionLabel'),
      ES.t('hero.periodLabel'),
      ES.t('provenance.source'),
      ES.t('provenance.dataset'),
    ]);
  });

  it('gives every fact a value, none of them empty', () => {
    const values = cells(html, 'dd');
    expect(values).toHaveLength(4);
    expect(values.filter((value) => value === '')).toEqual([]);
  });

  it('joins the publishers with a comma and the datasets with a middot', () => {
    expect(cells(html, 'dd')[2]).toBe(`${publisherForUrl(INE)}, ${publisherForUrl(EUROSTAT)}`);
    expect(cells(html, 'dd')[3]).toBe(`${datasetForUrl(INE)} · ${datasetForUrl(EUROSTAT)}`);
  });

  it('names the definition the figure publishes, never the ladder’s order', () => {
    expect(cells(html, 'dd')[0]).toBe(ES.t('fig.02.definition'));
  });

  it('states the period the series covers, from its own points', () => {
    expect(cells(html, 'dd')[1]).toBe('1995-2024');
  });
});
