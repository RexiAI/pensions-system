import { adminT } from '@/web/content/admin';

export const dynamic = 'force-dynamic';

const STAGES = ['dispatch', 'fetch', 'compute', 'review'] as const;

export default async function RefreshPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return (
    <section>
      <h1>{adminT('admin.refresh.title')}</h1>
      <dl>
        <dt>{adminT('admin.refresh.run')}</dt>
        <dd>
          <code>{decodeURIComponent(runId)}</code>
        </dd>
      </dl>
      <ol>
        {STAGES.map((stage) => (
          <li key={stage}>
            <span>{adminT(`admin.refresh.stage.${stage}`)}</span>{' '}
            <span className="status-chip" data-state="running">
              {adminT('admin.refresh.state.running')}
            </span>
          </li>
        ))}
      </ol>
      <p>
        <a href="/admin">{adminT('admin.refresh.leave')}</a>
      </p>
      <p>{adminT('admin.refresh.leaveNote')}</p>
    </section>
  );
}
