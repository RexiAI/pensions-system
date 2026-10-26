import { adminT } from '../content/admin';
import { verifyCsrf } from './auth/csrf';
import { sessionTokenFromCookieHeader, verifySession } from './auth/session';
import type { SessionPayload } from './auth/session';
import { loadAdminConfig } from './config';
import { fixedErrorResponse, forbidden, unauthorized } from './http';

type SessionGuard =
  | { ok: true; secret: string; session: SessionPayload }
  | { ok: false; response: Response };

export type FormGuard =
  | { ok: true; secret: string; session: SessionPayload; form: FormData }
  | { ok: false; response: Response };

/** Config first (fail closed), then session. */
function sessionGuard(request: Request): SessionGuard {
  const config = loadAdminConfig(process.env);
  if (!config.ok) {
    return { ok: false, response: fixedErrorResponse(adminT('admin.error.generic'), 503) };
  }
  const session = verifySession(
    sessionTokenFromCookieHeader(request.headers.get('cookie') ?? undefined),
    config.config.sessionSecret,
    new Date(),
  );
  if (!session.ok) return { ok: false, response: unauthorized() };
  return { ok: true, secret: config.config.sessionSecret, session: session.session };
}

/** The form carries the same synchronizer token the header would (AC-001-51). */
function csrfGuard(form: FormData, session: SessionPayload): Response | null {
  return verifyCsrf(String(form.get('csrf') ?? ''), session) ? null : forbidden();
}

/**
 * Session, then the submitted form's CSRF token. Every state-changing form route enters
 * through this one function, so a new route cannot check the session and forget the token.
 */
export async function guardedForm(request: Request): Promise<FormGuard> {
  const guard = sessionGuard(request);
  if (!guard.ok) return { ok: false, response: guard.response };
  const form = await request.formData();
  const failure = csrfGuard(form, guard.session);
  if (failure) return { ok: false, response: failure };
  return { ok: true, secret: guard.secret, session: guard.session, form };
}
