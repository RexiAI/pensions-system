'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import { applyTheme, readStoredTheme, THEME_ORDER } from './theme';
import type { ThemeChoice } from './theme';

export interface ThemeToggleProps {
  labels: Readonly<Record<ThemeChoice, string>>;
  groupLabel: string;
}

const ICONS: Readonly<Record<ThemeChoice, IconName>> = {
  system: 'contrast',
  light: 'sun',
  dark: 'moon',
};

/**
 * The bar's 40px theme control. It cycles system → light → dark, states the current choice in
 * its accessible name, and writes the same attribute the token layer already keys off.
 */
export function ThemeToggle({ labels, groupLabel }: ThemeToggleProps) {
  const [choice, setChoice] = useState<ThemeChoice>('system');
  useEffect(() => setChoice(readStoredTheme()), []);
  const advance = (): void => {
    const nextChoice = THEME_ORDER[(THEME_ORDER.indexOf(choice) + 1) % THEME_ORDER.length] ?? 'system';
    applyTheme(nextChoice);
    setChoice(nextChoice);
  };
  return (
    <button
      type="button"
      className="site-header__theme"
      onClick={advance}
      aria-label={`${groupLabel}: ${labels[choice]}`}
      title={labels[choice]}
    >
      <Icon name={ICONS[choice]} size={20} />
    </button>
  );
}
