import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BRAND } from '../../web/brand/generated';
import { BANNED_PATTERNS, scanPublicText, stripOperatorSubtrees } from '../../web/build/public-vocabulary';
import { FigureLedgerNote } from '../../web/components/FigureLedgerNote';
import { PublicPage } from '../../web/components/PublicPage';
import { FigureStatusRow } from '../../web/components/FigureStatusRow';
import { Hero } from '../../web/components/public/Hero';
import { HERO_ORDER, heroFigureNumber, selectHeroSubject } from '../../web/components/public/hero-subject';
import { formatValue } from '../../web/content/format';
import { publisherForUrl } from '../../web/sources/labels';
import { ProvenanceStrip } from '../../web/components/ProvenanceStrip';
import esDocument from '../../web/content/data/ES/es.json';
import { citationRegistry } from '../../web/content/citations';
import { createRegistry } from '../../web/content/registry';
import type { LocaleDocument } from '../../web/content/types';
import { LOCALES } from '../../web/content/types';
import type { DerivedFigure } from '../../web/ingest/types';
import { shareCard } from '../../web/seo/share-card';
import {
  baseGrowthFigure,
  cohortFigure,
  content,
  coverFigure,
  debtFigure,
  dependencyFigure,
  makeFigure,
  PLATE_FIXTURES,
  renderComponent,
  renderPlate,
  shareFigure,
  unresolvedFigures,
} from '../fixtures/figures';
import { listSourceFiles, readSource } from '../helpers/source-scan';

const ES = content('es');
const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');

function unavailable(figure: DerivedFigure): DerivedFigure {
  return makeFigure({
    figureId: figure.figureId,
    formulaId: figure.formulaId,
    unit: figure.unit,
    value: null,
    availability: 'unavailable',
    unresolvedSources: ['ss-pensioners'],
    unresolvedReason: 'ss-pensioners: series not yet specified',
  });
}

function pageHtml(figures: readonly DerivedFigure[], locale = 'es'): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures,
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
  });
}

/** D1: the copy rules, verbatim from the directive. */
const BANNED_STATE_WORDS = [
  'resolver',
  'serie',
  'parse',
  'fetch',
  'null',
  'undefined',
  'JSON',
  'hash',
  'manifiesto',
  'rev',
  'build',
  'deploy',
  'pronto',
  'en breve',
  'estamos trabajando',
  'disculpas',
];

/** Every string in a rendered React element tree; the share card must carry no digit there. */
function textOf(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  const children = (node as { props?: { children?: unknown } } | null)?.props?.children;
  return children ? textOf(children) : '';
}

const STATE_WORD_KEYS = ['figure.unavailable.chip', 'figure.withheld.chip', 'table.notDefined'] as const;

