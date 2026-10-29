import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { adminT } from '@/web/content/admin';
import { SESSION_COOKIE_NAME, verifySession } from '@/web/admin/auth/session';
import { loadAdminConfig } from '@/web/admin/config';

/** The authenticated group: inverted operator bar, no public chrome. */
interface OperatorHead {
  environment: string;
  expires: string;
}

function environmentLabel(production: boolean): string {
  return production ? adminT('admin.brand.environment.production') : adminT('admin.brand.environment.preview');
}

async function operatorHead(): Promise<OperatorHead> {
  const jar = await cookies();
  const config = loadAdminConfig(process.env);
  const production = config.ok && config.config.environment === 'production';
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = config.ok ? verifySession(token, config.config.sessionSecret, new Date()) : null;
  return {
    environment: environmentLabel(production),
    expires: session?.ok ? new Date(session.session.expiresAt * 1000).toISOString().slice(11, 16) : '',
  };
}

export default async function AuthedAdminLayout({ children }: { children: ReactNode }) {
  const head = await operatorHead();
  const environment = head.environment;
  const expires = head.expires;
  return (
    <>
      <div className="operator-bar">
        <span>{adminT('admin.brand')}</span>
        <span>{environment}</span>
        <span>{`${adminT('admin.brand.expires')} ${expires}`}</span>
        <form action="/api/admin/logout" method="post">
          <button className="admin-btn" type="submit">
            {adminT('admin.brand.signOut')}
          </button>
        </form>
      </div>
      <main className="admin-main">{children}</main>
    </>
  );
}
