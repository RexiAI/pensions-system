import { NextResponse } from 'next/server';
import { LoginRateLimiter } from '@/web/admin/auth/rate-limit';
import { fixedErrorResponse, clientIp, redirectTo, requestId } from '@/web/admin/http';
import { handleLogin } from '@/web/admin/login';
import { readAudit, writeAudit } from '@/web/admin/persistence';

const limiter = new LoginRateLimiter();

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const result = await handleLogin({
    password,
    env: process.env,
    now: new Date(),
    ip: clientIp(request),
    requestId: requestId(),
    limiter,
    audit: readAudit(),
  });

  if (result.kind === 'unconfigured') return fixedErrorResponse(result.body, 503);

  writeAudit(result.audit);
  if (result.kind === 'success') {
    const response = NextResponse.redirect(new URL('/admin', request.url), 303);
    response.headers.append('set-cookie', result.sessionCookie);
    response.headers.set('cache-control', 'no-store');
    response.headers.set('x-robots-tag', 'noindex, nofollow');
    return response;
  }
  return redirectTo(request, `/admin/login?error=${result.kind === 'locked' ? 'locked' : 'failed'}`);
}
