import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HERO_STATEMENT_BUDGETS } from '../../web/content/budgets';
import { COUNTRY_DOCUMENTS } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import {
  checkTraceability,
  citedScenarios,
  declaredScenarios,
} from '../../scripts/check-scenario-traceability-3digit';

const ROOT = process.cwd();
const SUPERSEDED = ['AC-004', '11'].join('-');

function testFiles(): string[] {
  return (readdirSync('tests', { recursive: true }) as string[])
    .map((entry) => `tests/${String(entry)}`)
    .filter((file) => file.endsWith('.ts'));
}

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

function bracketedList(path: string, name: string): string {
  const match = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`).exec(source(path));
  if (!match) throw new Error(`no ${name} list in ${path}`);
  return match[1] ?? '';
}

describe('AC-005-36: the superseded carrier criterion is rewritten, not weakened', () => {
  it('AC-005-36: story-steps asserts number and breakage under AC-005-10', () => {
    const steps = source('tests/acceptance/story-steps.test.ts');
    expect(steps).toContain('AC-005-10');
    expect(steps).toContain("['number', 'breakage']");
    expect(steps).not.toContain(SUPERSEDED);
    for (const file of testFiles()) {
      expect(source(file), `${file} still cites ${SUPERSEDED}`).not.toContain(SUPERSEDED);
    }
    const retired = source('tests/acceptance/retired-criteria.test.ts');
    expect(retired).not.toContain(SUPERSEDED);
  });
});

describe('AC-005-37: the editorial digest is recomputed, with the reason recorded', () => {
  it('AC-005-37: hero-copy pins the recomputed editorial digests and names spec 005', () => {
    const hero = source('tests/acceptance/hero-copy.test.ts');
    expect(hero).toContain('spec 005');
    for (const document of COUNTRY_DOCUMENTS) {
      const locale = document.locale as Locale;
      expect(hero, `${locale}: recomputed digest`).toContain(digest(document.editorial));
    }
    // The two namespaces this spec does not touch keep their shipped digests.
    for (const shipped of ['a5fe9d662b163974', '8ca7b29b7d6ace29', 'cd3eb526918cdab1', 'df0ca024c0873c1a']) {
      expect(hero, shipped).toContain(shipped);
    }
    expect(LOCALES).toHaveLength(5);
  });
});

describe('AC-005-38: nothing else is retired, and every preserved id still passes', () => {
  it('AC-005-38: the retired list is unchanged and every preserved id still has a test', () => {
    const path = 'tests/acceptance/retired-criteria.test.ts';
    const retired = bracketedList(path, 'RETIRED');
    const entries = [...retired.matchAll(/id\('(\d{3}-\d{2,3})'\)/g)].map((match) => match[1]);
    expect(entries).toHaveLength(24);
    expect(retired).not.toContain('005-');

    const preserved = [...bracketedList(path, 'PRESERVED').matchAll(/'(AC-\d{3}-\d{2})'/g)].map((match) => match[1]);
    expect(preserved.length).toBeGreaterThan(0);
    const allTests = testFiles().map((file) => source(file)).join('\n');
    for (const id of preserved) expect(allTests, id).toContain(id);

    const declared = [...declaredScenarios(ROOT).keys()].filter((id) => id.startsWith('AC-004-'));
    expect(declared).toHaveLength(79);

    for (const file of testFiles()) {
      const text = source(file);
      expect(text, `${file} has a skipped or focused test`).not.toMatch(/\.(skip|only|todo)\(/);
    }
  });
});

describe('AC-005-39: traceability is green and no gate is lowered', () => {
  it('AC-005-39: every scenario is cited and no threshold moved', () => {
    const report = checkTraceability(ROOT);
    expect(report.untested).toEqual([]);
    expect(report.unknown).toEqual([]);
    const cited = citedScenarios(ROOT);
    for (let number = 1; number <= 39; number += 1) {
      const id = `AC-005-${String(number).padStart(2, '0')}`;
      expect(cited.has(id), id).toBe(true);
    }
    expect(HERO_STATEMENT_BUDGETS).toEqual({ es: 42, de: 55, en: 46, fr: 52, it: 50 });
    const eslint = source('eslint.config.mjs');
    expect(eslint).toContain('complexity');
    expect(eslint).toMatch(/complexity[^\n]*6/);
    const stryker = source('stryker.config.mjs');
    expect(stryker).toMatch(/thresholds:\s*\{\s*high:\s*80,\s*low:\s*80/);
  });
});
