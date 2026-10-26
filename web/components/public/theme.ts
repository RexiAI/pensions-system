'use client';

export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_ORDER: readonly ThemeChoice[] = ['system', 'light', 'dark'];

const STORAGE_KEY = 'pensions-theme';

function isChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && (THEME_ORDER as readonly string[]).includes(value);
}

export function readStoredTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isChoice(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * `system` is the absence of the attribute: the page then follows the reader's OS setting,
 * which is what `color-scheme: light dark` and the `[data-theme]` overrides are built around.
 */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // A browser with storage disabled keeps the choice for this page only.
  }
}
