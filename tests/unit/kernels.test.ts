import { describe, expect, it } from 'vitest';
import { DEFAULT_RATE_LIMIT, LoginRateLimiter } from '../../web/admin/auth/rate-limit';
import { serializeSessionCookie, clearSessionCookie, sessionTokenFromCookieHeader } from '../../web/admin/auth/session';
import {
  IngestError,
  jsonStatPoints,
  readOldAgeBeneficiaries,
  readPensionExpenditureShare,
  resolveCategoryCode,
} from '../../web/sources/eurostat';
import { latestObservation, readPopulationProjection } from '../../web/sources/ine';
import { stableStringify } from '../../web/ingest/deterministic-json';
import { roundTo } from '../../web/metrics/rounding';
import { countSignChanges, npv } from '../../web/metrics/npv';
import { dispatchRefreshWorkflow } from '../../web/admin/revisions/dispatch';
import { verifyAuditChain, appendAuditEntry } from '../../web/admin/audit/log';
import { loadAdminConfig, looksLikeArgon2idHash } from '../../web/admin/config';
import { publisherForUrl } from '../../web/sources/labels';
import { snapshotFromFile } from '../../web/sources/load';

const NOW = new Date('2026-10-25T12:00:00Z');
const at = (offsetMs: number) => NOW.getTime() + offsetMs;

describe('login rate limiter', () => {
  it('allows attempts under the per-IP limit and locks at it', () => {
    const limiter = new LoginRateLimiter();
    for (let attempt = 0; attempt < DEFAULT_RATE_LIMIT.perIpLimit - 1; attempt += 1) {
      expect(limiter.recordFailure('ip-a', at(attempt * 1000)).allowed).toBe(true);
    }
    const locked = limiter.recordFailure('ip-a', at(10_000));
    expect(locked.allowed).toBe(false);
    expect(locked.mode).toBe('ip');
    expect(locked.retryAfterMs).toBeGreaterThan(0);
    expect(limiter.check('ip-b', at(10_000)).allowed).toBe(true);
  });

  it('forgets failures outside the 15-minute window', () => {
    const limiter = new LoginRateLimiter();
    for (let attempt = 0; attempt < DEFAULT_RATE_LIMIT.perIpLimit; attempt += 1) {
      limiter.recordFailure('ip-c', at(0));
    }
    expect(limiter.check('ip-c', at(0)).allowed).toBe(false);
    expect(limiter.check('ip-c', at(16 * 60 * 1000)).allowed).toBe(true);
  });

  it('applies the global cap across every IP, independently of per-IP state', () => {
    const limiter = new LoginRateLimiter();
    for (let attempt = 0; attempt < DEFAULT_RATE_LIMIT.globalLimit; attempt += 1) {
      limiter.recordFailure(`ip-${attempt}`, at(0));
    }
    const decision = limiter.check('fresh-ip', at(1000));
    expect(decision.allowed).toBe(false);
    expect(decision.mode).toBe('global');
    expect(limiter.check('fresh-ip', at(DEFAULT_RATE_LIMIT.globalWindowMs + 2000)).allowed).toBe(true);
  });

  it('caps the exponential backoff', () => {
    const limiter = new LoginRateLimiter();
    expect(limiter.backoffFor(DEFAULT_RATE_LIMIT.perIpLimit + 100)).toBe(DEFAULT_RATE_LIMIT.maxBackoffMs);
  });
});

describe('session cookie serialisation', () => {
  it('sets every hardening flag and a 30-minute TTL', () => {
    const cookie = serializeSessionCookie('abc.def');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Max-Age=1800');
    expect(clearSessionCookie()).toContain('Max-Age=0');
  });

  it('extracts the session value and ignores lookalike cookies', () => {
    expect(sessionTokenFromCookieHeader('a=1; ps_admin_session=token-value; b=2')).toBe('token-value');
    expect(sessionTokenFromCookieHeader('ps_admin_session_extra=nope')).toBeUndefined();
    expect(sessionTokenFromCookieHeader(undefined)).toBeUndefined();
  });
});

