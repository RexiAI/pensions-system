import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { HERO_STATEMENT_BUDGETS } from '../../web/content/budgets';
import { COUNTRY_DOCUMENTS, validateDocument } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';

/**
 * T6 (spec 002): the hero's conversion surface moves to second-person, one-idea-per-sentence
 * register, in all five locales, inside three build gates that are not negotiable — the `<h1>`
 * budget, the country name in the statement, and 248-key parity. Copy work is confined to
 * `hero.*`: every `countdown.*` string keeps its factual register (the layout changed, the
 * vocabulary did not).
 */
interface Shipped {
  locale: Locale;
  countryName: string;
  strings: Record<string, string>;
}

const SHIPPED: Shipped[] = COUNTRY_DOCUMENTS.map((document) => ({
  locale: document.locale as Locale,
  countryName: document.countryName,
  strings: document.strings as Record<string, string>,
}));

function stringsFor(locale: Locale): Record<string, string> {
  const found = SHIPPED.find((entry) => entry.locale === locale);
  if (!found) throw new Error(`no shipped content for ${locale}`);
  return found.strings;
}

/** The keys this task is allowed to change, plus the pair the proposition tier renders. */
const REWRITTEN = [
  'hero.statement',
  'hero.sub',
  'hero.ctaPrimary',
  'hero.ctaSecondary',
  'hero.ctaMethod',
  'hero.ctaFigures',
] as const;

const EXPECTED_KEY_COUNT = 248;

/** A stable digest of a subset of the content model: `JSON.stringify` is key-order stable here. */
function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

function subset(strings: Record<string, string>, prefix: string): Record<string, string> {
  return Object.fromEntries(Object.entries(strings).filter(([key]) => key.startsWith(prefix)));
}

describe('AC-002-22: every statement names its country', () => {
  it('AC-002-22: each `hero.statement` contains its locale’s `countryName`', () => {
    for (const { locale, countryName, strings } of SHIPPED) {
      expect(strings['hero.statement'], `${locale}: ${countryName}`).toContain(countryName);
    }
  });

  it('AC-002-22: `check-content-scope`’s own validation reports clean', () => {
    const problems = COUNTRY_DOCUMENTS.flatMap((document) => validateDocument(document));
    expect(problems).toEqual([]);
  });
});

describe('AC-002-23: every statement fits its locale budget', () => {
  it('AC-002-23: `statement.length` is within `HERO_STATEMENT_BUDGETS`', () => {
    for (const locale of LOCALES) {
      const statement = stringsFor(locale)['hero.statement'];
      expect(statement.length, `${locale}: "${statement}"`).toBeLessThanOrEqual(
        HERO_STATEMENT_BUDGETS[locale],
      );
    }
  });
});

describe('AC-002-24: key parity is preserved across all five locales', () => {
  it('AC-002-24: each locale still has exactly 248 keys', () => {
    for (const locale of LOCALES) {
      expect(Object.keys(stringsFor(locale)).length, locale).toBe(EXPECTED_KEY_COUNT);
    }
  });

  it('AC-002-24: no key was added, removed or renamed', () => {
    const reference = Object.keys(stringsFor('es')).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(stringsFor(locale)).sort(), locale).toEqual(reference);
    }
    // The six keys this task rewrites are all still present: rewriting a value never moves a key.
    for (const key of REWRITTEN) expect(reference).toContain(key);
  });
});

