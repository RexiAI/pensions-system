import { describe, expect, it } from 'vitest';
import { PendingBlock, pendingFigures } from '../../web/components/PendingBlock';
import { PublicPage } from '../../web/components/PublicPage';
import { reproduceCommand } from '../../web/components/reproduce-command';
import { citationRegistry } from '../../web/content/citations';
import { FIGURE_KEYS, figureReasonKey } from '../../web/content/keys';
import type { FigureNumber } from '../../web/content/keys';
import { COUNTRY_DOCUMENTS, validateDocument } from '../../web/content/registry';
import { THESIS_TERMS } from '../../web/content/registers';
import { LOCALES } from '../../web/content/types';
import type { DerivedFigure } from '../../web/ingest/types';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { content, renderComponent } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

const FIGURES = readDerivedFigures('data/derived');
const PENDING = pendingFigures(FIGURES);

function page(locale = 'es', figures: readonly DerivedFigure[] = FIGURES): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures,
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series: seriesFixtures(),
  });
}

function block(html: string): string {
  const start = html.indexOf('<section class="pending"');
  if (start === -1) return '';
  const next = html.indexOf('<div class="figure-slot"', start);
  return html.slice(start, next === -1 ? html.indexOf('<div id="debate"', start) : next);
}

/** Visible text: markup and operator-only subtrees dropped, entities decoded. */
function visibleText(html: string): string {
  return decodeText(html.replace(/<details[\s\S]*?<\/details>/g, ' ').replace(/<[^>]+>/g, ' '));
}

const numberOf = (figure: DerivedFigure) => Number(figure.figureId.slice(-1)) as FigureNumber;

describe('AC-003-39: one block holds every unavailable figure', () => {
  it('AC-003-39: exactly one block, headed "5 cifras en preparación" from the data, listing all five', () => {
    expect(PENDING).toHaveLength(5);
    const es = content('es');
    const html = decodeText(page());
    expect(html.split('class="pending"').length - 1).toBe(1);
    const section = block(html);
    expect(section).toContain(es.t('pending.heading.other', { count: '5' }));
    expect(section).toContain('5 cifras en preparación');
    for (const figure of PENDING) {
      const keys = FIGURE_KEYS[numberOf(figure)];
      expect(section, figure.figureId).toContain(`id="${figure.figureId}"`);
      expect(section, figure.figureId).toContain(es.t(keys.title));
      expect(section, figure.figureId).toContain(es.t(keys.definition));
      expect(section, figure.figureId).toContain(es.t(figureReasonKey(numberOf(figure))));
    }
    expect(section.split(`>${es.t('figure.methodLink')}<`).length - 1).toBe(5);
  });
});

describe('AC-003-40: "sin calcular" appears at most once', () => {
  it('AC-003-40: each locale page’s visible text carries its chip string at most once', () => {
    for (const locale of LOCALES) {
      const chip = content(locale).t('figure.unavailable.chip');
      const text = visibleText(page(locale));
      expect(text.split(chip).length - 1, locale).toBeLessThanOrEqual(1);
      expect(text, locale).toContain(chip);
    }
  });
});

describe('AC-003-41: unavailable figures still expose no reproduction', () => {
  it('AC-003-41: the block has no chart, table, digest, command or value', () => {
    const section = block(page());
    for (const absent of ['<svg', '<table', 'plate__value', 'readout', '<code']) expect(section).not.toContain(absent);
    expect(section).not.toMatch(/[0-9a-f]{64}/);
    for (const figure of PENDING) {
      expect(section).not.toContain(figure.manifest.inputHash);
      expect(section).not.toContain(reproduceCommand(figure.manifest, figure.figureId));
    }
  });
});

describe('AC-003-42: the block tracks the data', () => {
  it('AC-003-42: zero unavailable renders nothing; one uses the singular heading', () => {
    const es = content('es');
    expect(renderComponent(PendingBlock, { content: es, figures: [] })).toBe('');
    const one = decodeText(renderComponent(PendingBlock, { content: es, figures: PENDING.slice(0, 1) }));
    expect(one).toContain(es.t('pending.heading.one', { count: '1' }));
    expect(one).toContain('1 cifra en preparación');
    const computedOnly = page('es', FIGURES.filter((figure) => figure.availability === 'computed'));
    expect(computedOnly).not.toContain('class="pending"');
  });
});

describe('AC-003-43: computed figures and registers are unaffected', () => {
  it('AC-003-43: computed plates keep their order and provenance; the block follows them', () => {
    const html = page();
    const one = html.indexOf('id="fig-01"');
    const two = html.indexOf('id="fig-02"');
    const pending = html.indexOf('class="pending"');
    expect(one).toBeGreaterThan(-1);
    expect(two).toBeGreaterThan(one);
    expect(pending).toBeGreaterThan(two);
    expect(html.slice(one, pending).split('class="provenance"').length - 1).toBe(2);
  });

  it('AC-003-43: register headings still match the registers rendered, and the block has no thesis vocabulary', () => {
    for (const document of COUNTRY_DOCUMENTS) {
      expect(validateDocument(document).filter((problem) => problem.code === 'heading-count')).toEqual([]);
    }
    for (const locale of LOCALES) {
      const section = visibleText(block(page(locale))).toLocaleLowerCase();
      for (const term of THESIS_TERMS) expect(section, `${locale}: ${term}`).not.toContain(term);
    }
  });
});