describe('Eurostat JSON-stat reader', () => {
  const payload = {
    id: ['freq', 'spdepb', 'spdepm', 'unit', 'geo', 'time'],
    size: [1, 2, 1, 1, 1, 2],
    dimension: {
      freq: { category: { index: { A: 0 }, label: { A: 'Annual' } } },
      spdepb: {
        category: {
          index: { TOTAL: 0, OLD: 1 },
          label: { TOTAL: 'Total', OLD: 'Old age pension' },
        },
      },
      spdepm: { category: { index: { TOTAL: 0 }, label: { TOTAL: 'Total' } } },
      unit: {
        category: {
          index: { PC_GDP: 0 },
          label: { PC_GDP: 'Percentage of gross domestic product (GDP)' },
        },
      },
      geo: { category: { index: { ES: 0 }, label: { ES: 'Spain' } } },
      time: { category: { index: { '2021': 0, '2022': 1 }, label: { '2021': '2021', '2022': '2022' } } },
    },
    value: { '0': 100, '1': 110, '2': 40, '3': 44 } as Record<string, number>,
  };

  it('decodes the flat index into coordinates', () => {
    const points = jsonStatPoints(payload);
    expect(points).toHaveLength(4);
    expect(points[0]?.coords).toMatchObject({ freq: 'A', spdepb: 'TOTAL', geo: 'ES', time: '2021' });
    expect(points[2]?.coords.spdepb).toBe('OLD');
  });

  it('resolves a dimension code from the payload labels, never from a hardcoded code', () => {
    expect(resolveCategoryCode(payload, 'spdepb', 'Old age pension')).toBe('OLD');
    expect(resolveCategoryCode(payload, 'spdepb', 'old age pension')).toBe('OLD');
    expect(resolveCategoryCode(payload, 'unit', 'Percentage of gross domestic product (GDP)')).toBe('PC_GDP');
  });

  it('fails loudly when the label is absent or ambiguous', () => {
    expect(() => resolveCategoryCode(payload, 'spdepb', 'Survivors pension')).toThrow(IngestError);
    const ambiguous = {
      ...payload,
      dimension: {
        ...payload.dimension,
        spdepb: {
          category: {
            index: { OLD: 0, OLD_SRV: 1 },
            label: { OLD: 'Old age pension', OLD_SRV: 'old age pension' },
          },
        },
      },
    };
    expect(() => resolveCategoryCode(ambiguous, 'spdepb', 'Old age pension')).toThrow(/2 categories/);
    expect(() => resolveCategoryCode(payload, 'invented_dim', 'Total')).toThrow(IngestError);
    expect(() => resolveCategoryCode(null, 'spdepb', 'Total')).toThrow(IngestError);
  });

  it('reads the TOTAL categories rather than summing sub-categories', () => {
    const series = readPensionExpenditureShare(payload);

    expect(series.points).toEqual([
      { year: 2021, value: 100 },
      { year: 2022, value: 110 },
    ]);
    expect(series.codes).toEqual({ pensionType: 'TOTAL', meansTesting: 'TOTAL', unit: 'PC_GDP' });
  });

  it('fails loudly for a payload without the old-age category or the %-of-GDP unit', () => {
    const withoutOldAge = {
      ...payload,
      dimension: { ...payload.dimension, spdepb: { category: { index: { DIS: 0 }, label: { DIS: 'Disability pension' } } } },
    };
    expect(() => readOldAgeBeneficiaries(withoutOldAge)).toThrow(/no category labelled "Old age pension"/);
    expect(() => readPensionExpenditureShare({ ...payload, value: {} })).toThrow(IngestError);
  });

  it('returns nothing for a malformed payload', () => {
    expect(jsonStatPoints(null)).toEqual([]);
    expect(jsonStatPoints({ value: { '0': 1 } })).toEqual([]);
  });
});

describe('INE readers', () => {
  const series = {
    COD: 'TM1657',
    Nombre: 'Total Nacional. Total. 65 años. Esperanza de vida.',
    Data: [
      { Anyo: 2022, Valor: 21.1 },
      { Anyo: 2024, Valor: 21.9 },
      { Anyo: 2023, Valor: 21.6 },
    ],
  };

  it('picks the latest observation regardless of order', () => {
    expect(latestObservation(series)).toEqual({ year: 2024, value: 21.9 });
    expect(latestObservation({ COD: 'x', Data: [] })).toBeNull();
    expect(latestObservation('nope')).toBeNull();
  });

  it('reads and sorts the committed projection years', () => {
    const years = readPopulationProjection({ years: [{ year: 2027, population: 2 }, { year: 2026, population: 1 }] });
    expect(years.map((entry) => entry.year)).toEqual([2026, 2027]);
    expect(readPopulationProjection({})).toEqual([]);
  });

  it('drops malformed projection entries instead of publishing them', () => {
    expect(readPopulationProjection({ years: [{ year: '2026', population: 1 }] })).toEqual([]);
  });
});

describe('deterministic derived JSON', () => {
  it('sorts keys at every depth and ends with a newline', () => {
    const a = stableStringify({ b: 1, a: { d: 2, c: [3, { f: 4, e: 5 }] } });
    const b = stableStringify({ a: { c: [3, { e: 5, f: 4 }], d: 2 }, b: 1 });
    expect(a).toBe(b);
    expect(a.endsWith('\n')).toBe(true);
    expect(a.indexOf('"a"')).toBeLessThan(a.indexOf('"b"'));
  });
});

describe('metric kernels', () => {
  it('rounds half away from zero at the reporting precision', () => {
    expect(roundTo(2.345, 2)).toBe(2.35);
    expect(roundTo(-2.345, 2)).toBe(-2.35);
    expect(roundTo(1 / 3, 2)).toBe(0.33);
  });

  it('counts sign changes and rejects non-unique roots', () => {
    expect(countSignChanges([-1, -1, 1, 1])).toBe(1);
    expect(countSignChanges([-1, 1, -1])).toBe(2);
    expect(countSignChanges([0, 0, 0])).toBe(0);
  });

  it('NPV discounts by the period index', () => {
    expect(npv(0.1, [100, 110])).toBeCloseTo(100 + 110 / 1.1, 10);
    expect(npv(0, [1, 2, 3])).toBe(6);
  });
});

