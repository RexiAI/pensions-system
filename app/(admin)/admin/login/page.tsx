import { adminT } from '@/web/content/admin';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message =
    error === 'locked'
      ? adminT('admin.login.lockedTitle')
      : error
        ? adminT('admin.login.failed')
        : null;
  return (
    <main className="admin-main">
      <h1>{adminT('admin.login.title')}</h1>
      {message ? (
        <p className="admin-failure" role="alert">
          {message}
        </p>
      ) : null}
      <form action="/api/admin/login" method="post">
        <label htmlFor="password">{adminT('admin.login.password')}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <button className="admin-btn" type="submit">
          {adminT('admin.login.submit')}
        </button>
      </form>
    </main>
  );
}