describe('AC-002-25: the hero copy is in the conversion register, second person', () => {
  /** The second-person forms the AC names for the source locale, as whole words. */
  const SECOND_PERSON = /(?<!\p{L})(te|tú|tu|ti|contigo)(?!\p{L})/iu;

  it('AC-002-25: `statement`, `sub` and `ctaPrimary` address the reader in Spanish', () => {
    const strings = stringsFor('es');
    for (const key of ['hero.statement', 'hero.sub', 'hero.ctaPrimary'] as const) {
      expect(strings[key], `${key}: "${strings[key]}"`).toMatch(SECOND_PERSON);
    }
  });

  it('AC-002-25: the statement is one sentence and the sub is two at most', () => {
    const strings = stringsFor('es');
    // One idea per sentence: the statement is a single clause with no terminal punctuation, and
    // the sub breaks into at most two one-clause sentences.
    expect(strings['hero.statement']).not.toMatch(/[.!?;:]/);
    expect(strings['hero.sub'].split(/[.!?]/).filter((part) => part.trim() !== '').length).toBeLessThanOrEqual(2);
  });

  it('AC-002-25: the register is an invitation, with no filler verb and no hype', () => {
    // The design's anti-patterns, as a check rather than a review habit.
    const FILLER = [
      'descubre',
      'eleva',
      'desbloquea',
      'revoluciona',
      'discover',
      'unlock',
      'revolution',
      'entdecke',
      'scopri',
      'découvre',
    ];
    for (const locale of LOCALES) {
      const strings = stringsFor(locale);
      for (const key of REWRITTEN) {
        const text = strings[key].toLocaleLowerCase();
        expect(text, `${locale} ${key}: "${strings[key]}"`).not.toContain('!');
        expect(text, `${locale} ${key}: an em-dash`).not.toContain('—');
        for (const word of FILLER) {
          expect(text, `${locale} ${key}: "${strings[key]}"`).not.toContain(word);
        }
      }
    }
  });

  it('AC-002-25: the editorial description the hero used to carry is gone', () => {
    // The rewritten strings are an invitation to act, not the editorial description they replace.
    const REPLACED = {
      es: 'La aritmética de las pensiones en España',
      en: 'The arithmetic of pensions in Spain',
      fr: "L'arithmétique des retraites en Espagne",
      de: 'Die Arithmetik der Renten in Spanien',
      it: "L'aritmetica delle pensioni in Spagna",
    } as const;
    for (const locale of LOCALES) {
      expect(stringsFor(locale)['hero.statement'], locale).not.toBe(REPLACED[locale]);
    }
  });
});

describe('AC-002-26: the copy introduces no factual claim that requires a citation', () => {
  const INSTITUTIONS = [
    'eurostat',
    'ine',
    'seguridad social',
    'social security',
    'sécurité sociale',
    'sozialversicherung',
    'previdenza sociale',
  ];

  it('AC-002-26: no rewritten `hero.*` string carries a quantity, a source or an institution', () => {
    for (const locale of LOCALES) {
      const strings = stringsFor(locale);
      for (const key of REWRITTEN) {
        const text = strings[key];
        expect(text, `${locale} ${key}: "${text}"`).not.toMatch(/\d/);
        for (const institution of INSTITUTIONS) {
          // Whole words: `ine` is a substring of German `deinen` and of Spanish `define`.
          const pattern = new RegExp(`(?<!\\p{L})${institution}(?!\\p{L})`, 'iu');
          expect(pattern.test(text), `${locale} ${key}: "${text}" names ${institution}`).toBe(false);
        }
      }
    }
  });

  it('AC-002-26: the editorial object is unchanged in every locale', () => {
    // Pinned digests: the three editorial blocks are citation-bearing prose this task must not
    // touch. Each is `sha256(JSON.stringify(editorial)).slice(0, 16)`; recompute only when the
    // editorial copy is deliberately revised, together with its citations.
    const EXPECTED: Record<Locale, string> = {
      es: 'd1ae896b8dcee63d',
      en: '4ca5724135a62166',
      fr: '3a2eb8114c81961c',
      de: '0dbd6df5c9af3de3',
      it: '8dd9ab6498b62ded',
    };
    for (const document of COUNTRY_DOCUMENTS) {
      expect(digest(document.editorial), `${document.locale} editorial`).toBe(
        EXPECTED[document.locale as Locale],
      );
    }
  });

  it('AC-002-26: the clock and figure strings are unchanged in every locale', () => {
    const EXPECTED: Record<string, Record<Locale, string>> = {
      'countdown.clock.': {
        es: '22ae59671975f1c7',
        en: '8dda1127fc8d5056',
        fr: '7248ad247c11dbc8',
        de: 'cba162ba76928aa7',
        it: '89ea6d64f6a2e324',
      },
      'fig.': {
        es: 'cd3eb526918cdab1',
        en: 'df0ca024c0873c1a',
        fr: '02c04f9d44439e06',
        de: '46e4053580535ba8',
        it: '3eb2b00268e1e0f1',
      },
    };
    for (const [prefix, byLocale] of Object.entries(EXPECTED)) {
      for (const locale of LOCALES) {
        expect(digest(subset(stringsFor(locale), prefix)), `${locale} ${prefix}`).toBe(byLocale[locale]);
      }
      // 47 `fig.*` keys and 10 `countdown.clock.*` keys ship; the digest only says "unchanged".
      expect(Object.keys(subset(stringsFor('es'), prefix)).length, prefix).toBeGreaterThan(0);
    }
  });
});