describe('refresh dispatch', () => {
  const base = { token: 't', owner: 'o', repo: 'r', workflowFile: 'w.yml', ref: 'main' };

  it('treats 204 as a successful dispatch', async () => {
    const fetchImpl = (async () => new Response(null, { status: 204 })) as typeof fetch;
    await expect(dispatchRefreshWorkflow({ ...base, fetchImpl })).resolves.toEqual({ ok: true });
  });

  it('classifies 401 as an auth failure without echoing the body', async () => {
    const fetchImpl = (async () =>
      new Response('{"message":"Bad credentials for token ghp_secret"}', { status: 401 })) as typeof fetch;
    const result = await dispatchRefreshWorkflow({ ...base, fetchImpl });
    expect(result).toEqual({ ok: false, reason: 'dispatch.unauthorized' });
    expect(JSON.stringify(result)).not.toContain('ghp_secret');
  });

  it('fails closed on a network error', async () => {
    const fetchImpl = (async () => {
      throw new Error('ECONNRESET');
    }) as typeof fetch;
    await expect(dispatchRefreshWorkflow({ ...base, fetchImpl })).resolves.toEqual({
      ok: false,
      reason: 'dispatch.failed',
    });
  });
});

describe('audit chain and configuration', () => {
  it('rejects an empty chain as valid with no entries', () => {
    expect(verifyAuditChain([])).toEqual({ valid: true, brokenAt: null, verifiedAt: null });
  });

  it('detects a re-ordered log', () => {
    const one = appendAuditEntry([], {
      at: '2026-10-25T12:00:00Z',
      identity: 'admin',
      action: 'auth.login',
      target: 'login',
      requestId: 'r1',
    });
    const two = appendAuditEntry(one, {
      at: '2026-10-25T12:00:01Z',
      identity: 'admin',
      action: 'auth.logout',
      target: 'login',
      requestId: 'r2',
    });
    expect(verifyAuditChain([two[1] as never, two[0] as never]).valid).toBe(false);
  });

  it('closes the surface when either secret is missing or malformed', () => {
    expect(loadAdminConfig({}).ok).toBe(false);
    expect(loadAdminConfig({ ADMIN_PASSWORD_HASH: '$argon2id$v=19$m=65536,t=3,p=1$c2FsdA$aGFzaA' }).ok).toBe(false);
    expect(looksLikeArgon2idHash('plain-text-password')).toBe(false);
    expect(looksLikeArgon2idHash('$argon2id$v=19$m=65536,t=3,p=1$c2FsdA$aGFzaA')).toBe(true);
    const configured = loadAdminConfig({
      ADMIN_PASSWORD_HASH: '$argon2id$v=19$m=65536,t=3,p=1$c2FsdA$aGFzaA',
      ADMIN_SESSION_SECRET: 'z'.repeat(40),
      ADMIN_FRESHNESS_WINDOW_DAYS: '30',
      VERCEL_ENV: 'production',
    });
    expect(configured.ok).toBe(true);
    if (!configured.ok) return;
    expect(configured.config.freshnessWindowDays).toBe(30);
    expect(configured.config.environment).toBe('production');
  });
});

describe('snapshot loading and source labels', () => {
  it('reads a resolved snapshot and keeps the raw bytes for hashing', () => {
    const content = JSON.stringify({
      meta: { sourceId: 'x', publisher: 'P', dataset: 'D', sourceUrl: 'https://example.org/a', retrievedAt: '2026-10-25T00:00:00Z' },
      payload: { value: 1 },
    });
    const snapshot = snapshotFromFile('x.json', content);
    expect(snapshot.resolved).toBe(true);
    expect(snapshot.bytes).toBe(content);
    expect(snapshot.sourceUrl).toEqual(['https://example.org/a']);
  });

  it('marks an unresolved snapshot with its reason and no payload', () => {
    const content = JSON.stringify({
      meta: { sourceId: 'y', publisher: 'P', dataset: 'D', sourceUrl: 'https://example.org/b', retrievedAt: '2026-10-25T00:00:00Z' },
      resolved: false,
      unresolvedReason: 'series code unresolved',
    });
    const snapshot = snapshotFromFile('y.json', content);
    expect(snapshot.resolved).toBe(false);
    expect(snapshot.unresolvedReason).toBe('series code unresolved');
    expect(snapshot.payload).toBeUndefined();
  });

  it('names a known publisher and falls back to the host for an unknown one', () => {
    expect(publisherForUrl('https://ec.europa.eu/eurostat/api/x')).toBe('Eurostat');
    expect(publisherForUrl('https://unknown.example/path')).toBe('unknown.example');
    expect(publisherForUrl('not a url')).toBe('not a url');
  });
});
