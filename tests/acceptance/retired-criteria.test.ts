import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkTraceability, declaredScenarios, citedScenarios } from '../../scripts/check-scenario-traceability-3digit';

/**
 * AC-004-74…79 — retire the layout pins of 001-003, keep the rest (spec 004 T17).
 *
 * The rule the split follows: a criterion is retired when its substance is *where something sits,
 * how tall it is, in which order it renders, which grid holds it or which fold edge it clears*,
 * and preserved when its substance is a value, an accuracy, accessibility, traceability or
 * reproducibility property.
 */
/** The ids, assembled so this file's own text is not a citation of them (AC-004-74). */
const id = (suffix: string): string => `AC-${suffix}`;

const RETIRED = [
  id('001-107'),
  id('002-09'),
  id('002-10'),
  id('002-11'),
  id('002-12'),
  id('002-16'),
  id('002-18'),
  id('002-19'),
  id('002-20'),
  id('002-21'),
  id('002-24'),
  id('002-29'),
  id('002-30'),
  id('002-36'),
  id('003-01'),
  id('003-06'),
  id('003-10'),
  id('003-39'),
  id('003-40'),
  id('003-42'),
  id('003-48'),
  id('003-49'),
  id('003-50'),
  id('003-51'),
];

const PRESERVED = [
  'AC-001-01',
  'AC-001-44',
  'AC-001-45',
  'AC-001-91',
  'AC-001-97',
  'AC-001-103',
  'AC-001-111',
  'AC-001-112',
  'AC-001-118',
  'AC-002-13',
  'AC-002-14',
  'AC-002-15',
  'AC-002-22',
  'AC-002-31',
  'AC-002-32',
  'AC-002-35',
  'AC-003-02',
  'AC-003-03',
  'AC-003-04',
  'AC-003-05',
  'AC-003-07',
  'AC-003-11',
  'AC-003-21',
  'AC-003-28',
  'AC-003-44',
];

const ROOT = process.cwd();

/** Every test file on disk, tracked or not: an untracked test is still part of the suite. */
function testFiles(): string[] {
  return (readdirSync('tests', { recursive: true }) as string[])
    .map((entry) => `tests/${String(entry)}`)
    .filter((file) => file.endsWith('.ts'));
}

describe('AC-004-74: no retired id is cited by a test', () => {
  it('AC-004-74: none of the twenty-four retired ids occurs in tests/', () => {
    const sources = testFiles().map((file) => readFileSync(file, 'utf8')).join('\n');
    for (const id of RETIRED) expect(sources, id).not.toContain(id);
  });
});

describe('AC-004-75: every preserved id still has a passing test', () => {
  it('AC-004-75: each preserved id occurs in at least one test file', () => {
    const sources = testFiles().map((file) => readFileSync(file, 'utf8')).join('\n');
    for (const id of PRESERVED) expect(sources, id).toContain(id);
  });
});

describe('AC-004-76: scenario traceability is green', () => {
  it('AC-004-76: every AC-004 id is cited and every citation resolves', () => {
    const declared = declaredScenarios(ROOT);
    const cited = citedScenarios(ROOT);
    const ours = [...declared.keys()].filter((id) => id.startsWith('AC-004-'));
    expect(ours.length).toBe(79);
    const report = checkTraceability(ROOT);
    expect(report.untested.filter((id) => id.startsWith('AC-004-'))).toEqual([]);
    expect(report.unknown.filter((id) => id.startsWith('AC-004-'))).toEqual([]);
    for (const id of ours) expect(cited.has(id), id).toBe(true);
  });
});

describe('AC-004-77: the retired geometry constants are gone from the tests', () => {
  it('AC-004-77: no retired measurement and no fixed key count', () => {
    const viewport = readFileSync('tests/acceptance/first-viewport.test.ts', 'utf8');
    const RETIRED_VALUES = ['436.52', '613.28', '480.91', '--measure-face: 17.5rem', 'CLEARANCE = 50'].map(
      (value) => value,
    );
    // Written from fragments so this file does not itself carry the pinned constants.
    const pinned = [['436', '52'], ['613', '28'], ['480', '91']].map((parts) => parts.join('.'));
    for (const value of [...RETIRED_VALUES, ...pinned]) {
      expect(viewport, value).not.toContain(value);
    }
    for (const file of testFiles()) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/toBe\(\s*270\s*\)/);
    }
  });
});

describe('AC-004-78: the band tests are split, not silently weakened', () => {
  it('AC-004-78: the re-pointed ids survive, the pending suite is gone', () => {
    const band = readFileSync('tests/acceptance/countdown-band.test.ts', 'utf8');
    for (const id of ['AC-003-02', 'AC-003-03', 'AC-003-04', 'AC-003-05', 'AC-003-07']) {
      expect(band, id).toContain(id);
    }
    const figuresSuite = readFileSync('tests/acceptance/unavailable-figures.test.ts', 'utf8');
    expect(figuresSuite).toContain('AC-004-43');
    expect(figuresSuite).toContain('class="plate');
    expect(() => readFileSync('tests/acceptance/pending.test.ts', 'utf8')).toThrow();
  });
});

describe('AC-004-79: no gate is lowered to make any of this pass', () => {
  it('AC-004-79: the gate configuration is untouched and no threshold moved', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string>; devDependencies: Record<string, string> };
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.scripts.lint).toBe('eslint .');
    expect(pkg.devDependencies['@stryker-mutator/core']).toBe('10.1.1');
    const eslint = readFileSync('eslint.config.mjs', 'utf8');
    expect(eslint).toContain('complexity');
    expect(eslint).toMatch(/complexity[^\n]*6/);
  });
});
