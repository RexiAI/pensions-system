import { describe, expect, it } from 'vitest';
import { ADMIN_SECURITY_HEADERS, evaluateAdminRequest } from '../../web/admin/routes';
import { listSourceFiles, readSource } from '../helpers/source-scan';

const PUBLIC_PAGE = 'app/(public)/(home)/page.tsx';
const LOCALE_PAGE = 'app/(public)/[locale]/page.tsx';
const ADMIN_LAYOUT = 'app/(admin)/admin/layout.tsx';
const AUTED_LAYOUT = 'app/(admin)/admin/(authed)/layout.tsx';
const MIDDLEWARE = 'middleware.ts';

describe('static public routes, dynamic admin routes', () => {
  it('AC-001-69: public routes are static and admin routes are dynamic', () => {
    const publicPage = readSource(PUBLIC_PAGE);
    const localePage = readSource(LOCALE_PAGE);
    const adminLayout = readSource(ADMIN_LAYOUT);
    const authedLayout = readSource(AUTED_LAYOUT);
    const middleware = readSource(MIDDLEWARE);

    expect(publicPage).toContain("export const dynamic = 'force-static'");
    expect(localePage).toContain("export const dynamic = 'force-static'");
    expect(localePage).toContain('generateStaticParams');
    expect(adminLayout).toContain("export const dynamic = 'force-dynamic'");

    // The public page never reads a session or a cookie.
    expect(publicPage).not.toContain('cookies');
    expect(localePage).not.toContain('cookies');
    // The admin tree is where the session is read.
    expect(authedLayout).toContain('cookies');

    // Every admin response is no-store and noindex, enforced by the shared gate.
    expect(ADMIN_SECURITY_HEADERS['Cache-Control']).toBe('no-store');
    expect(ADMIN_SECURITY_HEADERS['X-Robots-Tag']).toContain('noindex');
    const plan = evaluateAdminRequest({
      method: 'GET',
      pathname: '/admin/audit',
      env: {
        ADMIN_PASSWORD_HASH: '$argon2id$v=19$m=65536,t=3,p=1$c2FsdA$hash',
        ADMIN_SESSION_SECRET: 'x'.repeat(48),
      },
      now: new Date('2026-10-25T12:00:00Z'),
    });
    expect(plan.status).toBe(307);
    expect(plan.headers['Cache-Control']).toBe('no-store');
    expect(middleware).toContain('evaluateAdminRequest');
    expect(middleware).toContain("runtime: 'nodejs'");
  });

  it('AC-001-69: admin routes are not reachable from the public tree', () => {
    const publicFiles = listSourceFiles('app/(public)').concat(listSourceFiles('web/components/public'));
    for (const file of publicFiles) {
      const source = readSource(file);
      expect(source, `${file} must not import an admin module`).not.toContain("/admin/");
      expect(source).not.toContain('admin/layout');
    }
  });
});