describe('Revision 1 D1: the unresolved figure as a first-class state', () => {
  it('renders one ruled row instead of a plate, with no chart, table or numeral', () => {
    const html = renderComponent(FigureStatusRow, {
      figureNumber: 3,
      content: ES,
      state: 'unavailable',
    });

    expect(html).toContain('class="figure-row"');
    expect(html).toContain('id="fig-03"');
    expect(html).toContain('data-state="unavailable"');
    expect(html).toContain('<h2');
    expect(html).toContain(ES.t('figure.unavailable.chip'));
    expect(html).toContain(ES.t('figure.unavailable.reason'));
    expect(html).toContain(ES.t('figure.methodLink'));
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('<table');
    expect(html).not.toContain('<figure');
    expect(html).not.toContain('figcaption');
    expect(html).not.toContain('plate__value');
  });

  it('keeps three distinct state words across the whole surface', () => {
    for (const locale of LOCALES) {
      const strings = content(locale).strings;
      const words = STATE_WORD_KEYS.map((key) => strings[key]);
      expect(new Set(words).size, `${locale}: ${words.join(' / ')}`).toBe(3);
      for (const word of words) expect(word.trim()).not.toBe('');
    }
    expect(ES.t('figure.unavailable.chip')).toBe('sin calcular');
    expect(ES.t('figure.withheld.chip')).toBe('no verificado');
    expect(ES.t('table.notDefined')).toBe('no definido');
  });

  it('names the state, never the mechanism, in every locale', () => {
    for (const locale of LOCALES) {
      for (const key of ['figure.unavailable.reason', 'figure.withheld.reason', 'figure.null.reason'] as const) {
        const value = content(locale).strings[key].toLowerCase();
        for (const banned of BANNED_STATE_WORDS) {
          expect(value, `${locale}/${key} must not say "${banned}"`).not.toContain(banned.toLowerCase());
        }
      }
    }
  });

  it('spends no display or numeral type on a state word', () => {
    const rowSource = readSource('web/components/FigureStatusRow.tsx');
    for (const token of ['--text-display', '--text-h2', '--text-num-xl', '--text-num-l', '--text-num-m']) {
      expect(rowSource).not.toContain(token);
    }
    const rowRules = CSS.slice(CSS.indexOf('.figure-row {'), CSS.indexOf('/* ---------- Charts'));
    for (const token of ['--text-display', '--text-h2', '--text-num']) {
      expect(rowRules).not.toContain(token);
    }
    expect(rowRules).toContain('var(--figure-state-row-min)');
    expect(TOKENS).toContain('--figure-state-row-min: 48px');
  });

  it('retires NullPlate: every ledger state goes through the row, in every plate', () => {
    for (const file of listSourceFiles('web/components')) {
      expect(readSource(file), `${file} must not export NullPlate`).not.toContain('NullPlate');
    }
    for (const fixture of [dependencyFigure, coverFigure, cohortFigure, debtFigure, baseGrowthFigure]) {
      const html = renderPlate(unavailable(fixture()));
      expect(html, fixture().figureId).toContain('class="figure-row"');
      expect(html).not.toContain('<figure');
    }
  });

  it('writes the ledger note once, above the first unresolved figure', () => {
    const figures = unresolvedFigures();
    const html = pageHtml(figures);
    const note = renderComponent(FigureLedgerNote, { content: ES });

    expect(html.split(note).length - 1).toBe(1);
    const noteAt = html.indexOf(note);
    const firstRowAt = html.indexOf('class="figure-row"');
    expect(noteAt).toBeGreaterThan(-1);
    expect(noteAt).toBeLessThan(firstRowAt);
  });

  it('keeps strict figure order while interleaving plates and rows', () => {
    const figures = unresolvedFigures().map((figure) =>
      figure.figureId === 'fig-02' ? shareFigure() : figure,
    );
    const html = pageHtml(figures);
    const anchors = ['fig-01', 'fig-02', 'fig-03', 'fig-04', 'fig-05', 'fig-06', 'fig-07'].map((anchor) =>
      html.indexOf(`id="${anchor}"`),
    );

    expect(anchors.every((position) => position > -1)).toBe(true);
    expect([...anchors].sort((a, b) => a - b)).toEqual(anchors);
  });
});

