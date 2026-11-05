import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { AgreementSection } from '../../web/components/registers/AgreementSection';
import {
  citationRegistry,
  createCitationRegistry,
  validateContentForPublication,
} from '../../web/content/citations';
import type { Citation, DisputePosition } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DependencyRatioSeriesValue } from '../../web/metrics/dependency-ratio';
import { content, dependencyFigure, makeFigure, renderComponent } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';
import { EMPLOYED_MARKERS, containsAny } from '../helpers/spec-005';
import { sectionOf, textOf } from '../helpers/story';

/**
 * Mutation-killing tests for spec 005 (stage 5a). Every block names the surviving mutant it kills,
 * so a later reader can tell a real gap from a deliberately unpinned variant.
 *
 * These are assertions about behaviour the stage-5a run found untested — never rewrites of an
 * existing test. Where a mutant cannot be killed from any reachable state it is recorded in
 * `specs/005-pension-warning/30-report.md` as equivalent instead of being tested here.
 */

const NOW = Date.parse('2026-10-31T10:00:00Z');

/** A `fig-01` whose value is the committed fixture, with one endpoint replaced. */
function fig01With(override: Partial<DependencyRatioSeriesValue>) {
  const base = dependencyFigure().value as DependencyRatioSeriesValue;
  return makeFigure({ figureId: 'fig-01', unit: 'ratio', value: { ...base, ...override } });
}

function pageWith(figures: readonly ReturnType<typeof fig01With>[]): string {
  return renderComponent(PublicPage, {
    content: content('es'),
    figures,
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series: seriesFixtures(),
    now: new Date(NOW),
  });
}

/** Claim B's own sentence, read from the rendered agreement section. */
function renderedClaimB(locale: Locale, html: string): string {
  const blocks = sectionOf(html, 'data-register="agreement"').split('<div class="claim">').slice(1);
  const matches = blocks.map(textOf).filter((text) => containsAny(text, EMPLOYED_MARKERS[locale]));
  if (matches.length !== 1) {
    throw new Error(`${locale}: expected one rendered employed-person claim, found ${matches.length}`);
  }
  return matches[0] as string;
}

describe('claimVariables: a fig-01 with no first or no latest point', () => {
  /**
   * Kills the four `PublicPage.tsx:73` survivors (`if (first === null || latest === null)` → `if
   * (false)`, `||` → `&&`, and either operand forced to `false`). Without the guard the page reads
   * `.ratio` off a null point and throws, so the assertion cannot pass by accident.
   */
  it('keeps the claim’s placeholders visible when fig-01 publishes no first point', () => {
    const text = renderedClaimB('es', pageWith([fig01With({ first: null })]));
    expect(text).toContain('{first}');
    expect(text).toContain('{latest}');
  });

  it('keeps the claim’s placeholders visible when fig-01 publishes no latest point', () => {
    const text = renderedClaimB('es', pageWith([fig01With({ latest: null })]));
    expect(text).toContain('{latest}');
    expect(text).toContain('{first}');
  });
});

describe('AgreementSection: the register is named', () => {
  /** Kills the `AgreementSection.tsx:25` survivor (`'agreement.label'` → `''`). */
  it('names the section from the content model, so aria-labelledby has a target with text', () => {
    const html = renderComponent(AgreementSection, { content: content('es'), citations: citationRegistry });
    expect(html).toContain(
      `<h2 class="register__label" id="agreement-heading">${content('es').t('agreement.label')}</h2>`,
    );
  });
});

function citation(id: string): Citation {
  return { id, publisher: 'Boletín', document: 'Serie', reference: id, date: '2026-01-01', url: 'https://example.org/serie' };
}

function position(proponent: string, citationId?: string): DisputePosition {
  return { name: proponent, proponent, role: 'Rol', quote: `Cita de ${proponent}.`, citationId };
}

/** Two records that resolve; every other id in these fixtures does not. */
const REGISTRY = createCitationRegistry([citation('cited-a'), citation('cited-b')]);

describe('validateContentForPublication: a dispute position that does not resolve', () => {
  /**
   * Kills the `citations.ts` survivors at L97, L99 and L100 (the `unresolved` filter dropped, its
   * predicate negated or replaced, and its mapper replaced) plus their three no-coverage mutants:
   * the report must name the one position whose citation does not resolve, and only that one.
   */
  it('reports the unresolvable position by dispute and proponent, and leaves the two-sided dispute intact', () => {
    const gate = validateContentForPublication(
      {
        agreement: [],
        disputes: [
          { id: 'triple', positions: [position('Uno', 'cited-a'), position('Dos'), position('Tres', 'cited-b')] },
        ],
      },
      REGISTRY,
    );
    expect(gate).toEqual({ ok: false, failures: [{ unit: 'triple: Dos', reason: 'unresolved-citation' }] });
  });

  /**
   * Kills the `citations.ts:103` survivors (the `resolvable` filter dropped or its predicate
   * replaced) and the `citations.ts:105` survivors (`< 2` forced true, and `<= 2`): losing a
   * position leaves a one-sided dispute, which the gate must also report.
   */
  it('reports the one-sided dispute an unresolvable position leaves behind', () => {
    const gate = validateContentForPublication(
      { agreement: [], disputes: [{ id: 'cuasi', positions: [position('Uno', 'cited-a'), position('Dos')] }] },
      REGISTRY,
    );
    expect(gate).toEqual({
      ok: false,
      failures: [
        { unit: 'cuasi: Dos', reason: 'unresolved-citation' },
        { unit: 'cuasi', reason: 'single-position' },
      ],
    });
  });

  /** The other half of the same pair: a dispute with two resolvable positions raises nothing. */
  it('passes a dispute whose two positions both resolve', () => {
    const gate = validateContentForPublication(
      { agreement: [], disputes: [{ id: 'doble', positions: [position('Uno', 'cited-a'), position('Dos', 'cited-b')] }] },
      REGISTRY,
    );
    expect(gate).toEqual({ ok: true });
  });
});
