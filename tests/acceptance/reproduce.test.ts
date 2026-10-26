import { describe, expect, it } from 'vitest';
import { ReproduceBlock } from '../../web/components/public/ReproduceBlock';
import { reproduceCommand, seriesReproduceCommand } from '../../web/components/reproduce-command';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import type { DerivedFigure } from '../../web/ingest/types';
import { content, renderComponent } from '../fixtures/figures';
import { countdownSeries, pyramidSeries, seriesFixtures } from '../fixtures/series';
import { readSource } from '../helpers/source-scan';

const ES = content('es');
const FIGURES = readDerivedFigures('data/derived');
const SERIES = seriesFixtures();

function render(figures: readonly DerivedFigure[], series = SERIES): string {
  return renderComponent(ReproduceBlock, { content: ES, figures, series });
}

function rowCount(html: string): number {
  return html.split('class="reproduce__row"').length - 1;
}

const computed = FIGURES.filter((figure) => figure.availability === 'computed');
const unavailable = FIGURES.filter((figure) => figure.availability === 'unavailable');

describe('AC-001-105: only computed figures and series are advertised as reproducible', () => {
  it('AC-001-105: a row exists only for a computed figure or series', () => {
    const html = render(FIGURES);
    expect(computed.length).toBe(2);
    expect(unavailable.length).toBe(5);
    expect(rowCount(html)).toBe(computed.length + SERIES.filter((entry) => entry.availability === 'computed').length);
  });

  it('AC-001-105: the count line matches reality, from the data', () => {
    const html = render(FIGURES);
    expect(html).toContain(ES.t('reproduce.count.figures', { count: 2 }));
    expect(html).toContain(ES.t('reproduce.count.series', { count: 2 }));
  });

  it('AC-001-105: no digest and no command is rendered for an unavailable figure', () => {
    const html = render(FIGURES);
    for (const figure of unavailable) {
      expect(html, figure.figureId).not.toContain(figure.manifest.inputHash);
      expect(html, figure.figureId).not.toContain(reproduceCommand(figure.manifest, figure.figureId));
    }
    for (const figure of computed) {
      expect(html, figure.figureId).toContain(figure.manifest.inputHash);
      expect(html, figure.figureId).toContain(reproduceCommand(figure.manifest, figure.figureId));
    }
  });

  it('AC-001-105: the omitted line counts the unavailable figures and disappears at zero', () => {
    const html = render(FIGURES);
    const expected = ES.t('reproduce.omitted', { unavailable: '5', total: '7' });
    expect(html).toContain(expected);

    const allComputed = render(computed);
    expect(allComputed).not.toContain('reproduce__omitted');
  });

  it('AC-001-105: the derived series get their own group with their own commands', () => {
    const html = render(FIGURES);
    for (const entry of SERIES) {
      expect(html, entry.seriesId).toContain(seriesReproduceCommand(entry.manifest, entry.seriesId));
      expect(html, entry.seriesId).toContain(entry.manifest.inputHash);
    }
    expect(html).toContain(ES.t('series.pyramid.title'));
    expect(html).toContain(ES.t('series.countdown.title'));
  });

  it('AC-001-105: row labels come from an id-to-key lookup, never from the id string', () => {
    const source = readSource('web/components/public/ReproduceBlock.tsx');
    expect(source).not.toContain('slice(-1)');
    expect(source).not.toContain('Number(');

    const html = render(FIGURES);
    for (const figure of computed) {
      const keys = figure.figureId.replace('fig-0', 'fig.0');
      expect(html, figure.figureId).toContain(ES.t(`${keys}.title` as never));
    }
  });

  it('AC-001-105: a single computed figure reads in the singular', () => {
    const html = render([computed[0] as DerivedFigure], []);
    expect(html).toContain(ES.t('reproduce.count.figure', { count: 1 }));
    expect(html).toContain(ES.t('reproduce.count.series', { count: 0 }));
  });

  it('AC-001-105: an unavailable series advertises nothing either', () => {
    const html = render(FIGURES, [
      { ...pyramidSeries(), availability: 'unavailable', value: null },
      countdownSeries(),
    ]);
    expect(html).not.toContain(ES.t('series.pyramid.title'));
    expect(html).toContain(ES.t('reproduce.count.serie', { count: 1 }));
  });

  it('AC-001-105: an unknown id never invents a label or a command', () => {
    const stranger = { ...(computed[0] as DerivedFigure), figureId: 'fig-09' as never };
    const html = render([stranger], []);
    expect(html).toContain('fig-09');
    expect(rowCount(html)).toBe(1);
  });

  it('AC-001-105: the section stays operator vocabulary', () => {
    const html = render(FIGURES);
    expect(html).toContain('data-operator="true"');
  });
});
