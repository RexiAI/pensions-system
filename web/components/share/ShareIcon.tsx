/**
 * The share row's six glyphs: Phosphor (MIT), regular weight, copied as path data so nothing is
 * fetched at runtime and no brand colour exists — every stroke is `currentColor` (15-design.md
 * §Global Tokens). Decorative by construction: each sits beside a visible text label.
 */
export type ShareGlyph = 'whatsapp' | 'telegram' | 'x' | 'linkedin' | 'copy' | 'native';

const PATHS: Readonly<Record<ShareGlyph, string>> = {
  whatsapp:
    'M72 104a32 32 0 0 1 32-32l16 32-12.32 18.47a48.19 48.19 0 0 0 25.85 25.85L152 136l32 16a32 32 0 0 1-32 32A80 80 0 0 1 72 104Z M79.93 211.11a96 96 0 1 0-35-35h0L32.42 213.46a8 8 0 0 0 10.12 10.12l37.39-12.47Z',
  telegram:
    'M80 134.87 170.26 214a8 8 0 0 0 13.09-4.21L224 33.22a1 1 0 0 0-1.34-1.15L20 111.38A6.23 6.23 0 0 0 21 123.3Z M80 134.87 223.41 32.09 M124.37 173.78 93.76 205.54A8 8 0 0 1 80 200V134.87',
  x: 'M48 40h48l112 176h-48Z M113.88 143.53 48 216 M208 40 142.12 112.47',
  linkedin:
    'M40 32h176a8 8 0 0 1 8 8v176a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8Z M120 112v64 M88 112v64 M120 140a28 28 0 0 1 56 0v36 M88 84h.01',
  copy: 'M168 168h48V40H88v48 M40 88h128v128H40Z',
  native:
    'M32 128a32 32 0 1 0 64 0a32 32 0 1 0-64 0 M144 200a32 32 0 1 0 64 0a32 32 0 1 0-64 0 M144 56a32 32 0 1 0 64 0a32 32 0 1 0-64 0 M149.09 73.3 90.91 110.7 M90.91 145.3 149.09 182.7',
};

export function ShareIcon({ name }: { name: ShareGlyph }) {
  return (
    <svg
      className="share__icon"
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
