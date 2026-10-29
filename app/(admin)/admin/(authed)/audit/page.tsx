import { verifyAuditChain } from '@/web/admin/audit/log';
import { readAudit } from '@/web/admin/persistence';
import { AuditTable } from '@/web/admin/views/AuditTable';

export const dynamic = 'force-dynamic';

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const { action } = await searchParams;
  const entries = readAudit();
  const filtered = action ? entries.filter((entry) => entry.action === action) : entries;
  const chain = verifyAuditChain(entries, new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
  return (
    <AuditTable
      entries={filtered}
      filterLabel={action ?? ''}
      verifiedAt={chain.valid ? chain.verifiedAt : null}
    />
  );
}
