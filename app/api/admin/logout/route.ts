import { NextResponse } from 'next/server';
import { clearSessionCookie, sessionTokenFromCookieHeader, verifySession } from '@/web/admin/auth/session';
import { loadAdminConfig } from '@/web/admin/config';
import { appendAuditEntry } from '@/web/admin/audit/log';
import { redirectTo, requestId } from '@/web/admin/http';
import { readAudit, writeAudit } from '@/web/admin/persistence';
import { adminT } from '@/web/content/admin';

/** Signing out is a POST, never a link, so a prefetch cannot end the session. */
export async function POST(request: Request): Promise<Response> {
  const config = loadAdminConfig(process.env);
  const token = sessionTokenFromCookieHeader(request.headers.get('cookie') ?? undefined);

  if (config.ok) {
    const session = verifySession(token, config.config.sessionSecret, new Date());
    if (session.ok) {
      writeAudit(
        appendAuditEntry(readAudit(), {
          at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
          identity: 'admin',
          action: 'auth.logout',
          target: 'login',
          before: adminT('admin.audit.sessionStarted'),
          after: adminT('admin.audit.sessionEnded'),
          requestId: requestId(),
        }),
      );
    }
  }

  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.headers.append('set-cookie', clearSessionCookie());
  response.headers.set('cache-control', 'no-store');
  response.headers.set('x-robots-tag', 'noindex, nofollow');
  return response;
}

export function GET(request: Request): Response {
  return redirectTo(request, '/admin/login');
}
