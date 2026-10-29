import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { handleLogin } from '../../web/admin/login';
import { LoginRateLimiter } from '../../web/admin/auth/rate-limit';
import { evaluateAdminRequest } from '../../web/admin/routes';
import { unconfiguredBody } from '../../web/admin/config';
import { findPublicAdminEnvNames, findSecretLeaks } from '../../web/build/check-client-secrets';

const SECRET = 'server-side-session-secret-value-0123456789';
const MISSING_HASH = { ADMIN_SESSION_SECRET: SECRET };
const MISSING_SECRET = { ADMIN_PASSWORD_HASH: '$argon2id$v=19$m=65536,t=3,p=1$c2FsdHNhbHRzYWx0c2E$hashhashhashhashhashhashhashhashhashhashha' };
const NOW = new Date('2026-10-25T12:00:00Z');

describe('fail-closed configuration', () => {
  it('AC-001-53: an unconfigured credential fails closed to 503', () => {
    const withoutHash = evaluateAdminRequest({ method: 'GET', pathname: '/admin', env: MISSING_HASH, now: NOW });
    const withoutSecret = evaluateAdminRequest({ method: 'GET', pathname: '/admin', env: MISSING_SECRET, now: NOW });
    const apiWithoutHash = evaluateAdminRequest({
      method: 'POST',
      pathname: '/api/admin/refresh',
      env: MISSING_HASH,
      now: NOW,
    });

    for (const plan of [withoutHash, withoutSecret, apiWithoutHash]) {
      expect(plan.kind).toBe('unconfigured');
      expect(plan.status).toBe(503);
    }
    expect(withoutHash.body).toBe(withoutSecret.body);
    expect(withoutHash.body).toBe(unconfiguredBody());
  });

  it('AC-001-55: no admin secret appears in the client bundle', () => {
    const dir = mkdtempSync(join(tmpdir(), 'bundle-'));
    mkdirSync(join(dir, '_next', 'static'), { recursive: true });
    writeFileSync(join(dir, '_next', 'static', 'app.js'), 'console.log("public bundle")', 'utf8');

    expect(findSecretLeaks({ dir, secrets: [SECRET] })).toEqual([]);
    expect(findSecretLeaks({ dir, secrets: ['public bundle'] })).toHaveLength(1);
    expect(findSecretLeaks({ dir, secrets: ['not-present-anywhere'] })).toEqual([]);

    writeFileSync(join(dir, '_next', 'static', 'leak.js'), `const k = "${SECRET}";`, 'utf8');
    const leaks = findSecretLeaks({ dir, secrets: [SECRET] });
    expect(leaks).toHaveLength(1);
    expect(leaks[0]?.file).toContain('leak.js');

    expect(
      findPublicAdminEnvNames([
        { path: 'web/admin/config.ts', content: 'process.env.ADMIN_PASSWORD_HASH' },
        { path: 'web/components/bad.tsx', content: 'process.env.NEXT_PUBLIC_ADMIN_PASSWORD' },
      ]),
    ).toEqual(['web/components/bad.tsx: NEXT_PUBLIC_ADMIN_PASSWORD']);
  });

  it('AC-001-56: error bodies do not echo configuration detail', async () => {
    const plan = evaluateAdminRequest({ method: 'GET', pathname: '/admin', env: {}, now: NOW });
    const login = await handleLogin({
      password: 'x',
      env: {},
      now: NOW,
      ip: '198.51.100.7',
      requestId: 'req-9',
      limiter: new LoginRateLimiter(),
      audit: [],
    });

    const bodies = [plan.body, login.kind === 'unconfigured' ? login.body : ''];
    for (const body of bodies) {
      expect(body.toLowerCase()).not.toContain('admin_password_hash');
      expect(body.toLowerCase()).not.toContain('admin_session_secret');
      expect(body.toLowerCase()).not.toContain('argon2');
      expect(body).not.toContain(SECRET);
      expect(body).not.toContain('config.unconfigured');
    }
  });

  it('AC-001-70: the 503 escapes the admin shell', () => {
    const plan = evaluateAdminRequest({ method: 'GET', pathname: '/admin', env: MISSING_HASH, now: NOW });

    expect(plan.status).toBe(503);
    expect(plan.headers['Cache-Control']).toBe('no-store');
    expect(plan.headers['X-Robots-Tag']).toContain('noindex');
    // No markup at all: no operator bar, no navigation, no session-bearing elements.
    expect(plan.body).not.toContain('<');
    expect(plan.body.toLowerCase()).not.toContain('operator');
    expect(plan.body.toLowerCase()).not.toContain('session');
    expect(plan.body.toLowerCase()).not.toContain('form');
  });
});
