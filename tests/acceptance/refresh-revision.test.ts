import { describe, expect, it } from 'vitest';
import { validateManifest } from '../../web/manifest/validate';
import { createMemoryDerivedStore } from '../../web/derived/store';
import { createRevision } from '../../web/admin/revisions/pending-store';
import { approveRevision } from '../../web/admin/revisions/approve';
import { mintReviewToken } from '../../web/admin/revisions/review-token';
import { createSession } from '../../web/admin/auth/session';
import { makeChange, NOW, SECRET, revisionStore } from '../fixtures/admin';

function sessionFor() {
  const { session } = createSession({ secret: SECRET, now: NOW, sessionId: 'sess-1' });
  return session;
}

function lastAudit(result: { ok: true; audit: readonly { action: string; identity: string; at: string; target: string }[] } | { ok: false }) {
  if (!result.ok) throw new Error('approval was expected to succeed');
  const entry = result.audit.at(-1);
  if (!entry) throw new Error('approval produced no audit entry');
  return entry;
}

function approve(revisionId: string, token: string, csrf?: string) {
  const session = sessionFor();
  return approveRevision({
    revisionId,
    reviewToken: token,
    csrfHeader: csrf ?? session.csrf,
    session,
    secret: SECRET,
    store,
    derived,
    audit: [],
    now: NOW,
    requestId: 'req-approve',
  });
}

let store = revisionStore();
let derived = createMemoryDerivedStore();

