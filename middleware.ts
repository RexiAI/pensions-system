import { NextResponse, type NextRequest } from 'next/server';
import { evaluateAdminRequest } from './web/admin/routes';
import type { AdminResponsePlan } from './web/admin/routes';

/**
 * The admin gate runs here, before any admin layout mounts. An unconfigured deployment
 * gets a plain-text 503 with no chrome; an unauthenticated page request is redirected to
 * the login page and an unauthenticated API request gets a 401. Every response carries
 * `noindex` and `no-store`, including 401, 403 and 503.
 */
export const config = {
  runtime: 'nodejs',
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

function applyHeaders(response: NextResponse, plan: AdminResponsePlan): NextResponse {
  for (const [name, value] of Object.entries(plan.headers)) {
    if (name === 'location') continue;
    response.headers.set(name, value);
  }
  return response;
}

function respond(plan: AdminResponsePlan, request: NextRequest): NextResponse {
  if (plan.kind === 'pass') return applyHeaders(NextResponse.next(), plan);
  if (plan.status === 307) {
    const location = plan.headers.location ?? '/admin/login';
    return applyHeaders(NextResponse.redirect(new URL(location, request.url), 307), plan);
  }
  return applyHeaders(
    new NextResponse(plan.body, { status: plan.status, headers: { 'content-type': 'text/plain; charset=utf-8' } }),
    plan,
  );
}

export function middleware(request: NextRequest): NextResponse {
  const plan = evaluateAdminRequest({
    method: request.method,
    pathname: request.nextUrl.pathname,
    env: process.env,
    cookieHeader: request.headers.get('cookie') ?? undefined,
    csrfHeader: request.headers.get('x-csrf-token') ?? undefined,
    // Form posts carry the same synchronizer token in the body; the route handler
    // verifies it there, because an HTML form cannot set a request header.
    csrfMode: request.nextUrl.pathname.startsWith('/api/admin/') ? 'form-body' : 'header',
    now: new Date(),
  });
  return respond(plan, request);
}
