import { describe, expect, it } from 'vitest';
import { Hero } from '../../web/components/public/Hero';
import { FIGURE_IDS } from '../../web/ingest/types';
import { datasetForUrl, publisherForUrl } from '../../web/sources/labels';
import {
  cohortFigure,
  content,
  makeFigure,
  renderComponent,
  shareValue,
  unresolvedFigures,
} from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

/**
 * The hero's two panels: the four facts beside the number, and the proposition tier's status
 * list. Both are rendered here rather than through the page so the region under assertion is
 * unambiguous — `Fuente` and `Serie` also name columns elsewhere on the site.
 *
 * Two of these assertions need a figure citing two publishers. `makeFigure` defaults to a single
 * source URL, under which the join separators (`', '` and `' · '`) are never emitted at all, so a
 * one-source fixture would assert nothing about them.
 */
const ES = content('es');
const NOW = Date.parse('2041-12-28T20:57:55Z');
const INE = 'https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657?nult=5';
const EUROSTAT = 'https://ec.europa.eu/eurostat/databrowser/view/proj_23np/default/table';

/** The %-of-GDP figure, citing two publishers through two different datasets. */
const TWO_SOURCES = makeFigure({
  figureId: 'fig-02',
  unit: 'percent',
  value: shareValue(),
  sourceUrl: [INE, EUROSTAT],
});

const numericHtml = decodeText(
  renderComponent(Hero, { content: ES, figures: [TWO_SOURCES], countdown: countdownValue(), nowMs: NOW }),
);

/** The `<dl class="hero__subject">` region, which is the only place the four facts render. */
function subjectRegion(html: string): string {
  const at = html.indexOf('class="hero__subject"');
  return html.slice(at, html.indexOf('</dl>', at));
}

function cells(html: string, tag: 'dt' | 'dd'): string[] {
  return [...html.matchAll(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g'))].map((match) =>
    decodeText(match[1] as string).trim(),
  );
}

function regionText(html: string, className: string): string {
  const opener = `class="${className}">`;
  const at = html.indexOf(opener);
  if (at === -1) return '';
  const start = at + opener.length;
  const fragment = html.slice(start, html.indexOf('</p>', start));
  return decodeText(fragment.replace(/<[^>]*>/g, '')).trim();
}

describe('the four facts beside the hero number', () => {
  const subject = subjectRegion(numericHtml);

  it('labels all four facts, in the order the panel reads them', () => {
    expect(cells(subject, 'dt')).toEqual([
      ES.t('hero.definitionLabel'),
      ES.t('hero.periodLabel'),
      ES.t('provenance.source'),
      ES.t('provenance.dataset'),
    ]);
  });

  it('gives every fact a value, none of them empty', () => {
    const values = cells(subject, 'dd');
    expect(values).toHaveLength(4);
    expect(values.filter((value) => value === '')).toEqual([]);
  });

  it('joins the publishers with a comma and the datasets with a middot', () => {
    expect(cells(subject, 'dd')[2]).toBe(`${publisherForUrl(INE)}, ${publisherForUrl(EUROSTAT)}`);
    expect(cells(subject, 'dd')[3]).toBe(`${datasetForUrl(INE)} · ${datasetForUrl(EUROSTAT)}`);
  });

  it('stamps the snapshot with its label, a space, and the date the instant carries', () => {
    const iso = TWO_SOURCES.manifest.fetchedAt;
    // The full instant is the machine-readable attribute; the visible text is its calendar date.
    expect(regionText(numericHtml, 'site-header__stamp')).toBe(
      `${ES.t('hero.snapshotLabel')} ${iso.slice(0, 10)}`,
    );
    expect(numericHtml).toContain(`<time dateTime="${iso}">${iso.slice(0, 10)}</time>`);
  });
});

describe('the proposition tier’s status list', () => {
  // The two internationally comparable figures are unavailable, so the ladder falls through to
  // the proposition; exactly one of the remaining figures is computed, which is what makes the
  // count in the summary observable at all.
  const figures = unresolvedFigures().map((figure) =>
    figure.figureId === 'fig-03' ? cohortFigure() : figure,
  );
  const propositionHtml = decodeText(
    renderComponent(Hero, { content: ES, figures, countdown: countdownValue(), nowMs: NOW }),
  );

  it('links every row to its own figure’s anchor', () => {
    const hrefs = [...propositionHtml.matchAll(/<li class="hero__status-row"><a href="([^"]*)"/g)].map(
      (match) => match[1],
    );
    expect(hrefs).toEqual(FIGURE_IDS.map((figureId) => `#${figureId}`));
  });

  it('counts only the figures that are actually computed', () => {
    expect(regionText(propositionHtml, 'hero__status-count')).toBe(
      ES.t('figure.statusSummary', { total: 7, computed: 1 }),
    );
  });

  it('still renders the countdown when the tier has one', () => {
    // The proposition tier's countdown slot is guarded by `countdown === undefined`; rendering an
    // empty slot while the projection exists drops the page's primary quantity from the fold.
    expect(propositionHtml).toContain('class="countdown"');
    const withoutCountdown = renderComponent(Hero, { content: ES, figures, nowMs: NOW });
    expect(withoutCountdown).not.toContain('class="countdown"');
  });
});
