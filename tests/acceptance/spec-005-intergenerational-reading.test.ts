import { describe, expect, it } from 'vitest';
import { thesisVocabularyLocations, thesisVocabularyOutsideThesis } from '../../web/content/registers';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { sectionOf, sectionRangeOf, storyOf } from '../helpers/story';
import {
  TOMORROW_WORKERS_MARKERS,
  claimA,
  claimB,
  committedPage,
  containsAny,
  reading,
  readingCandidates,
  renderedClaim,
} from '../helpers/spec-005';
import { decodeText } from '../helpers/render-document';

const NON_CONTRIBUTION = [
  'no cotizaron',
  'no han cotizado',
  'did not contribute',
  'never contributed',
  "n'ont pas cotisé",
  'nicht eingezahlt',
  'non hanno contribuito',
  'nunca cotiz',
  'never paid',
  'jamais payé',
  'jamais cotisé',
  'nie gezahlt',
  'mai versato',
];

function thesisHtml(locale: Locale): string {
  return sectionOf(decodeText(committedPage(locale)), 'data-register="thesis"');
}

describe('AC-005-23: exactly one piece of prose carries the reading', () => {
  it('AC-005-23: one candidate per locale, and equal paragraph counts', () => {
    const paragraphs = new Set<number>();
    for (const locale of LOCALES) {
      const thesis = content(locale).editorial.thesis;
      paragraphs.add(thesis.paragraphs.length);
      const candidates = readingCandidates(locale, thesis);
      expect(candidates.length, `${locale}: ${candidates.length} matches`).toBe(1);
    }
    expect(paragraphs.size).toBe(1);
  });
});

describe('AC-005-24: it says where the weight falls, on both sides of the transfer', () => {
  it('AC-005-24: the Spanish reading names today and tomorrow, and no locale copies another', () => {
    const readings = LOCALES.map((locale) => reading(locale, content(locale).editorial.thesis));
    expect(readings[0]).toContain('hoy');
    expect(containsAny(readings[0] ?? '', TOMORROW_WORKERS_MARKERS.es)).toBe(true);
    expect(new Set(readings).size).toBe(LOCALES.length);
    for (const [index, text] of readings.entries()) {
      expect(text, LOCALES[index]).not.toMatch(/\d/);
    }
  });
});

describe('AC-005-25: it is labelled as the page’s reading, not as a measurement', () => {
  it('AC-005-25: the reading sits inside the thesis, after its disclaimer, under its label', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const html = decodeText(committedPage(locale));
      const { start: sectionStart, end: sectionEnd } = sectionRangeOf(html, 'data-register="thesis"');
      const readingText = reading(locale, local.editorial.thesis);
      const offset = html.indexOf(readingText);
      expect(offset, locale).toBeGreaterThan(sectionStart);
      expect(offset, locale).toBeLessThan(sectionEnd);
      expect(offset, `${locale}: after the disclaimer`).toBeGreaterThan(html.indexOf('thesis__disclaimer'));
      const thesis = thesisHtml(locale);
      expect(thesis, locale).toContain(local.t('thesis.label'));
      expect(thesis, locale).toContain('thesis__statement');
      expect(thesis, locale).toContain('thesis__disclaimer');
      expect(thesis, locale).toContain('thesis__signature');
    }
  });
});

describe('AC-005-26: it does not accuse a cohort of not having paid in', () => {
  it('AC-005-26: no denial of contribution and no fact restated inside the thesis', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const readingText = reading(locale, local.editorial.thesis).toLocaleLowerCase();
      for (const phrase of NON_CONTRIBUTION) {
        expect(readingText, `${locale}: "${phrase}"`).not.toContain(phrase);
      }
      const thesis = thesisHtml(locale);
      const claims = local.editorial.agreement;
      expect(thesis, `${locale}: claim A`).not.toContain(renderedClaim(locale, claimA(locale, claims)));
      expect(thesis, `${locale}: claim B`).not.toContain(renderedClaim(locale, claimB(locale, claims)));
    }
  });
});

describe('AC-005-27: the thesis keeps its structure and its vocabulary boundary', () => {
  it('AC-005-27: vocabulary boundary holds, and the reading stays out of the story and figures', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      expect(thesisVocabularyLocations(local.editorial).length, locale).toBeGreaterThan(0);
      expect(thesisVocabularyOutsideThesis(local.strings, local.editorial), locale).toEqual([]);
      const html = decodeText(committedPage(locale));
      const readingText = reading(locale, local.editorial.thesis);
      expect(storyOf(html), `${locale}: in the story`).not.toContain(readingText);
      const figuresStart = html.indexOf('id="figuras"');
      const debateStart = html.indexOf('id="debate"');
      expect(figuresStart, locale).toBeGreaterThan(-1);
      expect(html.slice(figuresStart, debateStart), `${locale}: between figures and debate`).not.toContain(readingText);
      const thesisStart = sectionRangeOf(html, 'data-register="thesis"').start;
      expect(thesisStart, `${locale}: thesis after the debate`).toBeGreaterThan(debateStart);
    }
  });
});
