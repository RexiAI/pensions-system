import { readdirSync, readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkTraceability, citedScenarios, declaredScenarios } from '../../scripts/check-scenario-traceability-3digit';
import { BROWSER_READY, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-15…21 — the supersessions are performed, not merely written down (Task 7).
 *
 * The two lists in `scripts/check-scenario-traceability-3digit.ts` and
 * `tests/acceptance/retired-criteria.test.ts` are the mechanism: a retired id is declared and
 * refused a citation; a re-pointed id keeps its citation on the assertion the record describes.
 */
const ROOT = process.cwd();

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

function testFiles(): string[] {
  return (readdirSync('tests', { recursive: true }) as string[])
    .map((entry) => `tests/${String(entry)}`)
    .filter((file) => file.endsWith('.ts'));
}

function bracketedList(path: string, name: string): string {
  const match = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`).exec(source(path));
  if (!match) throw new Error(`no ${name} list in ${path}`);
  return match[1] ?? '';
}

describe('AC-006-15: AC-001-118’s ground clause is inverted, not deleted', () => {
  it('AC-006-15: the palette suite requires step 1 not to paint the hero ground', () => {
    const palette = source('tests/acceptance/palette-labels.test.ts');
    expect(palette).toContain('AC-001-118');
    const body = palette.slice(palette.indexOf("it('AC-001-118: the four non-colour surfaces"));
    const test = body.slice(0, body.indexOf('\n  });'));
    expect(test).toContain("expect(step).not.toContain('var(--surface-hero)')");
    expect(test).toContain("expect(step).not.toContain('border-top')");
    expect(test).toContain("expect(step).not.toContain('var(--surface-2)')");
    // The display-scale and --measure clauses stand.
    expect(test).toContain("declaration(LIGHT, 'text-display')");
    expect(test).toContain("declaration(LIGHT, 'measure')");
  });

  it('AC-006-15: AC-001-118 is preserved, not retired', () => {
    const path = 'tests/acceptance/retired-criteria.test.ts';
    expect(bracketedList(path, 'PRESERVED')).toContain('AC-001-118');
    expect(bracketedList(path, 'RETIRED')).not.toContain('001-118');
  });
});

describe('AC-006-16: AC-005-16’s ground clause is inverted, and its hash clause is superseded', () => {
  it('AC-006-16: the ground assertion is inverted and the spacing clause is unchanged', () => {
    const air = source('tests/acceptance/spec-005-step-air.test.ts');
    expect(air).toContain('AC-005-16');
    expect(air).toContain("expect(number).not.toContain('background: var(--surface-hero)')");
    expect(air).toContain('every spacing declaration in the touched rules resolves a token');
    // The byte-identity clause is replaced by AC-006-18's declared-change-set test.
    expect(air).not.toContain('TOKENS_SHA256');
    expect(air).not.toContain('createHash');
  });
});

describe('AC-006-17: AC-004-77’s rationale names this spec; its assertions are unchanged', () => {
  it('AC-006-17: the centring test names spec 006 and still asserts --measure-face places nothing', () => {
    const viewport = source('tests/acceptance/first-viewport.test.ts');
    const body = viewport.slice(viewport.indexOf("it('AC-004-77: the centring measure is no longer a fold pin"));
    expect(body.slice(0, 900)).toContain('spec 006');
    expect(viewport).toContain("expect(CSS).not.toContain('var(--measure-face)')");
    expect(viewport).toContain('--measure-face:\\s*17\\.5rem;');
  });
});

/** The token names the shipped file carries, so "no new token" is a closed-set assertion. */
const TOKEN_NAMES = [
  'font-sans', 'font-mono', 'font-serif', 'font-label', 'text-display', 'text-h2', 'text-h3',
  'text-plate', 'text-body-lg', 'text-body', 'text-small', 'text-meta', 'text-micro', 'text-num-xl',
  'text-num-l', 'text-num-m', 'leading-tight', 'leading-snug', 'leading-body', 'leading-meta',
  'tracking-display', 'tracking-label', 'clock-gap', 'clock-days-min', 'clock-unit-min',
  'clock-sub-col', 'measure-face', 'text-clock-sub', 'fuse-burnt-h', 'tap-min', 'share-gap',
  'share-icon', 'space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-7',
  'space-8', 'space-9', 'space-10', 'grid-max', 'gutter', 'measure', 'header-h', 'bp-min',
  'locale-cell', 'header-h-mobile', 'chart-compact-w', 'figure-state-row-min', 'surface-1',
  'surface-2', 'surface-3', 'ink-1', 'ink-2', 'ink-3', 'rule-1', 'rule-2', 'accent', 'on-accent',
  'data-deficit', 'chart-series-1', 'chart-series-2', 'chart-ref', 'chart-grid', 'chart-hatch',
  'data-projection', 'data-projection-ground', 'data-projection-edge', 'chart-observed',
  'chart-projection', 'dash-projection', 'rule-projection', 'pyramid-band-h', 'ground-instrument',
  'ground-consensus', 'ground-dispute', 'ground-thesis', 'radius', 'border-hair', 'border-strong',
  'border-register', 'shadow', 'focus', 'focus-offset', 'state-pending', 'state-danger',
  'nav-active-rule', 'pager-gap', 'page-head-gap',
  'admin-max', 'admin-row-h', 'admin-gap', 'operator-bar-h', 'z-sticky', 'z-operator',
] as const;

describe('AC-006-18: the token file’s change set is the declared one', () => {
  const tokens = readFileSync('web/styles/tokens.css', 'utf8');
  const light = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf("[data-theme='dark']"));

  it('AC-006-18: every revalued token is a colour token, and --surface-hero is retired', () => {
    expect(tokens).not.toContain('--surface-hero:');
    // No new token: the name set is exactly the shipped one minus the retired ground.
    const names = [...light.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((match) => match[1]);
    expect(names.sort()).toEqual([...TOKEN_NAMES].sort());
  });

  it('AC-006-18: no type, space, font, radius, shadow or measure token changes value', () => {
    const expected: Record<string, string> = {
      'text-display': 'clamp(2.5rem, 4.9vw, 4rem)',
      'text-h2': 'clamp(1.625rem, 2.4vw, 2.375rem)',
      'text-h3': '1.25rem',
      'text-plate': 'clamp(1.1875rem, 1.55vw, 1.5rem)',
      'text-body-lg': '1.1875rem',
      'text-body': '1.0625rem',
      'text-small': '0.9375rem',
      'text-meta': '0.8125rem',
      'text-micro': '0.75rem',
      'text-num-xl': 'clamp(2.75rem, 6.4vw, 5rem)',
      'text-num-l': '2rem',
      'text-num-m': '1.25rem',
      'space-1': '4px',
      'space-2': '8px',
      'space-3': '12px',
      'space-5': '24px',
      'space-6': '32px',
      'space-8': '64px',
      'radius': '0',
      'shadow': 'none',
      'measure': '64ch',
      'measure-face': '17.5rem',
      'locale-cell': '36px',
      'tap-min': '44px',
    };
    for (const [name, value] of Object.entries(expected)) {
      const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(light);
      expect(match?.[1]?.trim(), name).toBe(value);
    }
    expect(light).toContain("--font-sans: 'Instrument Sans'");
  });

  it('AC-006-18: the dark block re-declares nothing new', () => {
    const dark = tokens.slice(tokens.indexOf("[data-theme='dark']"));
    const darkNames = [...dark.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((match) => match[1]);
    for (const name of darkNames) expect(TOKEN_NAMES as readonly string[], name).toContain(name);
  });
});

describe('AC-006-20: the touched rules add no colour literal', () => {
  /**
   * Every paint channel the scenario names — and the logical-border spellings the sheet actually
   * uses. The shorter list (`color|background|background-color|border-color`) is what the
   * verification caught letting `outline`, `border-*-color`, `fill`, `stroke` and `box-shadow`
   * through; the `(?:^|;)` anchor missed a rule's first declaration.
   */
  const PAINT = /^(color|background|background-color|border(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-color)?|outline(-color)?|fill|stroke|box-shadow)$/;
  const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\blab\(/i;
  const RESOLVED = /var\(--|^none$|^transparent$|^0$|^url\(#/;

  interface Declaration {
    selector: string;
    property: string;
    value: string;
  }

  /** Every declaration of every innermost rule, first declaration included. */
  function declarations(css: string): Declaration[] {
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const found: Declaration[] = [];
    for (const rule of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const raw of (rule[2] ?? '').split(';')) {
        const at = raw.indexOf(':');
        if (at === -1) continue;
        found.push({
          selector: (rule[1] ?? '').trim().replace(/\s+/g, ' '),
          property: raw.slice(0, at).trim(),
          value: raw.slice(at + 1).trim(),
        });
      }
    }
    return found;
  }

  it('AC-006-20: every paint declaration resolves a token, none, transparent, 0 or an in-document paint', () => {
    const paint = declarations(readFileSync('web/styles/globals.css', 'utf8')).filter((entry) => PAINT.test(entry.property));
    // Non-vacuity: the sweep really sees paint declarations, including a shorthand and a first
    // declaration in a rule.
    expect(paint.length).toBeGreaterThan(50);
    expect(paint.some((entry) => entry.property === 'border')).toBe(true);
    expect(paint.some((entry) => entry.property === 'fill')).toBe(true);
    for (const entry of paint) {
      expect(entry.value, `${entry.selector} { ${entry.property} }`).toMatch(RESOLVED);
    }
  });

  it('AC-006-20: no paint declaration carries a colour literal, in any channel or position', () => {
    const literals = declarations(readFileSync('web/styles/globals.css', 'utf8')).filter(
      (entry) => PAINT.test(entry.property) && LITERAL.test(entry.value),
    );
    expect(literals).toEqual([]);
  });
});

describe.skipIf(!BROWSER_READY)('AC-006-19: the touched rules add no motion', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-19: no rule declares motion, and the served page computes none', async () => {
    const css = readFileSync('web/styles/globals.css', 'utf8');
    for (const selector of ['.site-header', '.step--number', '.clock', '.clock__value--days']) {
      const at = css.indexOf(`${selector} {`);
      if (at === -1) continue;
      const body = css.slice(at, css.indexOf('}', at));
      expect(body, selector).not.toMatch(/transition|animation/);
    }
    expect(css).not.toContain('@keyframes');

    const measured = await served.measure<{ moving: string[] }>(
      'es',
      MATRIX[2],
      `(() => {
        const moving = [];
        for (const el of document.querySelectorAll('header *, [data-top-step="number"] *')) {
          const style = getComputedStyle(el);
          const duration = parseFloat(style.transitionDuration) || 0;
          if (duration > 0 || style.animationName !== 'none') moving.push(el.className || el.tagName);
        }
        return { moving };
      })()`,
    );
    expect(measured.moving).toEqual([]);
  }, 180_000);
});

describe('AC-006-21: every scenario is cited, every retirement is performed, nothing is skipped', () => {
  it('AC-006-21: no AC-006 id is untested or unknown', () => {
    const report = checkTraceability(ROOT);
    expect(report.untested.filter((id) => id.startsWith('AC-006-'))).toEqual([]);
    expect(report.unknown.filter((id) => id.startsWith('AC-006-'))).toEqual([]);
    const declared = [...declaredScenarios(ROOT).keys()].filter((id) => id.startsWith('AC-006-'));
    expect(declared).toHaveLength(37);
    const cited = citedScenarios(ROOT);
    for (const id of declared) expect(cited.has(id), id).toBe(true);
  });

  it('AC-006-21: the retired list holds 39 and the preserved list 21', () => {
    const path = 'tests/acceptance/retired-criteria.test.ts';
    const retired = [...bracketedList(path, 'RETIRED').matchAll(/id\('(\d{3}-\d{2,3})'\)/g)].map((match) => match[1]);
    const preserved = [...bracketedList(path, 'PRESERVED').matchAll(/'(AC-\d{3}-\d{2,3})'/g)].map((match) => match[1]);
    expect(retired).toHaveLength(39);
    expect(preserved).toHaveLength(21);
    const all = testFiles().map(source).join('\n');
    for (const id of retired) expect(all, id).not.toContain(`AC-${id}`);
  });

  it('AC-006-21: every one of the twenty re-pointed ids still has a citation', () => {
    const all = testFiles().map(source).join('\n');
    const repointed = [
      'AC-001-99', 'AC-001-106', 'AC-001-110', 'AC-001-115', 'AC-001-117', 'AC-002-08',
      'AC-002-17', 'AC-002-31', 'AC-003-02', 'AC-003-03', 'AC-003-22', 'AC-003-26', 'AC-004-06',
      'AC-004-07', 'AC-004-59', 'AC-004-66', 'AC-004-68', 'AC-005-14', 'AC-005-16', 'AC-005-38',
    ];
    expect(repointed).toHaveLength(20);
    for (const id of repointed) expect(all, id).toContain(id);
    // The two paint-channel re-points invert their assertions.
    const cta = source('tests/acceptance/cta-hierarchy.test.ts');
    expect(cta).toContain('no rule fills with the accent');
    const fuse = source('tests/acceptance/fuse.test.ts');
    expect(fuse).toContain('burnt is --ink-1');
    // No token aliases the accent except the focus state.
    const tokens = readFileSync('web/styles/tokens.css', 'utf8');
    const aliases = [...tokens.matchAll(/^\s*--([a-z0-9-]+):\s*[^;]*var\(--accent\);/gm)].map((match) => match[1]);
    expect(aliases).toEqual(['focus']);
  });

  it('AC-006-21: the two clause-level re-points lose their pinned declarations', () => {
    const all = testFiles().map(source).join('\n');
    // AC-003-02: the 5ch reservation is no longer asserted.
    expect(all).not.toMatch(/min-inline-size:\s*var\(--clock-days-min\)/);
    // AC-003-03: the years numeral's ladder step-down is no longer asserted. Written from
    // fragments so this file does not itself carry the sequence it forbids.
    const numeralClass = ['countdown__', 'numeral'].join('');
    const ladderToken = ['--text-', 'num', '-l'].join('');
    expect(all).not.toMatch(new RegExp(`${numeralClass}[\\s\\S]{0,120}${ladderToken}`));
  });

  it('AC-006-21: the ids whose carrier file died are cited verbatim in a surviving test', () => {
    const all = testFiles().map(source).join('\n');
    for (const id of ['AC-001-101', 'AC-001-110', 'AC-001-115', 'AC-002-13', 'AC-002-14']) {
      expect(all, id).toContain(id);
    }
  });

  it('AC-006-21: no test is skipped, focused or marked todo', () => {
    for (const file of testFiles()) {
      expect(source(file), file).not.toMatch(/\.(skip|only|todo)\(/);
    }
  });
});
