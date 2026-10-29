/**
 * The CIELCh and WCAG arithmetic spec 002's palette scenarios compute with.
 *
 * This is the same measure `tests/acceptance/palette-labels.test.ts` already uses — CIELCh
 * chroma for "how saturated", the CIELCh hue angle for "which family", and WCAG 2.1 relative
 * luminance for contrast. It lives here so the accent scenarios and the design-gate unit tests
 * compute it once instead of restating the design's table: an assertion that quoted the numbers
 * would pass while `tokens.css` said something else.
 */
export interface Lab {
  lightness: number;
  a: number;
  b: number;
}

function channels(hex: string): number[] {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function linear(component: number): number {
  const c = component / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * (r as number) + 0.7152 * (g as number) + 0.0722 * (b as number);
}

/** WCAG 2.1 relative-luminance contrast ratio, 1:1 to 21:1. */
export function contrast(foreground: string, ground: string): number {
  const [a, b] = [luminance(foreground), luminance(ground)];
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export function lab(hex: string): Lab {
  const [r, g, b] = channels(hex).map(linear) as [number, number, number];
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return { lightness: 116 * f(y) - 16, a: 500 * (f(x) - f(y)), b: 200 * (f(y) - f(z)) };
}

/** CIELCh chroma: the palette test's saturation measure. */
export function chroma(hex: string): number {
  const { a, b } = lab(hex);
  return Math.hypot(a, b);
}

/** CIELCh hue angle in degrees, 0 to 360. */
export function hue(hex: string): number {
  const { a, b } = lab(hex);
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
}

/** The shortest angular distance between two hue angles, so 350° and 10° are 20° apart. */
export function hueGap(one: number, other: number): number {
  const gap = Math.abs(one - other);
  return Math.min(gap, 360 - gap);
}

/** `true` when the value is a six-digit literal hex and not an alias. */
export function isHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}
