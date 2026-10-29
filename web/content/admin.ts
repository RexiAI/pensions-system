import adminStrings from './data/admin/es.json';

/**
 * Admin namespace of the same resource system (design §Admin Surface: Spanish only, one
 * operator). A shared component that emits a locale link is a defect in admin, so these
 * strings are a separate namespace, never the public five-locale one.
 */
export const ADMIN_STRINGS: Readonly<Record<string, string>> = adminStrings;

export const ADMIN_KEYS = Object.keys(adminStrings).sort();

export function adminT(key: string): string {
  const value = ADMIN_STRINGS[key];
  return value ?? key;
}
