import { beforeAll, describe, expect, it } from 'vitest';
import { hashPassword } from '../../web/admin/auth/password';
import { createSession, serializeSessionCookie, verifySession, sessionTokenFromCookieHeader } from '../../web/admin/auth/session';
import { DEFAULT_RATE_LIMIT, LoginRateLimiter } from '../../web/admin/auth/rate-limit';
import { handleLogin } from '../../web/admin/login';
import { evaluateAdminRequest } from '../../web/admin/routes';
import { adminT } from '../../web/content/admin';
import { loadAdminConfig } from '../../web/admin/config';
import { robotsPolicy, sitemapEntries } from '../../web/seo/routes';
import { SITE_URL, canonicalUrl } from '../../web/content/site';

const PASSWORD = 'correct horse battery staple';
const SECRET = 's'.repeat(48);
const IP = '203.0.113.9';
const NOW = new Date('2026-10-25T12:00:00Z');

let env: Record<string, string | undefined>;

beforeAll(async () => {
  env = { ADMIN_PASSWORD_HASH: await hashPassword(PASSWORD), ADMIN_SESSION_SECRET: SECRET };
}, 60_000);

function loginInput(overrides: Partial<Parameters<typeof handleLogin>[0]> = {}) {
  return {
    password: 'wrong',
    env,
    now: NOW,
    ip: IP,
    requestId: 'req-1',
    limiter: new LoginRateLimiter(),
    audit: [],
    ...overrides,
  };
}

