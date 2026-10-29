'use client';

import { useEffect, useState } from 'react';
import { applyTheme, readStoredTheme, THEME_ORDER } from './theme';
import type { ThemeChoice } from './theme';

export interface ThemeGroupProps {
  legend: string;
  labels: Readonly<Record<ThemeChoice, string>>;
}

/** The index panel's three-row theme choice: system, light, dark. */
export function ThemeGroup({ legend, labels }: ThemeGroupProps) {
  const [choice, setChoice] = useState<ThemeChoice>('system');
  useEffect(() => setChoice(readStoredTheme()), []);
  return (
    <fieldset className="index-panel__theme">
      <legend>{legend}</legend>
      {THEME_ORDER.map((option) => (
        <label className="index-panel__theme-row" key={option}>
          <input
            type="radio"
            name="theme"
            value={option}
            checked={choice === option}
            onChange={() => {
              applyTheme(option);
              setChoice(option);
            }}
          />
          <span>{labels[option]}</span>
        </label>
      ))}
    </fieldset>
  );
}
