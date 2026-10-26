import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IngestError,
  jsonStatPoints,
  readEmployedPersons,
  readOldAgeBeneficiaries,
  readPensionExpenditureShare,
  resolveCategoryCode,
  resolveUnitScale,
} from '../../web/sources/eurostat';
import { latestObservation, readIneSeries, readPopulationProjection } from '../../web/sources/ine';
import { loadSnapshots, snapshotFromFile } from '../../web/sources/load';
import { evaluateFreshness } from '../../web/sources/freshness';

/**
 * Branch-level coverage for the two machine readers and the snapshot loader (T2, T3, T4).
 *
 * The acceptance tests prove the happy path against the committed payloads. What is asserted
 * here is the part that makes a published number trustworthy: that a dimension code is resolved
 * from the payload's own labels, that a unit is converted with the factor its label implies, and
 * that a payload this build cannot interpret fails instead of yielding a plausible number.
 */

interface Dimension {
  codes: string[];
  labels: Record<string, string>;
}

function jsonStat(id: string[], dimensions: Record<string, Dimension>, values: Record<string, number | null>): unknown {
  return {
    id,
    size: id.map((name) => dimensions[name]?.codes.length ?? 1),
    dimension: Object.fromEntries(
      id.map((name) => {
        const dimension = dimensions[name] ?? { codes: ['x'], labels: { x: 'x' } };
        return [
          name,
          {
            category: {
              index: Object.fromEntries(dimension.codes.map((code, index) => [code, index])),
              label: dimension.labels,
            },
          },
        ];
      }),
    ),
    value: values,
  };
}

const GEO = { codes: ['ES', 'DE'], labels: { ES: 'Spain', DE: 'Germany' } };

/** Beneficiaries: only `time` carries more than one category, so the flat index is the year. */
function beneficiaries(perYear: Array<[string, number | null]>): unknown {
  const times = perYear.map(([year]) => year);
  return jsonStat(
    ['geo', 'spdepb', 'spdepm', 'sex', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      spdepb: { codes: ['OLD'], labels: { OLD: 'Old age pension' } },
      spdepm: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
      sex: { codes: ['T'], labels: { T: 'Total' } },
      unit: { codes: ['PS'], labels: { PS: 'Person' } },
      time: { codes: times, labels: Object.fromEntries(times.map((year) => [year, year])) },
    },
    Object.fromEntries(perYear.map(([, value], index) => [String(index), value])),
  );
}

function employment(perYear: Array<[string, number]>): unknown {
  const times = perYear.map(([year]) => year);
  return jsonStat(
    ['geo', 'indic_em', 'sex', 'age', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      indic_em: {
        codes: ['EMP_LFS'],
        labels: { EMP_LFS: 'Total employment (resident population concept - LFS)' },
      },
      sex: { codes: ['T'], labels: { T: 'Total' } },
      age: { codes: ['Y15-64'], labels: { 'Y15-64': 'From 15 to 64 years' } },
      unit: { codes: ['THS'], labels: { THS: 'Thousand persons' } },
      time: { codes: times, labels: Object.fromEntries(times.map((year) => [year, year])) },
    },
    Object.fromEntries(perYear.map(([, value], index) => [String(index), value])),
  );
}

describe('JSON-stat decoding', () => {
  it('decodes the flat index into one coordinate per dimension, most-significant first', () => {
    const payload = jsonStat(['geo', 'sex', 'time'], {
      geo: GEO,
      sex: { codes: ['T', 'M'], labels: { T: 'Total', M: 'Men' } },
      time: { codes: ['2023', '2024'], labels: { '2023': '2023', '2024': '2024' } },
    }, { '0': 10, '1': 11, '2': 20, '3': 21, '4': 30, '5': 31, '6': 40, '7': 41 });

    const points = jsonStatPoints(payload);

    expect(points).toHaveLength(8);
    expect(points[0]).toEqual({ coords: { geo: 'ES', sex: 'T', time: '2023' }, value: 10 });
    expect(points[1]).toEqual({ coords: { geo: 'ES', sex: 'T', time: '2024' }, value: 11 });
    expect(points[2]).toEqual({ coords: { geo: 'ES', sex: 'M', time: '2023' }, value: 20 });
    expect(points[4]).toEqual({ coords: { geo: 'DE', sex: 'T', time: '2023' }, value: 30 });
  });

  it('drops null observations instead of publishing them as zero', () => {
    expect(jsonStatPoints(beneficiaries([['2023', null], ['2024', 5]]))).toEqual([
      { coords: { geo: 'ES', spdepb: 'OLD', spdepm: 'TOTAL', sex: 'T', unit: 'PS', time: '2024' }, value: 5 },
    ]);
  });

  it('returns nothing for a payload that is not a dataset, or that lacks a required member', () => {
    for (const payload of [null, 42, 'payload', [], {}]) {
      expect(jsonStatPoints(payload)).toEqual([]);
    }
    // id + size without value, and value without id, are both incomplete.
    expect(jsonStatPoints({ id: ['time'], size: [1] })).toEqual([]);
    expect(jsonStatPoints({ value: { '0': 1 } })).toEqual([]);
    expect(jsonStatPoints({ id: ['time'], size: [1] })).toEqual([]);
  });

  it('leaves a coordinate empty when the payload did not declare a code for it', () => {
    // size says three positions but only two codes were declared: the decoder must not invent
    // a code, and must not shift the remaining coordinates.
    const payload = {
      id: ['sex'],
      size: [3],
      dimension: { sex: { category: { index: { T: 0 }, label: { T: 'Total' } } } },
      value: { '0': 1, '1': 2 },
    };
    expect(jsonStatPoints(payload).map((point) => point.coords.sex)).toEqual(['T', '']);
  });
});