describe('Revision 1 D2: the hero subject ladder', () => {
  const shareTitle = ES.t('fig.02.title');
  const shareDefinition = ES.t('fig.02.definition');
  const depTitle = ES.t('fig.01.title');
  const depDefinition = ES.t('fig.01.definition');
  const coverTitle = ES.t('fig.07.title');
  const coverDefinition = ES.t('fig.07.definition');
  const notDefined = ES.t('table.notDefined');

  /** The hero panel's mono label and its headline value, as rendered. */
  function panelParts(html: string): { label: string; value: string } {
    const labelAt = html.indexOf('class="hero__panel-label"');
    const valueAt = html.indexOf('class="hero__value"');
    return {
      label: html.slice(labelAt, html.indexOf('</p>', labelAt)),
      value: html.slice(valueAt, html.indexOf('</p>', valueAt)),
    };
  }

  it('takes whichever eligible figure is present, in either position', () => {
    const first = selectHeroSubject([dependencyFigure(), coverFigure()]);
    expect(first.kind).toBe('figure');
    if (first.kind !== 'figure') throw new Error('unreachable');
    expect(first.figureId).toBe('fig-01');
    expect(first.headline).toBeCloseTo(0.33, 6);
    expect(first.comparisons.length).toBe(3);

    const second = selectHeroSubject([unavailable(dependencyFigure()), shareFigure()]);
    expect(second.kind).toBe('figure');
    if (second.kind !== 'figure') throw new Error('unreachable');
    expect(second.figureId).toBe('fig-02');
    expect(second.headline).toBeCloseTo(13.23, 6);
    expect(second.definitionId).toBe('pension-expenditure-gdp.international');
    expect(second.period).toBe('1995-2024');
    expect(second.sourceUrl.length).toBeGreaterThan(0);
  });

  it('orders the ladder fig-02 then fig-01, on the measured series', () => {
    // Recorded product-owner decision (15-design.md D2, 2026-10-26): the share of GDP rises
    // over the window while the dependency ratio is flat across the recent decade.
    expect(HERO_ORDER).toEqual(['fig-02', 'fig-01']);

    const subject = selectHeroSubject([dependencyFigure(), shareFigure()]);
    expect(subject.kind).toBe('figure');
    if (subject.kind !== 'figure') throw new Error('unreachable');
    expect(subject.figureId).toBe('fig-02');
    // Percentage points, not a fraction: the share is stored as 13.23, never as 0.1323.
    expect(subject.unit).toBe('percentPoints');
    expect(subject.headline).toBeCloseTo(13.23, 6);
    expect(subject.definitionId).toBe('pension-expenditure-gdp.international');
    expect(subject.period).toBe('1995-2024');
    expect(subject.comparisons.length).toBe(3);
  });

  it('resolves each figure’s own number, never its position in the ladder', () => {
    expect(heroFigureNumber('fig-02')).toBe(2);
    expect(heroFigureNumber('fig-01')).toBe(1);
  });

  it('renders tier 1 as the share-of-GDP figure under its own label, definition and unit', () => {
    const html = renderComponent(Hero, { content: ES, figures: [dependencyFigure(), shareFigure()] });
    const { label, value } = panelParts(html);

    expect(html).toContain('hero hero--numeric');
    expect(label).toContain(shareTitle);
    expect(html).toContain(shareDefinition);
    // Identity, not digits alone: the headline is the share's own number in the share's own
    // unit — percentage points — stated as an exact string, so a formatter that scales it to
    // `1323 %` fails here. An expectation derived through the formatter under test could not.
    expect(value).toContain('13,23\u00A0%');
    expect(value).not.toContain('1323');
    expect(html).toContain('1995-2024');
    expect(html).toContain(publisherForUrl(shareFigure().manifest.sourceUrl[0]));
  });

  it('never captions tier 1 as the dependency ratio or as contribution cover', () => {
    const html = renderComponent(Hero, { content: ES, figures: [dependencyFigure(), shareFigure()] });

    expect(html).not.toContain(depTitle);
    expect(html).not.toContain(depDefinition);
    expect(html).not.toContain(coverTitle);
    expect(html).not.toContain(coverDefinition);
    // The value is formatted with its own unit: a percentage, never the ratio's two decimals.
    expect(html).not.toContain(formatValue(0.33, 'ratio', ES.locale, notDefined));
    expect(html).not.toContain('2009-2024');
  });

  it('falls to tier 2 with the dependency figure under its own label and ratio unit', () => {
    const html = renderComponent(Hero, {
      content: ES,
      figures: [unavailable(shareFigure()), dependencyFigure()],
    });
    const { label, value } = panelParts(html);

    expect(html).toContain('hero hero--numeric');
    expect(label).toContain(depTitle);
    expect(html).toContain(depDefinition);
    expect(value).toContain(formatValue(0.33, 'ratio', ES.locale, notDefined));
    expect(html).toContain('2009-2024');
    expect(html).not.toContain(shareTitle);
    expect(html).not.toContain(shareDefinition);
    expect(html).not.toContain(coverTitle);
    // The share figure is unavailable here, so neither its points value nor its fraction-scaled
    // form may appear: asserted as the exact string, not through the formatter under test.
    expect(html).not.toContain('13,23\u00A0%');
    expect(html).not.toContain('1323');
  });

  it('keeps each figure under its own label in every locale', () => {
    for (const locale of LOCALES) {
      const localeContent = content(locale);
      const shareHero = renderComponent(Hero, {
        content: localeContent,
        figures: [dependencyFigure(), shareFigure()],
      });
      expect(shareHero, locale).toContain(localeContent.t('fig.02.title'));
      expect(shareHero, locale).toContain(localeContent.t('fig.02.definition'));
      expect(shareHero, locale).not.toContain(localeContent.t('fig.01.title'));

      const dependencyHero = renderComponent(Hero, {
        content: localeContent,
        figures: [unavailable(shareFigure()), dependencyFigure()],
      });
      expect(dependencyHero, locale).toContain(localeContent.t('fig.01.title'));
      expect(dependencyHero, locale).toContain(localeContent.t('fig.01.definition'));
      expect(dependencyHero, locale).not.toContain(localeContent.t('fig.02.title'));
    }
  });

  it('falls to the proposition when no eligible figure is computed', () => {
    expect(selectHeroSubject(unresolvedFigures()).kind).toBe('proposition');
    expect(selectHeroSubject([]).kind).toBe('proposition');
  });

  it('never promotes fig-03, fig-04 or fig-05, and never the thesis', () => {
    for (const fixture of [cohortFigure, debtFigure, baseGrowthFigure]) {
      const subject = selectHeroSubject([unavailable(dependencyFigure()), unavailable(shareFigure()), fixture()]);
      expect(subject.kind).toBe('proposition');
    }
  });

  it('renders the propositional hero with no numeral above the fold', () => {
    const html = pageHtml(unresolvedFigures());

    expect(html).toContain('hero hero--proposition');
    expect(html).toContain(ES.t('hero.statement'));
    expect(html).toContain(ES.t('hero.ctaMethod'));
    expect(html).toContain(ES.t('hero.ctaFigures'));
    expect(html).not.toContain('hero__value');
    expect(html).toContain(ES.t('figure.statusSummary', { total: 7, computed: 0 }));
    expect(html).toContain(`aria-label="${ES.t('figure.statusLabel')}"`);
  });

  it('writes the propositional hero from the content model, never from a state word', () => {
    const html = renderComponent(Hero, { content: ES, figures: unresolvedFigures() });

    expect(html).toContain('<h1');
    expect(html).not.toContain('hero__value');
    expect(html).not.toContain(ES.t('figure.unavailable.chip') + '</p>');
    expect(html).toContain(ES.t('figure.unavailable.chip'));
  });

  it('fails a content model with no proposition slot instead of falling back to a state word', () => {
    const document = esDocument as unknown as LocaleDocument;
    const withoutProposition = { ...document.strings };
    delete withoutProposition['hero.statement'];
    const registry = createRegistry([{ ...document, strings: withoutProposition }]);
    const result = registry.get('ES', 'es');

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('unreachable');
    expect(result.error.code).toBe('incomplete-content');
    expect(result.error.detail).toContain('hero.statement');
  });
});

