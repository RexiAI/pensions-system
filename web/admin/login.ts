import { adminT } from '../content/admin';
import type { AuditEntry } from './audit/log';
import { appendAuditEntry, recordFailedAuthentication } from './audit/log';
import { verifyPassword } from './auth/password';
import { createSession, serializeSessionCookie } from './auth/session';
import type { LoginRateLimiter } from './auth/rate-limit';
import { loadAdminConfig, unconfiguredBody } from './config';
import type { AdminEnv } from './config';

/**
 * The login route's behaviour, as a pure async function. There is no username input, so
 * "unknown identity" is not expressible and the wrong-password response is the only
 * credential response that exists (AC-001-46 is satisfied structurally, not by copy).
 */
export interface LoginInput {
  password: string;
  env: AdminEnv;
  now: Date;
  ip: string;
  requestId: string;
  limiter: LoginRateLimiter;
  audit: readonly AuditEntry[];
  /** Injected so a test can exercise the flow without paying for argon2 every time. */
  verify?: (passwordHash: string, password: string) => Promise<boolean>;
}

export type LoginResult =
  | { kind: 'success'; status: 200; sessionCookie: string; csrfToken: string; audit: AuditEntry[] }
  | { kind: 'failed'; status: 401; body: string; retryAfterMs: number; audit: AuditEntry[] }
  | { kind: 'locked'; status: 429; body: string; retryAfterMs: number; audit: AuditEntry[] }
  | { kind: 'unconfigured'; status: 503; body: string };

function lockedBody(mode: 'ip' | 'global'): string {
  return [
    adminT('admin.login.lockedTitle'),
    mode === 'global' ? adminT('admin.login.lockedGlobal') : adminT('admin.login.lockedNetwork'),
    adminT('admin.login.lockedRelease'),
  ].join(' ');
}

export async function handleLogin(input: LoginInput): Promise<LoginResult> {
  const config = loadAdminConfig(input.env);
  if (!config.ok) return { kind: 'unconfigured', status: 503, body: unconfiguredBody() };

  const at = input.now.getTime();
  const before = input.limiter.check(input.ip, at);
  if (!before.allowed) {
    return {
      kind: 'locked',
      status: 429,
      body: lockedBody(before.mode),
      retryAfterMs: before.retryAfterMs,
      audit: [...input.audit],
    };
  }

  const verify = input.verify ?? verifyPassword;
  const valid = await verify(config.config.passwordHash, input.password);
  if (!valid) {
    const decision = input.limiter.recordFailure(input.ip, at);
    const audit = recordFailedAuthentication({
      entries: input.audit,
      ip: input.ip,
      at: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      requestId: input.requestId,
    });
    if (!decision.allowed) {
      return {
        kind: 'locked',
        status: 429,
        body: lockedBody(decision.mode),
        retryAfterMs: decision.retryAfterMs,
        audit,
      };
    }
    return {
      kind: 'failed',
      status: 401,
      body: adminT('admin.login.failed'),
      retryAfterMs: 0,
      audit,
    };
  }

  const session = createSession({ secret: config.config.sessionSecret, now: input.now });
  const audit = appendAuditEntry(input.audit, {
    at: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    identity: 'admin',
    action: 'auth.login',
    target: 'login',
    before: null,
    after: adminT('admin.audit.sessionStarted'),
    requestId: input.requestId,
  });
  return {
    kind: 'success',
    status: 200,
    sessionCookie: serializeSessionCookie(session.token),
    csrfToken: session.session.csrf,
    audit,
  };
}