describe('dimension code resolution', () => {
  it('matches a label case-insensitively and ignoring surrounding space', () => {
    const payload = beneficiaries([['2024', 1]]);

    expect(resolveCategoryCode(payload, 'spdepb', 'Old age pension')).toBe('OLD');
    expect(resolveCategoryCode(payload, 'spdepb', '  OLD AGE PENSION  ')).toBe('OLD');
    expect(resolveCategoryCode(payload, 'spdepb', 'old age pension')).toBe('OLD');
  });

  it('fails loudly for a label no category carries, and for an absent dimension', () => {
    const payload = beneficiaries([['2024', 1]]);

    expect(() => resolveCategoryCode(payload, 'spdepb', 'Disability pension')).toThrow(IngestError);
    expect(() => resolveCategoryCode(payload, 'spdepx', 'Total')).toThrow(/no dimension "spdepx"/);
    expect(() => resolveCategoryCode(payload, 'spdepb', 'Old age pension').length).not.toBe(0);
  });

  it('fails loudly when a payload declares no labels at all', () => {
    const noLabels = {
      id: ['sex'],
      size: [1],
      dimension: { sex: { category: { index: { T: 0 } } } },
      value: { '0': 1 },
    };
    expect(() => resolveCategoryCode(noLabels, 'sex', 'Total')).toThrow(IngestError);
  });
});

describe('unit conversion', () => {
  it('converts thousand persons into persons and leaves persons unchanged', () => {
    const employed = employment([['2024', 21.3]]);
    const persons = beneficiaries([['2024', 7_059_353]]);

    expect(resolveUnitScale(employed, 'Thousand persons')).toEqual({
      code: 'THS',
      label: 'Thousand persons',
      factor: 1_000,
    });
    expect(resolveUnitScale(persons, 'Person')).toEqual({ code: 'PS', label: 'Person', factor: 1 });

    expect(readEmployedPersons(employed).points).toEqual([{ year: 2024, value: 21_300 }]);
    expect(readOldAgeBeneficiaries(persons).points).toEqual([{ year: 2024, value: 7_059_353 }]);
  });

  it('refuses to convert a unit it has no scale for', () => {
    const payload = jsonStat(
      ['unit'],
      { unit: { codes: ['EUR'], labels: { EUR: 'Euro' } } },
      { '0': 1 },
    );

    expect(() => resolveUnitScale(payload, 'Euro')).toThrow(/no scale is defined for unit label "Euro"/);
  });
});

describe('the three published series readers', () => {
  it('reads old-age beneficiaries as persons for the requested country only', () => {
    const series = readOldAgeBeneficiaries(beneficiaries([['2022', 5], ['2023', 6]]));

    expect(series.points).toEqual([
      { year: 2022, value: 5 },
      { year: 2023, value: 6 },
    ]);
    expect(series.codes).toEqual({ pensionType: 'OLD', meansTesting: 'TOTAL', sex: 'T', unit: 'PS' });
  });

  it('reads employment in persons and reports the age class it resolved', () => {
    const series = readEmployedPersons(employment([['2023', 20], ['2024', 21.3]]));

    expect(series.points).toEqual([
      { year: 2023, value: 20_000 },
      { year: 2024, value: 21_300 },
    ]);
    expect(series.ageCode).toBe('Y15-64');
    expect(series.ageLabel).toBe('From 15 to 64 years');
    expect(series.codes).toEqual({ indicator: 'EMP_LFS', sex: 'T', age: 'Y15-64', unit: 'THS' });
  });

  it('reads the %-of-GDP series unconverted, because the publisher already publishes a share', () => {
    const times = ['2023', '2024'];
    const payload = jsonStat(
      ['geo', 'spdepb', 'spdepm', 'unit', 'time'],
      {
        geo: { codes: ['ES'], labels: { ES: 'Spain' } },
        spdepb: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
        spdepm: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
        unit: {
          codes: ['PC_GDP'],
          labels: { PC_GDP: 'Percentage of gross domestic product (GDP)' },
        },
        time: { codes: times, labels: Object.fromEntries(times.map((year) => [year, year])) },
      },
      { '0': 13.0, '1': 13.23 },
    );

    expect(readPensionExpenditureShare(payload).points).toEqual([
      { year: 2023, value: 13 },
      { year: 2024, value: 13.23 },
    ]);
  });

  it('fails when the country has no observation in the payload', () => {
    expect(() => readOldAgeBeneficiaries(beneficiaries([['2024', 1]]), 'DE')).toThrow(
      /no old-age beneficiaries for this country/,
    );
    expect(() => readEmployedPersons(employment([['2024', 1]]), 'DE')).toThrow(
      /no employment for this country/,
    );
  });

  it('fails when the series carries no usable observation', () => {
    expect(() => readOldAgeBeneficiaries(beneficiaries([['2024', null]]))).toThrow(IngestError);
  });
});

