import { describe, expect, it } from 'vitest';
import { stripOperatorSubtrees } from '../../web/build/public-vocabulary';
import { RegisterKey } from '../../web/components/public/RegisterKey';
import { REGISTER_ROWS } from '../../web/content/registers';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { content, renderComponent } from '../fixtures/figures';
import { claimA, claimB, committedPage, reading, renderedClaim } from '../helpers/spec-005';
import { sectionOf, sectionRangeOf } from '../helpers/story';
import { decodeText } from '../helpers/render-document';

function occurrences(haystack: string, needle: string): number[] {
  const found: number[] = [];
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    found.push(index);
    index = haystack.indexOf(needle, index + needle.length);
  }
  return found;
}

function claimTexts(locale: Locale): string[] {
  const claims = content(locale).editorial.agreement;
  return [renderedClaim(locale, claimA(locale, claims)), renderedClaim(locale, claimB(locale, claims))];
}

describe('AC-005-28: the fact occurs once, and only under the facts register', () => {
  it('AC-005-28: each mechanism claim appears once, inside agreement and nowhere else', () => {
    for (const locale of LOCALES) {
      const html = decodeText(committedPage(locale, undefined, 'debate'));
      const agreement = sectionRangeOf(html, 'data-register="agreement"');
      const thesis = sectionRangeOf(html, 'data-register="thesis"');
      const dispute = sectionRangeOf(html, 'data-register="dispute"');
      const storyEnd = html.indexOf('class="story__strip"');
      for (const text of claimTexts(locale)) {
        const found = occurrences(html, text);
        expect(found.length, `${locale}: "${text}"`).toBe(1);
        const offset = found[0] ?? -1;
        expect(offset, `${locale}: inside agreement`).toBeGreaterThan(agreement.start);
        expect(offset, `${locale}: inside agreement`).toBeLessThan(agreement.end);
        expect(offset, `${locale}: inside thesis`).not.toBeGreaterThan(thesis.start);
        expect(offset, `${locale}: inside dispute`).not.toBeGreaterThan(dispute.start);
        expect(offset, `${locale}: inside a top step`).toBeGreaterThan(storyEnd);
      }
    }
  });
});

describe('AC-005-29: the judgement occurs once, and only under the opinion register', () => {
  it('AC-005-29: the reading appears once, inside thesis and nowhere else', () => {
    for (const locale of LOCALES) {
      const html = decodeText(committedPage(locale, undefined, 'debate'));
      const text = reading(locale, content(locale).editorial.thesis);
      const agreement = sectionRangeOf(html, 'data-register="agreement"');
      const dispute = sectionRangeOf(html, 'data-register="dispute"');
      const thesis = sectionRangeOf(html, 'data-register="thesis"');
      const found = occurrences(html, text);
      expect(found.length, locale).toBe(1);
      const offset = found[0] ?? -1;
      expect(offset, `${locale}: inside thesis`).toBeGreaterThan(thesis.start);
      expect(offset, `${locale}: inside thesis`).toBeLessThan(thesis.end);
      expect(offset, `${locale}: inside agreement`).toBeGreaterThan(agreement.end);
      expect(offset, `${locale}: inside dispute`).toBeGreaterThan(dispute.end);
      expect(offset, `${locale}: inside a top step`).toBeGreaterThan(html.indexOf('class="story__strip"'));
    }
  });
});

describe('AC-005-30: the facts carry their citation, the opinion does not', () => {
  it('AC-005-30: one chip per claim, and the thesis has none', () => {
    for (const locale of LOCALES) {
      const html = decodeText(committedPage(locale, undefined, 'debate'));
      const agreement = sectionOf(html, 'data-register="agreement"');
      const blocks = agreement.split('<div class="claim">').slice(1);
      expect(blocks.length, locale).toBe(content(locale).editorial.agreement.length);
      for (const [index, block] of blocks.entries()) {
        expect(block.split('citation__chip').length - 1, `${locale} claim ${index}`).toBe(1);
      }
      const thesis = sectionOf(html, 'data-register="thesis"');
      expect(thesis.split('citation__chip').length - 1, locale).toBe(0);
      expect(/class="citation"/.test(thesis), locale).toBe(false);
    }
  });
});

describe('AC-005-31: the registers keep their structure', () => {
  it('AC-005-31: one section each, in order, after #debate, with the key count intact', () => {
    for (const locale of LOCALES) {
      const html = decodeText(committedPage(locale, undefined, 'debate'));
      for (const marker of ['data-register="agreement"', 'data-register="dispute"', 'data-register="thesis"']) {
        expect(html.split(marker).length - 1, `${locale}: ${marker}`).toBe(1);
      }
      const agreement = html.indexOf('data-register="agreement"');
      const dispute = html.indexOf('data-register="dispute"');
      const thesis = html.indexOf('data-register="thesis"');
      const debate = html.indexOf('id="debate"');
      expect(agreement, locale).toBeGreaterThan(debate);
      expect(dispute, locale).toBeGreaterThan(agreement);
      expect(thesis, locale).toBeGreaterThan(dispute);

      const key = renderComponent(RegisterKey, { content: content(locale) });
      expect(key.split('class="register-key__row"').length - 1, locale).toBe(REGISTER_ROWS.length);
      expect(key, locale).toContain(content(locale).t('register.key.heading', { count: REGISTER_ROWS.length }));
    }
  });

  it('AC-005-31: no claim and no reading sits inside an operator-only subtree', () => {
    for (const locale of LOCALES) {
      const html = decodeText(committedPage(locale, undefined, 'debate'));
      const visible = stripOperatorSubtrees(html);
      for (const text of claimTexts(locale)) expect(visible, `${locale}: claim`).toContain(text);
      expect(visible, `${locale}: reading`).toContain(reading(locale, content(locale).editorial.thesis));
    }
  });
});
