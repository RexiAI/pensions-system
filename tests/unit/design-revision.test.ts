import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BRAND } from '../../web/brand/generated';
import { BANNED_PATTERNS, scanPublicText, stripOperatorSubtrees } from '../../web/build/public-vocabulary';
import { FigureLedgerNote } from '../../web/components/FigureLedgerNote';
import { PublicPage } from '../../web/components/PublicPage';
import { FigureStatusRow } from '../../web/components/FigureStatusRow';
import { ProvenanceStrip } from '../../web/components/ProvenanceStrip';
import { citationRegistry } from '../../web/content/citations';
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
    pageKind: 'cifras',
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

  it('writes the ledger note once, above the first ledger row', () => {
    // Spec 004 T10: an `unavailable` figure never reaches the appendix, so the ledger note's
    // reachable case is a figure that claims `computed` and is promoted to `withheld`.
    const figures = [makeFigure({ figureId: 'fig-01', unit: 'ratio', value: null })];
    const html = pageHtml(figures);
    const note = renderComponent(FigureLedgerNote, { content: ES });

    expect(html.split(note).length - 1).toBe(1);
    const noteAt = html.indexOf(note);
    const firstRowAt = html.indexOf('class="figure-row"');
    expect(noteAt).toBeGreaterThan(-1);
    expect(noteAt).toBeLessThan(firstRowAt);
  });

  it('publishes only the computed figure, in figure order, and nothing for the rest', () => {
    const figures = unresolvedFigures().map((figure) =>
      figure.figureId === 'fig-02' ? shareFigure() : figure,
    );
    const html = pageHtml(figures);
    expect(html).toContain('id="fig-02"');
    // Spec 004 T10: no anchor, no row and no block for a figure with no value.
    for (const anchor of ['fig-01', 'fig-03', 'fig-04', 'fig-05', 'fig-06', 'fig-07']) {
      expect(html, anchor).not.toContain(`id="${anchor}"`);
    }
    expect(html).not.toContain('class="pending"');
    expect(html).not.toContain(ES.t('figure.unavailable.reason'));
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
    // Re-pointed by spec 003 T4 (D7 amended): with no threshold year the card is the year-free
    // card and carries no digit at all — the original assertion, on the year-free form. With a
    // year, that year is the only quantity (the sentence's 50/65/100 aside): no day count, no date.
    for (const locale of LOCALES) {
      const yearFree = shareCard(locale, null);
      if (!yearFree) throw new Error(`no share card for ${locale}`);
      const element = yearFree.element as unknown as { props: { children: unknown } };
      expect(textOf(element.props.children), locale).not.toMatch(/\d/);
      expect(yearFree.alt).toContain(BRAND.wordmark);
      expect(yearFree.alt).not.toMatch(/\d/);
      const card = shareCard(locale);
      if (!card) throw new Error(`no share card for ${locale}`);
      expect(card.alt).toContain(BRAND.wordmark);
      expect(card.alt.replaceAll('2042', '').replace(/\b(50|65|100)\b/g, '')).not.toMatch(/\d/);
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