describe('INE tempus3 readers', () => {
  it('accepts a series object with a code and an array of observations', () => {
    expect(readIneSeries({ COD: 'TM1657', Nombre: 'n', Data: [{ Anyo: 2024, Valor: 1 }] })).not.toBeNull();
    expect(readIneSeries({ COD: 'TM1657', Nombre: 'n', Data: [] })).not.toBeNull();
  });

  it('rejects anything that is not a series object', () => {
    for (const payload of [null, 42, 'series', [], {}, { COD: 7, Data: [] }, { COD: 'x', Data: {} }]) {
      expect(readIneSeries(payload)).toBeNull();
    }
  });

  it('keeps the first observation when two years tie', () => {
    const series = { COD: 'TM1657', Data: [{ Anyo: 2024, Valor: 1 }, { Anyo: 2024, Valor: 2 }] };
    expect(latestObservation(series)).toEqual({ year: 2024, value: 1 });
  });

  it('ignores a non-finite observation rather than treating it as the latest', () => {
    const series = {
      COD: 'TM1657',
      Data: [{ Anyo: 2024, Valor: 21.9 }, { Anyo: 2025, Valor: Number.NaN }],
    };
    expect(latestObservation(series)).toEqual({ year: 2024, value: 21.9 });
  });

  it('reads the working-age projection, sorted, dropping entries it cannot use', () => {
    const payload = {
      years: [
        { year: 2070, population: 32_000_000 },
        { year: 2026, population: 40_000_000 },
        { year: 2050, population: 36_000_000 },
        { year: '2051', population: 1 },
        { year: 2052 },
        null,
        'nope',
      ],
    };

    expect(readPopulationProjection(payload).map((entry) => entry.year)).toEqual([2026, 2050, 2070]);
    expect(readPopulationProjection({ years: [] })).toEqual([]);
    expect(readPopulationProjection({})).toEqual([]);
    expect(readPopulationProjection(null)).toEqual([]);
    expect(readPopulationProjection({ years: 'nope' })).toEqual([]);
  });
});

describe('committed snapshot loading', () => {
  const meta = {
    sourceId: 'src',
    publisher: 'P',
    dataset: 'D',
    sourceUrl: 'https://example.org/a',
    retrievedAt: '2026-10-25T00:00:00Z',
  };

  it('treats a payload as resolved even when the flag is absent', () => {
    expect(snapshotFromFile('a.json', JSON.stringify({ meta, payload: { v: 1 } })).resolved).toBe(true);
  });

  it('honours an explicit unresolved flag even when a payload is present', () => {
    const snapshot = snapshotFromFile('a.json', JSON.stringify({ meta, resolved: false, payload: { v: 1 } }));

    expect(snapshot.resolved).toBe(false);
    expect(snapshot.unresolvedReason).toBe('series unresolved');
  });

  it('keeps the resolved flag true when there is no payload but the flag says so', () => {
    expect(snapshotFromFile('a.json', JSON.stringify({ meta, resolved: true })).resolved).toBe(true);
  });

  it('does not attach a payload key at all when the file carries none', () => {
    expect(Object.hasOwn(snapshotFromFile('a.json', JSON.stringify({ meta, resolved: false })), 'payload')).toBe(
      false,
    );
  });

  it('wraps a single source URL and keeps the raw bytes verbatim', () => {
    const content = JSON.stringify({ meta: { ...meta, publisher: 'Instituto Nacional de Estadística' }, payload: null });

    expect(snapshotFromFile('a.json', content).sourceUrl).toEqual(['https://example.org/a']);
    expect(snapshotFromFile('a.json', content).bytes).toBe(content);
  });

  it('reads only JSON files, in a deterministic order, and keeps the raw file text', () => {
    const dir = mkdtempSync(join(tmpdir(), 'snapshots-'));
    writeFileSync(join(dir, 'b.json'), JSON.stringify({ meta: { ...meta, sourceId: 'b' }, payload: 2 }), 'utf8');
    writeFileSync(join(dir, 'a.json'), JSON.stringify({ meta: { ...meta, sourceId: 'a' }, payload: 1 }), 'utf8');
    writeFileSync(join(dir, 'notes.txt'), 'not a snapshot', 'utf8');

    const snapshots = loadSnapshots(dir);

    expect([...snapshots.keys()]).toEqual(['a', 'b']);
    expect(snapshots.get('a')?.payload).toBe(1);
  });

  it('returns an empty map for a directory that does not exist', () => {
    expect(loadSnapshots(join(tmpdir(), 'definitely-absent-snapshots')).size).toBe(0);
  });
});

