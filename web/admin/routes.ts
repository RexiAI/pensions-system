import { adminT } from '../content/admin';
import { isStateChanging, verifyCsrf } from './auth/csrf';
import { sessionTokenFromCookieHeader, verifySession } from './auth/session';
import type { SessionPayload } from './auth/session';
import { loadAdminConfig, unconfiguredBody } from './config';
import type { AdminEnv } from './config';

/**
 * The admin request gate, kept as a pure function so middleware and tests exercise the
 * same code. Every response carries `noindex` and `no-store`, including 401, 403 and 503.
 */
export const ADMIN_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
};

export type AdminResponseKind =
  | 'pass'
  | 'unconfigured'
  | 'unauthenticated'
  | 'csrf';

export interface AdminResponsePlan {
  kind: AdminResponseKind;
  status: number;
  headers: Record<string, string>;
  body: string;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/');
}

export function isLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname === '/api/admin/login';
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function plan(kind: AdminResponseKind, status: number, body: string, extra: Record<string, string> = {}): AdminResponsePlan {
  return {
    kind,
    status,
    headers: { ...ADMIN_SECURITY_HEADERS, 'content-type': 'text/plain; charset=utf-8', ...extra },
    body,
  };
}

export type CsrfMode = 'header' | 'form-body';

export interface AdminRequestInput {
  method: string;
  pathname: string;
  env: AdminEnv;
  cookieHeader?: string | undefined;
  csrfHeader?: string | undefined;
  /**
   * `header` (default) requires `X-CSRF-Token`. `form-body` defers the same check to the
   * route handler, which reads the synchronizer token from the submitted form: an HTML
   * form cannot set a header, and the token still has to match the session.
   */
  csrfMode?: CsrfMode;
  now: Date;
}

function unauthenticated(pathname: string): AdminResponsePlan {
  if (isApiPath(pathname)) return plan('unauthenticated', 401, adminT('admin.session.expired'));
  return plan('unauthenticated', 307, '', { location: '/admin/login' });
}

function csrfGuard(input: AdminRequestInput, session: SessionPayload): AdminResponsePlan {
  const requiresHeader = isStateChanging(input.method) && (input.csrfMode ?? 'header') === 'header';
  if (requiresHeader && !verifyCsrf(input.csrfHeader, session)) {
    return plan('csrf', 403, adminT('admin.error.generic'));
  }
  return plan('pass', 200, '');
}

function sessionGuard(input: AdminRequestInput, secret: string): AdminResponsePlan {
  const token = sessionTokenFromCookieHeader(input.cookieHeader);
  const session = verifySession(token, secret, input.now);
  if (!session.ok) return unauthenticated(input.pathname);
  return csrfGuard(input, session.session);
}

/** Config first (fail closed), then login, then session, then CSRF. */
export function evaluateAdminRequest(input: AdminRequestInput): AdminResponsePlan {
  const config = loadAdminConfig(input.env);
  if (!config.ok) return plan('unconfigured', 503, unconfiguredBody());
  if (isLoginPath(input.pathname)) return plan('pass', 200, '');
  return sessionGuard(input, config.config.sessionSecret);
}
