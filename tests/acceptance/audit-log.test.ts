import { describe, expect, it } from 'vitest';
import {
  GENESIS_HASH,
  appendAuditEntry,
  parseAuditLog,
  recordFailedAuthentication,
  serialiseAuditLog,
  verifyAuditChain,
} from '../../web/admin/audit/log';
import { AuditTable } from '../../web/admin/views/AuditTable';
import { adminT } from '../../web/content/admin';
import { NOW } from '../fixtures/admin';
import { renderComponent } from '../fixtures/figures';

const AT = '2026-10-25T12:00:00Z';

function sampleEntries() {
  const one = appendAuditEntry([], {
    at: AT,
    identity: 'admin',
    action: 'auth.login',
    target: 'login',
    before: null,
    after: adminT('admin.audit.sessionStarted'),
    requestId: 'req-1',
  });
  return appendAuditEntry(one, {
    at: AT,
    identity: 'admin',
    action: 'revision.published',
    target: 'rev 2026-10-25.1',
    before: adminT('admin.status.pending'),
    after: adminT('admin.audit.revisionPublished'),
    requestId: 'req-2',
  });
}

describe('audit log', () => {
  it('AC-001-65: every admin action is recorded append-only', () => {
    const first = appendAuditEntry([], {
      at: AT,
      identity: 'admin',
      action: 'auth.login',
      target: 'login',
      before: null,
      after: adminT('admin.audit.sessionStarted'),
      requestId: 'req-1',
    });
    const second = appendAuditEntry(first, {
      at: AT,
      identity: 'admin',
      action: 'revision.published',
      target: 'rev 2026-10-25.1',
      before: adminT('admin.status.pending'),
      after: adminT('admin.audit.revisionPublished'),
      requestId: 'req-2',
    });

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(2);
    expect(second[0]).toEqual(first[0]);
    expect(second[0]?.prevHash).toBe(GENESIS_HASH);
    expect(second[1]?.prevHash).toBe(second[0]?.hash);
    for (const entry of second) {
      expect(entry.identity).toBe('admin');
      expect(entry.at).toBe(AT);
      expect(entry.action).toBeTruthy();
      expect(entry.target).toBeTruthy();
      expect(entry.requestId).toBeTruthy();
      expect(entry).toHaveProperty('before');
      expect(entry).toHaveProperty('after');
      expect(entry.hash).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(verifyAuditChain(second, AT)).toMatchObject({ valid: true, brokenAt: null, verifiedAt: AT });
  });

  it('AC-001-65: editing or removing an entry breaks the chain', () => {
    const entries = sampleEntries();
    const tampered = [{ ...entries[0]!, after: 'sesión iniciada por otra persona' }, entries[1]!];
    const removed = [entries[1]!];

    expect(verifyAuditChain(tampered).valid).toBe(false);
    expect(verifyAuditChain(tampered).brokenAt).toBe(0);
    expect(verifyAuditChain(removed).valid).toBe(false);
    expect(verifyAuditChain(removed).brokenAt).toBe(0);
  });

  it('AC-001-66: failed authentication is logged without the credential', () => {
    const attemptedPassword = 'hunter2-do-not-store';
    const entries = recordFailedAuthentication({
      entries: [],
      ip: '203.0.113.9',
      at: AT,
      requestId: 'req-fail',
    });
    const serialised = serialiseAuditLog(entries);
    const [entry] = parseAuditLog(serialised);

    expect(entries).toHaveLength(1);
    expect(entry?.action).toBe('auth.failed');
    expect(entry?.target).toBe('login');
    expect(entry?.after).toBe(adminT('admin.audit.failedAttempt'));
    expect(serialised).not.toContain(attemptedPassword);
    expect(serialised.toLowerCase()).not.toContain('password');
    expect(serialised.toLowerCase()).not.toContain('argon2');
    expect(Object.keys(entry ?? {})).not.toContain('credential');
  });

  it('AC-001-67: the audit log is readable in the admin panel', () => {
    const entries = sampleEntries();
    const html = renderComponent(AuditTable, { entries, filterLabel: 'todo', verifiedAt: AT });

    expect(html).toContain(adminT('admin.audit.title'));
    expect(html).toContain('auth.login');
    expect(html).toContain('revision.published');
    expect(html).toContain('rev 2026-10-25.1');
    expect(html).toContain('req-2');
    expect(html).toContain('(2)');
    expect(html).toContain(adminT('admin.audit.appendOnly'));
    // No edit affordance of any kind: no button, no input, no select, no checkbox.
    expect(html).not.toContain('<button');
    expect(html).not.toContain('<input');
    expect(html).not.toContain('<select');
    expect(html).not.toContain('checkbox');
  });

  it('AC-001-67: an unverified chain is never displayed as verified', () => {
    const entries = sampleEntries();
    const unverified = renderComponent(AuditTable, { entries, filterLabel: 'todo', verifiedAt: null });
    const tampered = renderComponent(AuditTable, {
      entries: [{ ...entries[0]!, after: 'alterado' }, entries[1]!],
      filterLabel: 'todo',
      verifiedAt: AT,
    });

    expect(unverified).toContain(adminT('admin.audit.chainUnverified'));
    expect(tampered).toContain(adminT('admin.audit.chainUnverified'));
    expect(tampered).not.toContain(adminT('admin.audit.chainVerified'));
    expect(NOW.toISOString()).toContain('2026-10-25');
  });
});