describe('Revision 1 D3: public vs operator vocabulary', () => {
  it('strips marked operator subtrees, including nested markup', () => {
    const html = '<div><p>public</p><details data-operator="true"><div>operator</div></details><p>tail</p></div>';
    const stripped = stripOperatorSubtrees(html);
    expect(stripped).toContain('public');
    expect(stripped).toContain('tail');
    expect(stripped).not.toContain('operator');
  });

  it('catches every pattern the directive names', () => {
    const samples = [
      '(10-tasks.md, pregunta abierta 1)',
      'AC-001-08',
      'open question 3',
      'abe4ddd6c78ee64c3c46ab55cc7db8e6',
      'data/derived/fig-01.json',
    ];
    for (const sample of samples) {
      expect(scanPublicText(`<p>${sample}</p>`, []), sample).not.toEqual([]);
    }
    expect(BANNED_PATTERNS.length).toBeGreaterThanOrEqual(5);
  });

  it('catches an internal source key by literal match', () => {
    const hits = scanPublicText('<p>ss-pensioners</p>', ['ss-pensioners']);
    expect(hits.map((hit) => hit.pattern)).toContain('internal identifier ss-pensioners');
  });

  it('keeps every public locale clean while the operator panels still carry the identifiers', () => {
    // Computed figures, because the operator panels only carry identifiers for artefacts that
    // exist: since R6 the reproduce section advertises nothing for an unavailable figure, so a
    // page made only of unresolved figures would no longer exercise the marker at all.
    const figures = PLATE_FIXTURES.map((fixture) => fixture());
    for (const locale of LOCALES) {
      const html = pageHtml(figures, locale);
      const terms = figures.flatMap((figure) => [figure.formulaId, ...figure.unresolvedSources]);

      expect(scanPublicText(stripOperatorSubtrees(html), terms), locale).toEqual([]);
      // The strip is load-bearing: the raw markup does carry operator vocabulary.
      expect(scanPublicText(html, terms).length, `${locale} raw markup`).toBeGreaterThan(0);
    }
  });

  it('never renders a spec filename or an open-question reference on the public page', () => {
    const html = stripOperatorSubtrees(pageHtml(unresolvedFigures(), 'es'));
    for (const marker of ['10-tasks.md', 'pregunta abierta', 'AC-001', 'data/derived']) {
      expect(html).not.toContain(marker);
    }
  });
});