describe('refresh trigger and pending revision', () => {
  it('AC-001-57: a refresh produces a pending revision and leaves public figures unchanged', () => {
    store = revisionStore();
    derived = createMemoryDerivedStore();
    const change = makeChange();
    const result = createRevision({ store, snapshotHash: 'hash-s1', changes: [change], now: NOW });

    expect(result.created).toBe(true);
    expect(result.revision.status).toBe('pending');
    expect(result.revision.changes[0]?.before).toEqual(change.before);
    expect(result.revision.changes[0]?.after).toEqual(change.after);
    expect(result.revision.changes[0]?.source.length).toBeGreaterThan(0);
    expect(result.revision.changes[0]?.fetchedAt).toBe('2026-10-25T12:00:00Z');
    expect(result.revision.changes[0]?.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(derived.written()).toEqual([]);
    expect(derived.read('fig-01')).toBeUndefined();
  });

  it('AC-001-58: approval publishes the revision and writes an audit entry', () => {
    store = revisionStore();
    derived = createMemoryDerivedStore();
    const { revision } = createRevision({ store, snapshotHash: 'hash-a', changes: [makeChange()], now: NOW });
    const token = mintReviewToken({ secret: SECRET, revisionId: revision.id, now: NOW });

    const result = approve(revision.id, token);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.published).toEqual(['fig-01']);
    expect(derived.read('fig-01')?.value).toEqual({ latest: 0.42 });
    expect(store.get(revision.id)?.status).toBe('published');
    const entry = lastAudit(result);
    expect(entry.action).toBe('revision.published');
    expect(entry.identity).toBe('admin');
    expect(entry.at).toBe('2026-10-25T12:00:00Z');
    expect(entry.target).toBe(revision.id);
  });

  it('AC-001-59: a duplicate refresh for the same snapshot does not stack', () => {
    store = revisionStore();
    const first = createRevision({ store, snapshotHash: 'hash-dup', changes: [makeChange()], now: NOW });
    const second = createRevision({ store, snapshotHash: 'hash-dup', changes: [makeChange()], now: NOW });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.revision.id).toBe(first.revision.id);
    expect(store.snapshot().filter((revision) => revision.status === 'pending')).toHaveLength(1);
  });

  it('AC-001-60: a published revision still resolves to a manifest', () => {
    store = revisionStore();
    derived = createMemoryDerivedStore();
    const { revision } = createRevision({ store, snapshotHash: 'hash-m', changes: [makeChange()], now: NOW });
    const token = mintReviewToken({ secret: SECRET, revisionId: revision.id, now: NOW });
    approve(revision.id, token);

    const published = derived.read('fig-01');
    expect(published).toBeDefined();
    if (!published) return;
    expect(published.manifest.sourceUrl.length).toBeGreaterThan(0);
    expect(published.manifest.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(published.manifest.formulaId).toBe('dependency-ratio.v1');
    expect(published.manifest.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(published.manifest.reproducePath).toBe('scripts/compute.ts');
    expect(validateManifest(published.manifest, { fileExists: () => true }).ok).toBe(true);
  });

  it('AC-001-71: a newer snapshot supersedes an older pending revision', () => {
    store = revisionStore();
    derived = createMemoryDerivedStore();
    const older = createRevision({ store, snapshotHash: 'hash-s1', changes: [makeChange()], now: NOW });
    const newer = createRevision({ store, snapshotHash: 'hash-s2', changes: [makeChange()], now: NOW });

    expect(older.revision.status).toBe('pending');
    expect(newer.superseded).toEqual([older.revision.id]);
    const superseded = store.get(older.revision.id);
    expect(superseded?.status).toBe('superseded');
    expect(superseded?.supersededBy).toBe(newer.revision.id);

    const token = mintReviewToken({ secret: SECRET, revisionId: older.revision.id, now: NOW });
    const result = approve(older.revision.id, token);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('superseded');
    expect(derived.written()).toEqual([]);
  });

  it('AC-001-72: approval requires a revision-bound review token', () => {
    store = revisionStore();
    derived = createMemoryDerivedStore();
    const target = createRevision({ store, snapshotHash: 'hash-t1', changes: [makeChange()], now: NOW });

        const absentSession = sessionFor();
    const absent = approveRevision({
      revisionId: target.revision.id,
      reviewToken: undefined,
      csrfHeader: absentSession.csrf,
      session: absentSession,
      secret: SECRET,
      store,
      derived,
      audit: [],
      now: NOW,
      requestId: 'req-1',
    });
    const otherRevisionToken = mintReviewToken({ secret: SECRET, revisionId: 'rev 1999-01-01.9', now: NOW });
    const wrongRevision = approve(target.revision.id, otherRevisionToken);
    const healthyToken = mintReviewToken({ secret: SECRET, revisionId: target.revision.id, now: NOW });
    const staleSession = sessionFor();
    const stale = approveRevision({
      revisionId: target.revision.id,
      reviewToken: healthyToken,
      csrfHeader: staleSession.csrf,
      session: staleSession,
      secret: SECRET,
      store,
      derived,
      audit: [],
      now: new Date(NOW.getTime() + 16 * 60 * 1000),
      requestId: 'req-2',
    });

    for (const result of [absent, wrongRevision, stale]) {
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.reason).toBe('review-token');
    }
    expect(derived.written()).toEqual([]);
    expect(store.get(target.revision.id)?.status).toBe('pending');
  });

  it('AC-001-58: approval without CSRF or with an invalid manifest is refused', () => {
    store = revisionStore();
    derived = createMemoryDerivedStore();
    const { revision } = createRevision({ store, snapshotHash: 'hash-c', changes: [makeChange()], now: NOW });
    const token = mintReviewToken({ secret: SECRET, revisionId: revision.id, now: NOW });

    const noCsrfSession = sessionFor();
    const noCsrf = approveRevision({
      revisionId: revision.id,
      reviewToken: token,
      csrfHeader: undefined,
      session: noCsrfSession,
      secret: SECRET,
      store,
      derived,
      audit: [],
      now: NOW,
      requestId: 'req-3',
    });
    expect(noCsrf.ok).toBe(false);
    if (!noCsrf.ok) expect(noCsrf.reason).toBe('csrf');

    const badManifest = createMemoryDerivedStore();
    const brokenStore = revisionStore();
    const broken = createRevision({
      store: brokenStore,
      snapshotHash: 'hash-broken',
      changes: [makeChange({ reproducePath: 'scripts/missing.ts' })],
      now: NOW,
    });
    const brokenToken = mintReviewToken({ secret: SECRET, revisionId: broken.revision.id, now: NOW });
    const brokenSession = sessionFor();
    const result = approveRevision({
      revisionId: broken.revision.id,
      reviewToken: brokenToken,
      csrfHeader: brokenSession.csrf,
      session: brokenSession,
      secret: SECRET,
      store: brokenStore,
      derived: badManifest,
      audit: [],
      now: NOW,
      requestId: 'req-4',
      fileExists: (path) => path === 'scripts/compute.ts',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('manifest-invalid');
    expect(badManifest.written()).toEqual([]);
  });
});
