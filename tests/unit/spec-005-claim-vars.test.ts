import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { citationRegistry, resolveClaims } from '../../web/content/citations';
import { interpolate } from '../../web/content/types';
import type { AgreementClaim } from '../../web/content/types';

const CLAIM: AgreementClaim = {
  text: 'the figure moved from {first} to {latest}',
  citationId: 'ss-estadisticas-pensiones',
};

/** A variable name a mechanism claim can carry. */
type Variable = 'first' | 'latest';
const VARIABLES: Variable[] = ['first', 'latest'];

/** The name a generated template piece stands for, or `null` when the piece is prose. */
function variableOf(piece: string): Variable | null {
  const name = /^\{(\w+)\}$/.exec(piece)?.[1];
  return VARIABLES.find((variable) => variable === name) ?? null;
}

/** Prose with no braces: in a claim template the only brace-bearing tokens are its placeholders. */
const PROSE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:-áéíóúñ'.split('');
const prose = fc.string({ unit: fc.constantFrom(...PROSE_ALPHABET), maxLength: 30 });

/** A formatted numeral as the plate publishes it — digits and the locale's own separators. */
const NUMERAL_ALPHABET = '0123456789.,\u00a0'.split('');
const numeral = fc.string({ unit: fc.constantFrom(...NUMERAL_ALPHABET), minLength: 1, maxLength: 8 });

const part = fc.oneof(prose, fc.constantFrom('{first}', '{latest}'));

describe('claim variables', () => {
  it('interpolates every supplied variable and resolves the claim', () => {
    const resolved = resolveClaims([CLAIM], citationRegistry, { first: '0,28', latest: '0,33' });
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.text).toBe('the figure moved from 0,28 to 0,33');
    expect(resolved[0]?.citation.id).toBe('ss-estadisticas-pensiones');
  });

  it('leaves an unresolved placeholder intact rather than printing an empty string', () => {
    const resolved = resolveClaims([CLAIM], citationRegistry, { first: '0,28' });
    expect(resolved[0]?.text).toBe('the figure moved from 0,28 to {latest}');
  });

  it('drops a claim whose citation does not resolve, variables or not', () => {
    const resolved = resolveClaims([{ ...CLAIM, citationId: 'missing' }], citationRegistry, { first: 'a', latest: 'b' });
    expect(resolved).toEqual([]);
  });

  it('fills exactly the variables it was given and leaves the rest as visible placeholders (property)', () => {
    fc.assert(
      fc.property(
        fc.array(part, { maxLength: 8 }),
        fc.subarray(VARIABLES),
        numeral,
        numeral,
        (pieces, supplied, firstValue, latestValue) => {
          const values: Record<Variable, string> = { first: firstValue, latest: latestValue };
          const vars: Record<string, string> = {};
          for (const name of supplied) vars[name] = values[name];

          // The model: prose is untouched, a supplied placeholder becomes its numeral, and an
          // unsupplied one stays visible. Built from the generated pieces, never by re-running
          // the function under test.
          const expected = pieces
            .map((piece) => {
              const name = variableOf(piece);
              return name === null || vars[name] === undefined ? piece : vars[name];
            })
            .join('');

          expect(interpolate(pieces.join(''), vars)).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('never renders a raw placeholder once both numerals are supplied (property)', () => {
    fc.assert(
      fc.property(prose, numeral, numeral, (surrounding, first, latest) => {
        const template = `${surrounding}{first}${surrounding}{latest}${surrounding}`;
        const rendered = interpolate(template, { first, latest });
        expect(rendered).not.toContain('{');
        expect(rendered).not.toContain('}');
        // The prose survives whole: the rendered claim is longer than the two numerals alone.
        expect(rendered).toContain(surrounding);
      }),
      { numRuns: 200 },
    );
  });

  it('applying the same variables twice changes nothing (property)', () => {
    fc.assert(
      fc.property(prose, numeral, numeral, (template, first, latest) => {
        const once = interpolate(template, { first, latest });
        expect(interpolate(once, { first, latest })).toBe(once);
      }),
      { numRuns: 300 },
    );
  });

  it('drops a claim on its citation alone, never because of a variable (property)', () => {
    fc.assert(
      fc.property(fc.subarray(VARIABLES), fc.boolean(), (supplied, resolvable) => {
        const vars: Record<string, string> = {};
        for (const name of supplied) vars[name] = '0,28';
        const claim: AgreementClaim = { ...CLAIM, citationId: resolvable ? CLAIM.citationId : 'missing' };

        const resolved = resolveClaims([claim], citationRegistry, vars);

        expect(resolved).toHaveLength(resolvable ? 1 : 0);
        if (resolvable) expect(resolved[0]?.citation.id).toBe(CLAIM.citationId);
      }),
      { numRuns: 100 },
    );
  });
});
