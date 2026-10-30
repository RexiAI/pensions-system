import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { chroma, contrast, hue, hueGap, isHex, lab, luminance } from '../helpers/colour';

/**
 * Unit coverage for the palette arithmetic spec 002's accent scenarios rely on, on the boundaries
 * the acceptance scenarios do not reach: the hue angle's wrap-around, the contrast ratio's
 * symmetry and range, and the chroma of a neutral.
 *
 * The acceptance scenarios compute *declared* values; this file proves the measure itself behaves,
 * because a wrong measure would silently pass every one of them.
 */
const hex = fc
  .tuple(fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }))
  .map(([r, g, b]) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`);

const angle = fc.double({ min: 0, max: 360, noNaN: true });

describe('hueGap', () => {
  it('measures the short way round the circle across the 0/360 seam', () => {
    expect(hueGap(350, 10)).toBe(20);
    expect(hueGap(10, 350)).toBe(20);
    expect(hueGap(359, 1)).toBe(2);
    expect(hueGap(0, 180)).toBe(180);
  });

  it('is symmetric, and never exceeds 180°', () => {
    fc.assert(
      fc.property(angle, angle, (one, other) => {
        const forward = hueGap(one, other);
        expect(forward).toBeCloseTo(hueGap(other, one), 10);
        expect(forward).toBeGreaterThanOrEqual(0);
        expect(forward).toBeLessThanOrEqual(180);
      }),
    );
  });

  it('is zero only for equal angles', () => {
    fc.assert(
      fc.property(angle, (value) => {
        expect(hueGap(value, value)).toBe(0);
      }),
    );
  });
});

describe('CIELCh measures', () => {
  it('gives hue in a full turn and chroma as a non-negative magnitude', () => {
    fc.assert(
      fc.property(hex, (value) => {
        expect(hue(value)).toBeGreaterThanOrEqual(0);
        expect(hue(value)).toBeLessThan(360);
        expect(chroma(value)).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('reads the two greys as achromatic, and the current accents as olive', () => {
    // `#ffffff` is achromatic to within rounding in the 8-bit sRGB cube, not exactly: the matrix
    // is a fit, so the white point lands at ~0.012 chroma rather than 0.
    expect(chroma('#000000')).toBeLessThan(0.02);
    expect(chroma('#ffffff')).toBeLessThan(0.02);
    // Both accents sit in the olive/green family, roughly a third of the way round from red.
    expect(hue('#425425')).toBeCloseTo(122.3, 0);
    expect(hue('#9cc17f')).toBeCloseTo(129.6, 0);
  });

  it('reads a lighter tint as a higher L*', () => {
    expect(lab('#fdf2e1').lightness).toBeGreaterThan(lab('#47392a').lightness);
    expect(luminance('#ffffff')).toBeCloseTo(1, 6);
    expect(luminance('#000000')).toBeCloseTo(0, 6);
  });
});

describe('WCAG contrast', () => {
  it('is symmetric, and bounded by 1:1 and 21:1', () => {
    fc.assert(
      fc.property(hex, hex, (one, other) => {
        const ratio = contrast(one, other);
        expect(ratio).toBeCloseTo(contrast(other, one), 10);
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(21);
      }),
    );
  });

  it('is 1:1 for a colour against itself and 21:1 for black on white', () => {
    fc.assert(
      fc.property(hex, (value) => {
        expect(contrast(value, value)).toBeCloseTo(1, 10);
      }),
    );
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 6);
  });
});

describe('isHex', () => {
  it('accepts only a six-digit literal, never an alias or a short form', () => {
    expect(isHex('#3b5512')).toBe(true);
    expect(isHex('#3B5512')).toBe(true);
    expect(isHex('var(--accent)')).toBe(false);
    expect(isHex('#fff')).toBe(false);
    expect(isHex('#3b55122')).toBe(false);
  });
});