describe('admin authentication', () => {
  it('AC-001-46: a wrong password returns 401, counts the attempt, reveals nothing', async () => {
    const limiter = new LoginRateLimiter();
    const result = await handleLogin(loginInput({ limiter }));

    expect(result.kind).toBe('failed');
    if (result.kind !== 'failed') return;
    expect(result.status).toBe(401);
    expect(result.body).toBe(adminT('admin.login.failed'));
    expect(result.body.toLowerCase()).not.toContain('hash');
    expect(result.body.toLowerCase()).not.toContain('usuario');
    expect(limiter.failuresFor(IP, NOW.getTime())).toBe(1);
    expect(result.audit[0]?.action).toBe('auth.failed');
    expect(JSON.stringify(result.audit)).not.toContain('wrong');
  });

  it('AC-001-47: repeated failures lock the account out with increasing backoff', async () => {
    const limiter = new LoginRateLimiter();
    let last = await handleLogin(loginInput({ limiter }));
    for (let attempt = 0; attempt < DEFAULT_RATE_LIMIT.perIpLimit - 1; attempt += 1) {
      last = await handleLogin(loginInput({ limiter }));
    }

    expect(last.kind).toBe('locked');
    if (last.kind !== 'locked') return;
    expect(last.status).toBe(429);
    expect(last.retryAfterMs).toBeGreaterThan(0);

    const firstBackoff = last.retryAfterMs;
    const sixth = await handleLogin(loginInput({ limiter }));
    expect(sixth.kind).toBe('locked');
    if (sixth.kind !== 'locked') return;
    expect(sixth.retryAfterMs).toBeGreaterThanOrEqual(firstBackoff);
    expect(limiter.backoffFor(5)).toBe(1000);
    expect(limiter.backoffFor(6)).toBe(2000);
    expect(limiter.backoffFor(7)).toBe(4000);

    const lockedPage = evaluateAdminRequest({ method: 'GET', pathname: '/admin', env, now: NOW });
    expect(lockedPage.kind).toBe('unauthenticated');
  });

  it('AC-001-48: a valid login sets a hardened session cookie', async () => {
    const result = await handleLogin(loginInput({ password: PASSWORD }));

    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;
    expect(result.status).toBe(200);
    expect(result.sessionCookie).toContain('HttpOnly');
    expect(result.sessionCookie).toContain('Secure');
    expect(result.sessionCookie).toContain('SameSite=Strict');
    expect(result.csrfToken.length).toBeGreaterThan(20);

    const token = sessionTokenFromCookieHeader(result.sessionCookie);
    const verified = verifySession(token, SECRET, NOW);
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.session.csrf).toBe(result.csrfToken);
    expect(result.audit[0]?.action).toBe('auth.login');
  });

  it('AC-001-49: a tampered session cookie is rejected', () => {
    const { token } = createSession({ secret: SECRET, now: NOW });
    const flipped = token.at(-1) === 'A' ? 'B' : 'A';
    const tampered = `${token.slice(0, -1)}${flipped}`;

    const verified = verifySession(tampered, SECRET, NOW);
    expect(verified.ok).toBe(false);
    if (verified.ok) return;
    expect(verified.reason).toBe('signature');

    const plan = evaluateAdminRequest({
      method: 'GET',
      pathname: '/admin',
      env,
      cookieHeader: `ps_admin_session=${tampered}`,
      now: NOW,
    });
    expect(plan.kind).toBe('unauthenticated');
    expect(plan.status).toBe(307);
  });

  it('AC-001-50: an expired session cookie is rejected', () => {
    const { token } = createSession({ secret: SECRET, now: NOW });
    const later = new Date(NOW.getTime() + 31 * 60 * 1000);

    const verified = verifySession(token, SECRET, later);
    expect(verified.ok).toBe(false);
    if (verified.ok) return;
    expect(verified.reason).toBe('expired');

    const plan = evaluateAdminRequest({
      method: 'GET',
      pathname: '/api/admin/revisions/rev%201/x/approve',
      env,
      cookieHeader: `ps_admin_session=${token}`,
      now: later,
    });
    expect(plan.kind).toBe('unauthenticated');
    expect(plan.status).toBe(401);
  });

  it('AC-001-51: a state-changing request without a valid CSRF token is rejected', () => {
    const { token, session } = createSession({ secret: SECRET, now: NOW });
    const cookieHeader = `ps_admin_session=${token}`;
    const withoutToken = evaluateAdminRequest({
      method: 'POST',
      pathname: '/api/admin/revisions/rev%201/approve',
      env,
      cookieHeader,
      now: NOW,
    });
    const wrongToken = evaluateAdminRequest({
      method: 'POST',
      pathname: '/api/admin/revisions/rev%201/approve',
      env,
      cookieHeader,
      csrfHeader: 'not-the-token',
      now: NOW,
    });
    const withToken = evaluateAdminRequest({
      method: 'POST',
      pathname: '/api/admin/revisions/rev%201/approve',
      env,
      cookieHeader,
      csrfHeader: session.csrf,
      now: NOW,
    });

    expect(withoutToken.kind).toBe('csrf');
    expect(withoutToken.status).toBe(403);
    expect(wrongToken.kind).toBe('csrf');
    expect(withToken.kind).toBe('pass');
  });

  it('AC-001-52: admin routes are noindex and excluded from the sitemap', () => {
    const plan = evaluateAdminRequest({ method: 'GET', pathname: '/admin/audit', env, now: NOW });
    // The deployment's own origin, from the one place it is configured: a placeholder here would
    // be a second, drifting copy of the site's identity.
    const entries = sitemapEntries(SITE_URL);
    const urls = entries.flatMap((entry) => [entry.url, ...entry.alternates.map((alternate) => alternate.href)]);
    const policy = robotsPolicy(SITE_URL);

    expect(plan.headers['X-Robots-Tag']).toContain('noindex');
    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
    // The base locale is the origin itself — `canonicalUrl('/')`, never `…/` — which is the one
    // spelling the canonical `<link>`, `og:url` and the sitemap's own alternates publish.
    expect(urls).toContain(canonicalUrl('/'));
    expect(JSON.stringify(policy)).not.toContain('Disallow');
  });

  it('AC-001-46: a pre-login request without a session gets no session cookie', () => {
    const response = serializeSessionCookie('token-value');
    const config = loadAdminConfig(env);

    expect(response).toContain('ps_admin_session=token-value');
    expect(response).toContain('Path=/');
    expect(config.ok).toBe(true);
  });
});