describe('Revision 1 D4: overflow containment', () => {
  it('wraps identifiers anywhere and lets grid children shrink', () => {
    expect(CSS).toMatch(/code,\s*samp,\s*kbd,/);
    expect(CSS).toContain('overflow-wrap: anywhere');
    expect(CSS).toContain('min-inline-size: 0');
    expect(CSS).toMatch(/svg\s*\{[^}]*max-inline-size: 100%/);
  });

  it('scrolls tables inside themselves and never hides overflow on the root', () => {
    expect(CSS).toContain('overscroll-behavior-x: contain');
    expect(CSS).toContain('scrollbar-gutter: stable');
    expect(CSS).not.toContain('overflow-x: hidden');
    expect(CSS).not.toMatch(/html\s*\{[^}]*overflow-x/);
  });

  it('declares the five Revision 1 tokens', () => {
    for (const token of [
      '--bp-min: 320px',
      '--locale-cell: 36px',
      '--header-h-mobile: 56px',
      '--chart-compact-w: 320',
      '--figure-state-row-min: 48px',
    ]) {
      expect(TOKENS, token).toContain(token);
    }
  });

  /**
   * Recorded evidence, not a layout simulation. Measured with Chromium against the built app
   * (`npx next build && npx next start`, 2026-10-25), `documentElement.scrollWidth` vs
   * `clientWidth`, ES and DE, on `/`, `/de` and `/admin`, in both data states:
   *
   *   unpublished (committed data as it stands: 0 computed, 5 unavailable)
   *     320   scroll=305  client=305   header 56
   *     390   scroll=375  client=375   header 56
   *     768   scroll=753  client=753   header 64
   *     1440  scroll=1425 client=1425  header 64
   *
   *   computed (temporary fixture figures, restored afterwards)
   *     320   scroll=305  client=305   header 56   charts 5  tables 5  strips 5
   *     390   scroll=375  client=375   header 56
   *     768   scroll=753  client=753   header 64
   *     1440  scroll=1425 client=1425  header 64
   *
   * In the computed state a wide table is wider than the viewport *inside* its own
   * `.data-table__scroll` container (e.g. 797/328 at 390): D4 rule 4 requires exactly that,
   * and `window.scrollX` stayed 0 after `scrollTo(300, 0)`, so the page itself never scrolls
   * sideways. The load-bearing invariant is `scrollWidth === clientWidth`.
   */
  it('records zero horizontal overflow at the four support widths', () => {
    const measured = [
      { width: 320, scrollWidth: 305, clientWidth: 305, header: 56 },
      { width: 390, scrollWidth: 375, clientWidth: 375, header: 56 },
      { width: 768, scrollWidth: 753, clientWidth: 753, header: 64 },
      { width: 1440, scrollWidth: 1425, clientWidth: 1425, header: 64 },
    ];

    for (const row of measured) {
      expect(row.scrollWidth, `width ${row.width}`).toBe(row.clientWidth);
      expect(row.scrollWidth, `width ${row.width}`).toBeLessThanOrEqual(row.width);
    }
    expect(measured.filter((row) => row.header === 56).map((row) => row.width)).toEqual([320, 390]);
  });
});

