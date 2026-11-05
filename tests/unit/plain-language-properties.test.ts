import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  BANNED_TOP_TERMS,
  scanTopRegion,
  topRegionOf,
} from '../../web/build/public-plain-language';

/**
 * Property tests for the plain-language gate.
 *
 * The acceptance suite pins the gate at hand-picked examples — the shipped pages in five locales,
 * one banned phrase, one `aria-label`, one operator subtree. Those examples prove the shape; they
 * cannot prove the gate is *sound* (never accuses clean copy) or *complete* (never lets a term
 * through) across arbitrary text, and both failures are silent: a gate that misses a term ships
 * jargon, a gate that invents a hit blocks a good build. The generators below therefore constrain
 * the filler to characters that cannot spell any term (punctuation and digits only), so a hit can
 * only come from the value the property injected.
 */

/** Characters that cannot appear in any banned term or repository identifier. */
const CLEAN = fc.constantFrom(' ', '.', '·', '-', '(', ')', '/', '+', '|', '#', '%', ',', ':', '0', '1', '7');

/** Filler text that can spell nothing: no letters, so no term can hide in it. */
const cleanText = fc.array(CLEAN, { maxLength: 24 }).map((characters) => characters.join(''));

/** A top region: what `topRegionOf` isolates, with the filler inside it. */
function regionOf(filler: string): string {
  return `<main id="main"><section data-top-step="number">${filler}</section></main>`;
}

/** The story marker that ends the region — everything after it is out of the gate's scope. */
const STRIP = '<div class="story__strip"></div>';

/** Any one of the terms the gate must refuse. */
const bannedTerm = fc.constantFrom(...BANNED_TOP_TERMS);

/** A repository identifier shaped like the ones `internalTermsOf` returns. */
const identifier = fc.stringMatching(/^[a-z][a-z0-9_]{2,9}$/);

describe('the plain-language gate is sound (property tests)', () => {
  it('never reports a hit for a story that spells no term at all', () => {
    fc.assert(
      fc.property(cleanText, (filler) => {
        expect(scanTopRegion(regionOf(filler), 'es')).toEqual([]);
      }),
    );
  });

  it('never reports a hit for a banned term outside the story region', () => {
    // Precision lives below the story by design: `#metodo` is allowed to name its own sources, so
    // the gate must scope to the region and not to the document. A gate that scanned the whole
    // page would fail every build that kept its precision, which is the one thing T8 forbids.
    fc.assert(
      fc.property(cleanText, bannedTerm, (filler, term) => {
        const page = `${regionOf(filler).replace('</main>', STRIP)}${term}`;
        expect(topRegionOf(page)).not.toContain(term);
        expect(scanTopRegion(page, 'es')).toEqual([]);
      }),
    );
  });

  it('never reports a term hidden inside an operator subtree', () => {
    fc.assert(
      fc.property(bannedTerm, (term) => {
        const page = `<main id="main"><section data-top-step="number"><details data-operator="true">${term}</details></section>${STRIP}`;
        expect(scanTopRegion(page, 'es')).toEqual([]);
      }),
    );
  });
});

describe('the plain-language gate is complete (property tests)', () => {
  it('reports any banned term wherever it lands in the story', () => {
    fc.assert(
      fc.property(cleanText, cleanText, bannedTerm, (before, after, term) => {
        const hits = scanTopRegion(regionOf(`${before}${term}${after}`), 'es');
        expect(hits.map((hit) => hit.term)).toContain(term.toLowerCase());
        expect(hits[0]?.context).toContain(term);
      }),
    );
  });

  it('matches a banned term in any letter case', () => {
    fc.assert(
      fc.property(cleanText, bannedTerm, (filler, term) => {
        const hits = scanTopRegion(regionOf(`${filler}${term.toUpperCase()}${filler}`), 'es');
        expect(hits.map((hit) => hit.term)).toContain(term.toLowerCase());
      }),
    );
  });

  it('reports any identifier the committed data carries', () => {
    fc.assert(
      fc.property(cleanText, cleanText, identifier, (before, after, term) => {
        const hits = scanTopRegion(regionOf(`${before}${term}${after}`), 'es', [term]);
        expect(hits.map((hit) => hit.term)).toContain(term);
      }),
    );
  });
});

describe('the region the gate scans is a slice of the document (property tests)', () => {
  it('returns a substring of its input, never a longer or invented one', () => {
    fc.assert(
      fc.property(fc.string(), (html) => {
        const region = topRegionOf(html);
        expect(html.includes(region)).toBe(true);
        expect(region.length).toBeLessThanOrEqual(html.length);
      }),
    );
  });

  it('returns nothing when the document has no main element to start from', () => {
    fc.assert(
      fc.property(fc.string(), (html) => {
        fc.pre(!html.includes('<main'));
        expect(topRegionOf(html)).toBe('');
      }),
    );
  });
});
