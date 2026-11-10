import { describe, expect, it } from 'vitest';
import { formatValue } from '../../web/content/format';
import { interpolate } from '../../web/content/types';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DependencyRatioSeriesValue } from '../../web/metrics/dependency-ratio';
import { content, dependencyFigure } from '../fixtures/figures';
import { debatePage } from '../helpers/story';
import { decodeText } from '../helpers/render-document';

function renderedClaim(locale: Locale, text: string): string {
  const value = dependencyFigure().value as DependencyRatioSeriesValue;
  return interpolate(text, {
    first: formatValue(value.first?.ratio ?? null, 'ratio', locale, ''),
    latest: formatValue(value.latest?.ratio ?? null, 'ratio', locale, ''),
  });
}

/**
 * AC-007-10 — Debate owns the three registers, in order, with both anchors (spec 007 T5).
 */
describe('AC-007-10: Debate renders the three registers with #debate and #lectura intact', () => {
  it('AC-007-10: agreement, then dispute, then thesis; each data-register exactly once', () => {
    for (const locale of LOCALES) {
      const html = debatePage(locale);
      const agreement = html.indexOf('data-register="agreement"');
      const dispute = html.indexOf('data-register="dispute"');
      const thesis = html.indexOf('data-register="thesis"');
      expect(agreement, locale).toBeGreaterThan(-1);
      expect(dispute, locale).toBeGreaterThan(agreement);
      expect(thesis, locale).toBeGreaterThan(dispute);
      for (const register of ['agreement', 'dispute', 'thesis']) {
        expect(html.split(`data-register="${register}"`).length - 1, `${locale}: ${register}`).toBe(1);
      }
    }
  });

  it('AC-007-10: #debate wraps agreement and dispute, #lectura wraps the thesis', () => {
    for (const locale of LOCALES) {
      const html = debatePage(locale);
      const debate = html.indexOf('id="debate"');
      const lectura = html.indexOf('id="lectura"');
      const agreement = html.indexOf('data-register="agreement"');
      const dispute = html.indexOf('data-register="dispute"');
      const thesis = html.indexOf('data-register="thesis"');
      expect(debate, locale).toBeGreaterThan(-1);
      expect(lectura, locale).toBeGreaterThan(-1);
      expect(agreement, locale).toBeGreaterThan(debate);
      expect(dispute, locale).toBeGreaterThan(agreement);
      expect(dispute, locale).toBeLessThan(lectura);
      expect(thesis, locale).toBeGreaterThan(lectura);
    }
  });

  it('AC-007-10: one h1 and none of the other pages’ regions', () => {
    for (const locale of LOCALES) {
      const html = debatePage(locale);
      expect(html.split('<h1').length - 1, locale).toBe(1);
      expect(html, locale).not.toContain('data-top-step');
      expect(html, locale).not.toContain('class="plate"');
      expect(html, locale).not.toContain('id="metodo"');
      expect(html, locale).not.toContain('class="reproduce"');
      expect(html, locale).not.toContain('class="assumptions"');
    }
  });

  it('AC-007-10: the register copy is the editorial’s own, unchanged', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const html = decodeText(debatePage(locale));
      for (const claim of local.editorial.agreement) {
        expect(html, `${locale}: ${claim.text.slice(0, 24)}`).toContain(renderedClaim(locale, claim.text));
      }
      for (const dispute of local.editorial.disputes) {
        for (const position of dispute.positions) {
          expect(html, `${locale}: ${position.quote.slice(0, 24)}`).toContain(position.quote);
        }
      }
      expect(html, locale).toContain(local.editorial.thesis.statement);
      for (const paragraph of local.editorial.thesis.paragraphs) {
        expect(html, `${locale}: ${paragraph.slice(0, 24)}`).toContain(paragraph);
      }
    }
  });
});
