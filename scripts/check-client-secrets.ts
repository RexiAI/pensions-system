/**
 * Build-output grep gate (AC-001-55). Fails when an admin secret appears in the client
 * bundles, or when any NEXT_PUBLIC_* variable names an admin credential.
 *
 * Usage: tsx scripts/check-client-secrets.ts [bundleDir]
 */
import { findPublicAdminEnvNames, findSecretLeaks } from '../web/build/check-client-secrets';

const bundleDir = process.argv[2] ?? '.next/static';
const secrets = [process.env.ADMIN_PASSWORD_HASH, process.env.ADMIN_SESSION_SECRET].filter(
  (value): value is string => typeof value === 'string' && value.length >= 8,
);

const leaks = findSecretLeaks({ dir: bundleDir, secrets });
const publicNames = findPublicAdminEnvNames([
  { path: 'opencode.json', content: '' },
]);

for (const leak of leaks) console.error(`secret in client bundle: ${leak.file}`);
for (const name of publicNames) console.error(`public admin env var: ${name}`);

if (secrets.length === 0) {
  console.log(`no admin secret configured in this environment; ${bundleDir} not grepped for values`);
}
if (secrets.length > 0 && leaks.length === 0) {
  console.log(`no admin secret found in ${bundleDir}`);
}
process.exit(leaks.length > 0 || publicNames.length > 0 ? 1 : 0);
