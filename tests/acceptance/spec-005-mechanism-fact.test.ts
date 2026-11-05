import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { citationRegistry, resolveClaims } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { thesisVocabularyOutsideThesis } from '../../web/content/registers';
import { FIGURE_IDS } from '../../web/ingest/types';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { content } from '../fixtures/figures';
import { figuresOf, sectionOf, textOf } from '../helpers/story';
import {
  EMPLOYED_MARKERS,
  claimA,
  claimB,
  committedFig01,
  committedPage,
  containsAny,
  fig01Numerals,
  renderedClaim,
} from '../helpers/spec-005';
import { decodeText } from '../helpers/render-document';

const SHIPPED_DISPUTE_DIGESTS: Record<Locale, string> = {
  es: '13664be5e36495f1',
  en: '660ede8cc7a02ea4',
  fr: '545577fc6b017334',
  de: '5aa69640c6107c12',
  it: '6cab58e77764be1e',
};

const SHIPPED_CITATION_IDS = [
  'ine-tabla-27150',
  'ine-proyecciones-36643',
  'eurostat-spr-exp-pens',
  'ss-estadisticas-pensiones',
  'igae-cuentas-ss',
  'airef-proyecciones',
];

const SUFFICIENCY = ['suficiente', 'cubre todo', 'enough', 'covers the whole', 'suffit', 'deckt', 'basta'];
const COHORT = ['65', 'mayores', 'older', 'âgé', 'ältere', 'anziani'];
const THESIS_TERMS = ['pirámide', 'piramide', 'pyramid', 'pyramide', 'fraude', 'fraud', 'estafa', 'betrug'];

function agreementHtml(locale: Locale): string {
  return decodeText(sectionOf(committedPage(locale), 'data-register="agreement"'));
}

/** A claim block's own sentence: its first `<p>`, before the citation panel's digits. */
function claimParagraph(block: string): string {
  const match = /<p>([\s\S]*?)<\/p>/.exec(block);
  return textOf(match?.[1] ?? '');
}

/**
 * Claim B exactly as the page rendered it. The assertion below compares this string — the
 * reader's actual text — with the plate and with the committed value, never with a string the
 * test rebuilt from the same helper.
 */
function renderedClaimB(locale: Locale): string {
  const blocks = agreementHtml(locale).split('<div class="claim">').slice(1);
  const matches = blocks.map(claimParagraph).filter((text) => containsAny(text, EMPLOYED_MARKERS[locale]));
  if (matches.length !== 1) throw new Error(`${locale}: expected one rendered employed-person claim, found ${matches.length}`);
  return matches[0] as string;
}

describe('AC-005-17: the facts register states the mechanism as two claims', () => {
  it('AC-005-17: length is four everywhere, with exactly one A and one B', () => {
    const lengths = new Set<number>();
    for (const locale of LOCALES) {
      const claims = content(locale).editorial.agreement;
      lengths.add(claims.length);
      expect(claims.length, locale).toBe(4);
      expect(containsAny(claimA(locale, claims).text, EMPLOYED_MARKERS[locale])).toBe(false);
      expect(claimB(locale, claims)).toBeDefined();
    }
    expect(lengths.size).toBe(1);
  });
});

describe('AC-005-18: each claim cites the record that supports it', () => {
  it('AC-005-18: claim A is the Social Security record; claim B is a fig-01 Eurostat source', () => {
    const { manifest } = committedFig01();
    const citations = JSON.parse(readFileSync('web/content/data/citations.json', 'utf8')) as {
      citations: Array<{ id: string; url: string }>;
    };
    for (const id of SHIPPED_CITATION_IDS) {
      expect(citations.citations.some((citation) => citation.id === id), id).toBe(true);
    }
    for (const locale of LOCALES) {
      const claims = content(locale).editorial.agreement;
      expect(claimA(locale, claims).citationId, locale).toBe('ss-estadisticas-pensiones');
      const b = claimB(locale, claims);
      const citation = citationRegistry.find(b.citationId);
      expect(citation, locale).toBeDefined();
      expect(new URL(citation?.url ?? '').host, locale).toBe('ec.europa.eu');
      expect(manifest.sourceUrl, locale).toContain(citation?.url);
    }
    const fig01Urls = new Set(manifest.sourceUrl);
    const carried = citations.citations.filter((citation) => fig01Urls.has(citation.url));
    expect(carried).toHaveLength(1);
  });
});

