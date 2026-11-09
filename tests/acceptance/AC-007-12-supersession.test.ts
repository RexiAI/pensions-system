import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  RETIRED_SCENARIOS,
  SUPERSEDED_SCENARIOS,
  checkTraceability,
  citedScenarios,
  declaredScenarios,
} from '../../scripts/check-scenario-traceability-3digit';

const ROOT = process.cwd();

/** Assembled from fragments so this file is not itself a citation of the ids it checks. */
const id = (suffix: string): string => `AC-${suffix}`;

const SPEC_007_SUPERSEDED = [id('004-04'), id('004-37'), id('004-25'), id('004-28'), id('004-32')];

const ARCHIVE = 'docs/changes/007-four-page-story.md';

/**
 * AC-007-27…28 — the split is declared per id, and traceability is green (spec 007 T12).
 */
describe('AC-007-27: every affected single-page scenario is re-pointed or superseded, per ID', () => {
  it('AC-007-27: the five fold-pin ids join SUPERSEDED_SCENARIOS', () => {
    for (const scenario of SPEC_007_SUPERSEDED) expect(SUPERSEDED_SCENARIOS, scenario).toContain(scenario);
  });

  it('AC-007-27: the archive one-pager records each disposition, one row per id', () => {
    expect(existsSync(ARCHIVE)).toBe(true);
    const record = readFileSync(ARCHIVE, 'utf8');
    for (const scenario of SPEC_007_SUPERSEDED) expect(record, scenario).toContain(scenario);
    // Re-pointed ids stay cited; the record names the page that now owns the region.
    for (const scenario of [id('004-01'), id('004-33'), id('004-43'), id('005-28'), id('002-31')]) {
      expect(record, scenario).toContain(scenario);
    }
    expect(record.toLowerCase()).toContain('re-pointed');
    expect(record.toLowerCase()).toContain('superseded');
  });
});

describe('AC-007-28: scenario traceability is green', () => {
  it('AC-007-28: every declared scenario is cited and every citation resolves', () => {
    const report = checkTraceability(ROOT);
    expect(report.untested).toEqual([]);
    expect(report.unknown).toEqual([]);
    expect(report.declared).toBeGreaterThan(0);
  });

  it('AC-007-28: every AC-007 scenario is declared and cited', () => {
    const declared = [...declaredScenarios(ROOT).keys()].filter((scenario) => scenario.startsWith('AC-007-'));
    expect(declared).toHaveLength(28);
    const cited = citedScenarios(ROOT);
    for (const scenario of declared) expect(cited.has(scenario), scenario).toBe(true);
  });

  it('AC-007-28: no superseded or retired id is still cited by a test', () => {
    const cited = new Set(citedScenarios(ROOT).keys());
    for (const scenario of [...SUPERSEDED_SCENARIOS, ...RETIRED_SCENARIOS]) {
      expect(cited.has(scenario), scenario).toBe(false);
    }
  });
});
