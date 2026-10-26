import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableStringify } from '../ingest/deterministic-json';
import type { AuditEntry } from './audit/log';
import { parseAuditLog, serialiseAuditLog } from './audit/log';
import type { ParameterProposal } from './parameters/proposal';
import type { PendingRevision, RevisionStore } from './revisions/types';

/**
 * Committed-file persistence for the admin surface (open issues 14 and 15): pending
 * revisions live outside `data/derived/`, the audit log is append-only JSONL, and
 * proposals are one file each.
 *
 * Every path is composed with a literal `data` segment at the call site. A caller-supplied
 * directory makes the path dynamic, and the bundler's output tracer then follows it into
 * the entire repository — measured as a 45 MB server trace. Static scope keeps the trace
 * limited to `data/`.
 */
export const PENDING_DIR = 'data/pending';
export const AUDIT_FILE = 'data/audit/audit.jsonl';
export const PROPOSALS_DIR = 'data/proposals';

function pendingDir(): string {
  return join(process.cwd(), 'data', 'pending');
}

function proposalsDir(): string {
  return join(process.cwd(), 'data', 'proposals');
}

function auditPath(): string {
  return join(process.cwd(), 'data', 'audit', 'audit.jsonl');
}

export function createFileRevisionStore(): RevisionStore {
  const load = (): PendingRevision[] => {
    try {
      return readdirSync(pendingDir())
        .filter((file) => file.endsWith('.json'))
        .map((file) => JSON.parse(readFileSync(join(pendingDir(), file), 'utf8')) as PendingRevision);
    } catch {
      return [];
    }
  };
  return {
    list: () => load().sort((a, b) => a.id.localeCompare(b.id)),
    get(id) {
      return load().find((revision) => revision.id === id);
    },
    save(revision) {
      mkdirSync(pendingDir(), { recursive: true });
      writeFileSync(
        join(pendingDir(), `${revision.id.replace(/\s+/g, '-')}.json`),
        stableStringify(revision),
        'utf8',
      );
    },
  };
}

export function readAudit(): AuditEntry[] {
  try {
    return parseAuditLog(readFileSync(auditPath(), 'utf8'));
  } catch {
    return [];
  }
}

/** Writes the whole log; callers only ever pass a longer array, so it stays append-only. */
export function writeAudit(entries: readonly AuditEntry[]): void {
  mkdirSync(join(process.cwd(), 'data', 'audit'), { recursive: true });
  writeFileSync(auditPath(), serialiseAuditLog(entries), 'utf8');
}

export function readProposals(): ParameterProposal[] {
  try {
    return readdirSync(proposalsDir())
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(readFileSync(join(proposalsDir(), file), 'utf8')) as ParameterProposal);
  } catch {
    return [];
  }
}

export function writeProposal(proposal: ParameterProposal): void {
  mkdirSync(proposalsDir(), { recursive: true });
  writeFileSync(join(proposalsDir(), `${proposal.id}.json`), stableStringify(proposal), 'utf8');
}