describe('snapshot freshness', () => {
  const now = new Date('2026-10-25T12:00:00Z');

  it('accepts a snapshot inside the window, including exactly at the boundary', () => {
    expect(evaluateFreshness('2026-10-24T12:00:00Z', 45, now)).toEqual({ fresh: true, ageDays: 1 });
    // 45 days old with a 45-day window is still current: the window is a limit, not a strict bound.
    expect(evaluateFreshness('2026-09-10T12:00:00Z', 45, now)).toEqual({ fresh: true, ageDays: 45 });
  });

  it('withholds a snapshot outside the window, naming its age in whole days', () => {
    const result = evaluateFreshness('2026-09-08T00:00:00Z', 45, now);

    expect(result.fresh).toBe(false);
    expect(result.reason).toBe('snapshot 47 days old');
    expect(result.ageDays).toBeGreaterThan(45);
  });

  it('treats a malformed timestamp as unusable, with no finite age', () => {
    expect(evaluateFreshness('2026-10-25', 45, now)).toEqual({
      fresh: false,
      ageDays: Number.POSITIVE_INFINITY,
      reason: 'malformed-fetched-at',
    });
  });

  it('treats a timestamp that cannot be parsed as unusable', () => {
    // The shape is right but the instant is not, so the parse — not the shape — rejects it.
    expect(evaluateFreshness('2026-13-45T99:99:99Z', 45, now)).toEqual({
      fresh: false,
      ageDays: Number.POSITIVE_INFINITY,
      reason: 'unparsable-fetched-at',
    });
  });
});

describe('the messages the readers fail with', () => {
  it('names the dimension and label it could not resolve', () => {
    const payload = beneficiaries([['2024', 1]]);

    expect(() => resolveCategoryCode(payload, 'spdepb', 'Survivors pension')).toThrow(
      'dimension "spdepb" has no category labelled "Survivors pension"',
    );
    expect(() => resolveCategoryCode(payload, 'invented', 'Total')).toThrow(
      'payload has no dimension "invented"',
    );
    expect(() => resolveCategoryCode(payload, 'spdepb', 'Old age pension')).not.toThrow();
  });

  it('reports an ambiguous label with every code that matched it', () => {
    const ambiguous = jsonStat(
      ['spdepb'],
      { spdepb: { codes: ['A', 'B'], labels: { A: 'Total', B: 'total' } } },
      { '0': 1, '1': 2 },
    );

    expect(() => resolveCategoryCode(ambiguous, 'spdepb', 'Total')).toThrow(
      'dimension "spdepb" has 2 categories labelled "Total": A, B',
    );
  });

  it('reports a payload that is not a dataset as such, before inspecting dimensions', () => {
    expect(() => resolveCategoryCode(42, 'spdepb', 'Total')).toThrow('payload is not a JSON-stat dataset');
    expect(() => resolveCategoryCode({}, 'spdepb', 'Total')).toThrow('payload is not a JSON-stat dataset');
  });

  it('returns a coordinate even when the payload declares no such dimension', () => {
    const withoutDimensions = { id: ['sex'], size: [1], value: { '0': 7 } };

    expect(jsonStatPoints(withoutDimensions)).toEqual([{ coords: { sex: '' }, value: 7 }]);
  });

  it('orders observations by year, whatever order the payload listed them in', () => {
    const ordered = jsonStat(
      ['time'],
      { time: { codes: ['2024', '2020', '2022'], labels: { '2024': '2024', '2020': '2020', '2022': '2022' } } },
      { '0': 30, '1': 10, '2': 20 },
    );

    expect(jsonStatPoints(ordered).map((point) => point.coords.time)).toEqual(['2024', '2020', '2022']);
  });
});
