import { adminT } from '@/web/content/admin';

export interface AdminFormContext {
  sessionSecret: string;
  session: { sid: string; csrf: string; issuedAt: number; expiresAt: number };
}

export function fixedErrorResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export function unauthorized(): Response {
  return fixedErrorResponse(adminT('admin.session.expired'), 401);
}

export function forbidden(): Response {
  return fixedErrorResponse(adminT('admin.error.generic'), 403);
}

export function redirectTo(request: Request, path: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      location: new URL(path, request.url).toString(),
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export function requestId(): string {
  return crypto.randomUUID();
}

/** Reads an env var without scattering `??` through call sites. */
export function envOr(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export function formValue(form: FormData, name: string): string {
  return String(form.get(name) ?? '');
}