describe('AC-005-19: claim B’s numerals are the committed fig-01 numerals', () => {
  it('AC-005-19: the claim and the plate publish the same two strings, in every locale', () => {
    const { value } = committedFig01();
    expect(value.first?.ratio).toBe(0.28);
    expect(value.latest?.ratio).toBe(0.33);
    for (const locale of LOCALES) {
      const { first, latest } = fig01Numerals(locale);
      const b = claimB(locale, content(locale).editorial.agreement);
      // The actual: read from the rendered page, not rebuilt from the helper that formats the
      // expectation. A `'ratio'` → `'decimal'` mutation in `PublicPage.tsx` renders `0,3` here
      // and fails the two assertions below.
      const text = renderedClaimB(locale);
      expect(text, `${locale}: rendered first numeral`).toContain(first);
      expect(text, `${locale}: rendered latest numeral`).toContain(latest);
      const plate = decodeText(figuresOf(committedPage(locale)));
      expect(plate, `${locale}: plate first`).toContain(first);
      expect(plate, `${locale}: plate latest`).toContain(latest);
      const otherDigits = text.replaceAll(first, '').replaceAll(latest, '');
      expect(otherDigits, `${locale}: a third numeral`).not.toMatch(/\d/);
      expect(b.text, `${locale}: the template carries the two variables`).toContain('{first}');
      expect(b.text, `${locale}: the template carries the two variables`).toContain('{latest}');
    }
  });

  it('AC-005-19: no locale document hand-types either numeral', () => {
    for (const locale of LOCALES) {
      const raw = readFileSync(`web/content/data/ES/${locale}.json`, 'utf8');
      expect(raw, locale).not.toContain('0,28');
      expect(raw, locale).not.toContain('0.28');
      expect(raw, locale).not.toContain('0,33');
      expect(raw, locale).not.toContain('0.33');
    }
  });
});

describe('AC-005-20: no claim is dropped and the dispute register is untouched', () => {
  it('AC-005-20: every claim resolves, renders, and the disputes digest is the shipped one', () => {
    for (const locale of LOCALES) {
      const claims = content(locale).editorial.agreement;
      expect(resolveClaims(claims, citationRegistry), locale).toHaveLength(claims.length);
      const section = agreementHtml(locale);
      expect(section.split('class="claim"').length - 1, locale).toBe(claims.length);
      const disputes = createHash('sha256')
        .update(JSON.stringify(content(locale).editorial.disputes))
        .digest('hex')
        .slice(0, 16);
      expect(disputes, locale).toBe(SHIPPED_DISPUTE_DIGESTS[locale]);
      const lower = claims.map((claim) => renderedClaim(locale, claim).toLocaleLowerCase()).join(' ');
      for (const phrase of SUFFICIENCY) expect(lower, `${locale}: ${phrase}`).not.toContain(phrase);
    }
  });
});

describe('AC-005-21: the fact assigns no cohort blame and borrows no thesis vocabulary', () => {
  it('AC-005-21: no cohort word, no thesis term, no thesis vocabulary outside the thesis', () => {
    for (const locale of LOCALES) {
      const claims = content(locale).editorial.agreement;
      const lower = [claimA(locale, claims).text, claimB(locale, claims).text].join(' ').toLocaleLowerCase();
      for (const word of COHORT) expect(lower, `${locale}: ${word}`).not.toContain(word);
      expect(thesisVocabularyOutsideThesis(content(locale).strings, content(locale).editorial), locale).toEqual([]);
      const section = agreementHtml(locale).toLocaleLowerCase();
      for (const term of THESIS_TERMS) expect(section, `${locale}: ${term}`).not.toContain(term);
    }
  });
});

describe('AC-005-22: no new figure, series or derived artefact', () => {
  it('AC-005-22: seven figures, untouched data, and the same plate count', () => {
    expect(FIGURE_IDS).toHaveLength(7);
    const status = spawnSync('git', ['status', '--porcelain', '--', 'data/derived', 'data/snapshots'], {
      encoding: 'utf8',
    });
    expect(status.status, status.stderr).toBe(0);
    expect(status.stdout.trim(), 'a derived or snapshot file changed').toBe('');
    const computed = readDerivedFigures('data/derived').filter((figure) => figure.availability === 'computed');
    expect(committedPage('es').split('class="figure-slot"').length - 1).toBe(computed.length);
  });
});
