import type { FigureChange, PendingRevision, RevisionStore } from './types';

export interface InMemoryRevisionStore extends RevisionStore {
  snapshot(): PendingRevision[];
}

export function createMemoryRevisionStore(initial: readonly PendingRevision[] = []): InMemoryRevisionStore {
  const revisions = new Map<string, PendingRevision>(initial.map((revision) => [revision.id, revision]));
  return {
    list: () => [...revisions.values()].sort((a, b) => a.id.localeCompare(b.id)),
    get: (id) => revisions.get(id),
    save: (revision) => {
      revisions.set(revision.id, revision);
    },
    snapshot: () => [...revisions.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function revisionIdFor(now: Date, existing: readonly PendingRevision[]): string {
  const day = now.toISOString().slice(0, 10);
  const sameDay = existing.filter((revision) => revision.id.startsWith(`rev ${day}.`)).length;
  return `rev ${day}.${sameDay + 1}`;
}

export interface CreateRevisionResult {
  created: boolean;
  revision: PendingRevision;
  superseded: string[];
}

/**
 * Creates a pending revision, or returns the existing one for the same source snapshot
 * (idempotent, AC-001-59). Any other pending revision is superseded and can no longer be
 * approved (AC-001-71).
 */
export function createRevision(input: {
  store: RevisionStore;
  snapshotHash: string;
  changes: readonly FigureChange[];
  now: Date;
}): CreateRevisionResult {
  const existing = input.store.list().find(
    (revision) => revision.status === 'pending' && revision.snapshotHash === input.snapshotHash,
  );
  if (existing) return { created: false, revision: existing, superseded: [] };

  const id = revisionIdFor(input.now, input.store.list());
  const superseded: string[] = [];
  for (const revision of input.store.list()) {
    if (revision.status !== 'pending') continue;
    input.store.save({ ...revision, status: 'superseded', supersededBy: id });
    superseded.push(revision.id);
  }
  const revision: PendingRevision = {
    id,
    createdAt: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    snapshotHash: input.snapshotHash,
    status: 'pending',
    changes: [...input.changes],
  };
  input.store.save(revision);
  return { created: true, revision, superseded };
}

export function approveBlocker(revision: PendingRevision): 'superseded' | 'published' | null {
  if (revision.status === 'pending') return null;
  return revision.status;
}

export function pendingFor(store: RevisionStore): PendingRevision[] {
  return store.list().filter((revision) => revision.status === 'pending');
}
