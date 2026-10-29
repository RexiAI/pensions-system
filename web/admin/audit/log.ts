import { createHash } from 'node:crypto';
import { adminT } from '../../content/admin';

/**
 * Append-only, tamper-evident audit log (T16). Every entry chains the previous entry's
 * hash, so removing or editing an entry breaks verification from that point on. The log
 * has no delete or update path: `appendAuditEntry` returns a new array and never mutates.
 */
export type AuditAction =
  | 'auth.login'
  | 'auth.failed'
  | 'auth.logout'
  | 'auth.expired'
  | 'refresh.dispatched'
  | 'revision.published'
  | 'revision.discarded'
  | 'parameter.accepted'
  | 'parameter.rejected';

export interface AuditEntry {
  seq: number;
  at: string;
  identity: string;
  action: AuditAction;
  target: string;
  before: string | null;
  after: string | null;
  requestId: string;
  prevHash: string;
  hash: string;
}

export interface AuditInput {
  at: string;
  identity: string;
  action: AuditAction;
  target: string;
  before?: string | null;
  after?: string | null;
  requestId: string;
}

export const GENESIS_HASH = '0'.repeat(64);

function canonical(entry: Omit<AuditEntry, 'hash'>): string {
  return JSON.stringify([
    entry.seq,
    entry.at,
    entry.identity,
    entry.action,
    entry.target,
    entry.before,
    entry.after,
    entry.requestId,
    entry.prevHash,
  ]);
}

export function auditHash(entry: Omit<AuditEntry, 'hash'>): string {
  return createHash('sha256').update(canonical(entry)).digest('hex');
}

function prevSeq(previous: AuditEntry | undefined): number {
  return previous ? previous.seq + 1 : 0;
}

function prevHash(previous: AuditEntry | undefined): string {
  return previous ? previous.hash : GENESIS_HASH;
}

function orNull(value: string | null | undefined): string | null {
  return value ?? null;
}

function draftFrom(entries: readonly AuditEntry[], input: AuditInput): Omit<AuditEntry, 'hash'> {
  const previous = entries.at(-1);
  return {
    seq: prevSeq(previous),
    at: input.at,
    identity: input.identity,
    action: input.action,
    target: input.target,
    before: orNull(input.before),
    after: orNull(input.after),
    requestId: input.requestId,
    prevHash: prevHash(previous),
  };
}

/** Appending returns a new array; the input log is never mutated (append-only). */
export function appendAuditEntry(entries: readonly AuditEntry[], input: AuditInput): AuditEntry[] {
  const draft = draftFrom(entries, input);
  return [...entries, { ...draft, hash: auditHash(draft) }];
}

export interface ChainVerification {
  valid: boolean;
  brokenAt: number | null;
  verifiedAt: string | null;
}

export function verifyAuditChain(entries: readonly AuditEntry[], verifiedAt: string | null = null): ChainVerification {
  let prevHash = GENESIS_HASH;
  for (const [index, entry] of entries.entries()) {
    const { hash, ...rest } = entry;
    if (entry.seq !== index || entry.prevHash !== prevHash || auditHash(rest) !== hash) {
      return { valid: false, brokenAt: index, verifiedAt: null };
    }
    prevHash = hash;
  }
  return { valid: true, brokenAt: null, verifiedAt };
}

export function serialiseAuditLog(entries: readonly AuditEntry[]): string {
  return entries.map((entry) => JSON.stringify(entry)).join('\n') + (entries.length > 0 ? '\n' : '');
}

export function parseAuditLog(text: string): AuditEntry[] {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as AuditEntry);
}

/**
 * A failed authentication attempt is logged with no credential field at all: the
 * function cannot receive a password or a hash, so no caller can record one (AC-001-66).
 */
export function recordFailedAuthentication(input: {
  entries: readonly AuditEntry[];
  ip: string;
  at: string;
  requestId: string;
  identity?: string;
}): AuditEntry[] {
  return appendAuditEntry(input.entries, {
    at: input.at,
    identity: input.identity ?? 'anon',
    action: 'auth.failed',
    target: 'login',
    before: null,
    after: adminT('admin.audit.failedAttempt'),
    requestId: input.requestId,
  });
}
