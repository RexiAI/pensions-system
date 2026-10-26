/**
 * The six glyphs the design permits, drawn inline. No icon library: the whole surface needs
 * six marks, and an SVG set in the component tree stays in the server render.
 */
export type IconName = 'external' | 'caret-down' | 'check' | 'contrast' | 'sun' | 'moon';

const PATHS: Readonly<Record<IconName, string>> = {
  external: 'M7 3h6v6M13 3 7.5 8.5M11 12v1H3V5h1',
  'caret-down': 'M3 5.5 8 10.5l5-5',
  check: 'M3 8.5 6.2 11.7 15 3',
  contrast: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8 3.7v8.6a4.3 4.3 0 0 0 0-8.6Z',
  sun: 'M8 5.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1',
  moon: 'M12.4 10a5.4 5.4 0 0 1-6.4-6.4 5.5 5.5 0 1 0 6.4 6.4Z',
};

export interface IconProps {
  name: IconName;
  size?: number;
}

/** Decorative by construction: every use sits beside a text label that names the action. */
export function Icon({ name, size = 16 }: IconProps) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