describe('AC-002-28: every `countdown.*` string keeps its factual register', () => {
  const BANNED = ['faltan', 'quedan', 'solo', 'apenas', 'cuenta atrás', 'bomba', 'explota'];
  const SECOND_PERSON: Readonly<Record<string, readonly string[]>> = {
    es: ['tú', 'tu', 'vosotros', 'vuestro'],
    en: ['you', 'your'],
    fr: ['vous', 'ton', 'ta', 'tes'],
    de: ['du', 'dich', 'dein', 'deine'],
    it: ['tu', 'tuo', 'tua'],
  };
  /** `countdown.eyebrow` as it shipped: the layout changed, this sentence did not. */
  const EYEBROW: Readonly<Record<Locale, string>> = {
    es: 'Proyección central · Eurostat',
    en: 'Baseline projection · Eurostat',
    fr: 'Projection centrale · Eurostat',
    de: 'Mittlere Projektion · Eurostat',
    it: 'Proiezione centrale · Eurostat',
  };

  it('AC-002-28: `countdown.eyebrow` is unchanged in every locale', () => {
    for (const locale of LOCALES) {
      expect(stringsFor(locale)['countdown.eyebrow'], locale).toBe(EYEBROW[locale]);
    }
  });

  /** The register rules, one string at a time, so the loop above stays inside the complexity gate. */
  function assertFactual(locale: string, key: string, text: string): void {
    const lower = text.toLocaleLowerCase();
    expect(text, `${locale} ${key}`).not.toContain('!');
    for (const word of BANNED) {
      expect(lower, `${locale} ${key}: "${text}"`).not.toContain(word);
    }
    expect(/\bya\b/.test(lower), `${locale} ${key}: "${text}"`).toBe(false);
    for (const word of SECOND_PERSON[locale] ?? []) {
      expect(new RegExp(`\\b${word}\\b`).test(lower), `${locale} ${key}: "${text}"`).toBe(false);
    }
  }

  it('AC-002-28: no `countdown.*` string gained second person, urgency or an exclamation', () => {
    for (const locale of LOCALES) {
      for (const [key, text] of Object.entries(stringsFor(locale))) {
        if (!key.startsWith('countdown.')) continue;
        assertFactual(String(locale), key, text);
      }
    }
  });
});

describe('AC-002-27: no gate is modified to make the copy pass', () => {
  it('AC-002-27: the `<h1>` budgets are the shipped ones', () => {
    expect(HERO_STATEMENT_BUDGETS).toEqual({ es: 42, de: 55, en: 46, fr: 52, it: 50 });
  });

  it('AC-002-27: the country-name gate still fails a statement that omits the country', () => {
    // The gate is exercised, not read: a statement without the country name is rejected.
    const document = COUNTRY_DOCUMENTS[0];
    if (!document) throw new Error('no shipped document');
    const broken = {
      ...document,
      strings: { ...document.strings, 'hero.statement': 'La aritmética de las pensiones' },
    } as typeof document;
    const codes = validateDocument(broken).map((problem) => problem.code);
    expect(codes).toContain('scope-statement');
  });
});
