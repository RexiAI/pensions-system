import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySession } from './auth/session';
import type { SessionPayload } from './auth/session';
import { loadAdminConfig } from './config';
import type { AdminConfig } from './config';

export type PageSession =
  | { ok: true; config: AdminConfig; session: SessionPayload }
  | { ok: false; reason: 'unconfigured' | 'unauthenticated' };

/**
 * The verified cookie session an admin server component renders with. Pages apply their own
 * policy to the result (redirect, render a closed state, mint a token); none of them re-read
 * or re-verify the cookie themselves.
 */
export async function pageSession(): Promise<PageSession> {
  const config = loadAdminConfig(process.env);
  if (!config.ok) return { ok: false, reason: 'unconfigured' };
  const jar = await cookies();
  const verified = verifySession(jar.get(SESSION_COOKIE_NAME)?.value, config.config.sessionSecret, new Date());
  if (!verified.ok) return { ok: false, reason: 'unauthenticated' };
  return { ok: true, config: config.config, session: verified.session };
}
