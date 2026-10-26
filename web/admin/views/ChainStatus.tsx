import { adminT } from '../../content/admin';

export interface ChainStatusProps {
  verifiedAt: string | null;
}

/** Never a bare "verified": the claim carries its own timestamp, or says it is unverified. */
export function ChainStatus({ verifiedAt }: ChainStatusProps) {
  if (verifiedAt === null) {
    return (
      <p className="chain" data-verified="false">
        {adminT('admin.audit.chainUnverified')}
      </p>
    );
  }
  return (
    <p className="chain" data-verified="true">
      {`${adminT('admin.audit.chainVerified')} ${verifiedAt}`}
    </p>
  );
}