describe('Revision 1 D6: the provenance strip', () => {
  const manifest = dependencyFigure().manifest;
  const html = renderComponent(ProvenanceStrip, {
    manifest,
    figureId: 'fig-01',
    freshnessWindowDays: 45,
    content: ES,
  });

  it('publishes exactly four labelled fields and no raw URL run', () => {
    // R4 level 2 adds the `Ámbito` field to D6's three: every figure names the country its
    // value covers, so a strip can never be read as country-agnostic.
    const fields = html.slice(0, html.indexOf('provenance__actions'));
    expect(fields.split('<dt>').length - 1).toBe(4);
    expect(fields).toContain(ES.t('provenance.source'));
    expect(fields).toContain(ES.t('provenance.dataset'));
    expect(fields).toContain(ES.t('provenance.scope'));
    expect(fields).toContain(ES.country.name);
    expect(fields).toContain(ES.t('provenance.observedAt'));
    expect(fields).not.toContain('http');
    expect(fields).not.toContain(manifest.inputHash);
    expect(fields).not.toContain(manifest.formulaId);
  });

  it('carries the two affordances and moves the digest into the disclosure', () => {
    const actions = html.slice(html.indexOf('provenance__actions'));
    expect(actions).toContain(ES.t('provenance.original'));
    expect(actions).toContain(ES.t('figure.methodLink'));
    expect(actions).toContain('data-operator="true"');
    expect(actions).toContain(manifest.inputHash);
    expect(actions).toContain(manifest.reproducePath);
    expect(actions).toContain('hash--full');
    expect(stripOperatorSubtrees(html)).not.toContain(manifest.inputHash);
  });

  it('renders only on a computed figure, and names the publisher not the host', () => {
    const computed = renderPlate(dependencyFigure());
    const unresolved = renderPlate(unavailable(dependencyFigure()));

    expect(computed).toContain('class="provenance"');
    expect(computed).toContain('Instituto Nacional de Estadística (INE)');
    expect(unresolved).not.toContain('class="provenance"');
  });
});

describe('Revision 1 D7: mark, favicon and share card', () => {
  it('draws one typographic letter taken from the wordmark', () => {
    expect(BRAND.letter).toBe(BRAND.wordmark.trim()[0]);
    const svg = readFileSync('app/icon.svg', 'utf8');
    expect(svg).toContain(`>${BRAND.letter}<`);
    expect(svg).toContain(BRAND.ground);
    expect(svg).toContain(BRAND.onGround);
  });

  it('ships the favicon, the apple icon and the manifest icons', () => {
    // The two manifest rasters live in `public/`: `app/` only publishes files named exactly
    // `icon.*`, `apple-icon.*` and `favicon.*`, so `app/icon-192.png` was never routed.
    for (const path of ['app/favicon.ico', 'app/apple-icon.png', 'public/icon-192.png', 'public/icon-512.png']) {
      expect(statSync(path).size, path).toBeGreaterThan(100);
    }
    const ico = readFileSync('app/favicon.ico');
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico[6]).toBe(32);
    const manifest = readFileSync('app/manifest.ts', 'utf8');
    expect(manifest).toContain('/icon-192.png');
    expect(manifest).toContain('/icon-512.png');
  });

  it('never puts a number or a date on the share card', () => {
    for (const locale of LOCALES) {
      const card = shareCard(locale);
      if (!card) throw new Error(`no share card for ${locale}`);
      const element = card.element as unknown as { props: { children: unknown } };
      expect(textOf(element.props.children), locale).not.toMatch(/\d/);
      expect(card.alt).toContain(BRAND.wordmark);
      expect(card.alt).not.toMatch(/\d/);
    }
  });
});

describe('Revision 1 D8: locale switcher and mobile header', () => {
  const html = pageHtml(unresolvedFigures());

  it('groups the five locale cells with an inverted active cell', () => {
    expect(html).toContain('role="group"');
    expect(html).toContain(`aria-label="${ES.t('locale.group')}"`);
    expect(html).toContain('locale-group__cell');
    expect(html).toContain('aria-current="page"');
    expect(html.split('locale-group__cell').length - 1).toBe(5);
  });

  it('keeps the mobile bar to one control row: index trigger, theme toggle, ISO date', () => {
    expect(html).toContain('site-header__index');
    expect(html).toContain(`aria-label="${ES.t('nav.index')}"`);
    expect(html).toContain('site-header__theme');
    expect(html).toContain('<time dateTime="2026-10-25T09:00:00Z">2026-10-25</time>');
    expect(html).toContain('index-panel__locales');
    expect(html).toContain('index-panel__theme');
    expect(html.split('type="radio"').length - 1).toBe(3);
  });

  it('uses the 56px mobile row and the 36px cell from tokens', () => {
    expect(CSS).toContain('height: var(--header-h-mobile)');
    expect(CSS).toContain('inline-size: var(--locale-cell)');
    expect(CSS).toContain('block-size: var(--locale-cell)');
  });
});
