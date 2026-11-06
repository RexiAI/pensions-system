import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chroma, contrast, hue, hueGap, isHex } from '../helpers/colour';
import { stepOf, storyPage } from '../helpers/story';
import { BROWSER_READY, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-24…26, AC-006-36, AC-006-37 — a neutral palette with one accent (Task 9).
 *
 * Chroma, hue and contrast are computed with the project's existing helper on the declared hexes.
 * The accent's budget is asserted on **both** halves AC-006-26 names: every rendered element of
 * the page (an element can resolve the accent through an alias no rule names), and every resting
 * rule in the sheet (a rule can declare it while nothing renders).
 */
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const CSS = readFileSync('web/styles/globals.css', 'utf8');

const LIGHT = TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf("[data-theme='dark']"));
const DARK = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));

type Theme = 'light' | 'dark';

function block(theme: Theme): string {
  return theme === 'light' ? LIGHT : DARK;
}

function valueOf(theme: Theme, name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(block(theme));
  if (!match?.[1]) throw new Error(`--${name} is not declared (${theme})`);
  return match[1].trim();
}

function hex(theme: Theme, name: string): string {
  const value = valueOf(theme, name);
  if (!isHex(value)) throw new Error(`--${name} (${theme}) is not a literal hex: ${value}`);
  return value.toLowerCase();
}

/** Every public token that resolves to a single colour (AC-006-24's set). */
const PUBLIC_TOKENS = [
  'surface-1',
  'surface-2',
  'surface-3',
  'ink-1',
  'ink-2',
  'ink-3',
  'rule-1',
  'rule-2',
  'accent',
  'on-accent',
  'data-deficit',
  'data-projection',
  'chart-series-2',
] as const;

const AA = 4.5;
const AAA = 7;
const NON_TEXT = 3;

describe('AC-006-24: exactly one chromatic token, and it is a deep red', () => {
  it('AC-006-24: the accent is the only value above chroma 20, and every other is at most 10', () => {
    for (const theme of ['light', 'dark'] as const) {
      const values = PUBLIC_TOKENS.map((name) => ({ name, chroma: chroma(hex(theme, name)) }));
      expect(values.filter((entry) => entry.chroma > 20).map((entry) => entry.name), theme).toEqual(['accent']);
      for (const entry of values.filter((value) => value.name !== 'accent')) {
        expect(entry.chroma, `${theme} ${entry.name}`).toBeLessThanOrEqual(10);
      }
    }
  });

  it('AC-006-24: the accent’s CIELCh hue is within 40° of 0° in both themes', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(hueGap(hue(hex(theme, 'accent')), 0), `${theme}: ${hue(hex(theme, 'accent')).toFixed(1)}°`).toBeLessThanOrEqual(40);
    }
  });

  it('AC-006-24: the amber and the rust are no longer chromatic', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const name of ['data-projection', 'data-deficit'] as const) {
        expect(chroma(hex(theme, name)), `${theme} ${name}`).toBeLessThanOrEqual(10);
      }
    }
  });

  it('AC-006-24: the admin state colours are excluded from the count on both sides', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(chroma(hex(theme, 'state-pending')), `${theme} pending`).toBeGreaterThan(20);
      expect(chroma(hex(theme, 'state-danger')), `${theme} danger`).toBeGreaterThan(20);
      expect(PUBLIC_TOKENS as readonly string[]).not.toContain('state-pending');
    }
  });

  it('AC-006-24: the aliases are re-pointed, not revalued', () => {
    expect(valueOf('light', 'chart-series-1')).toBe('var(--ink-2)');
    expect(valueOf('light', 'chart-observed')).toBe('var(--chart-series-1)');
    expect(valueOf('light', 'chart-projection')).toBe('var(--data-projection)');
    expect(valueOf('light', 'chart-ref')).toBe('var(--ink-3)');
    expect(valueOf('light', 'chart-grid')).toBe('var(--rule-1)');
  });
});

describe('AC-006-25: every real pair meets its minimum, measured', () => {
  it('AC-006-25: every text ink crossed with every surface meets its minimum', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const surface of ['surface-1', 'surface-2', 'surface-3'] as const) {
        expect(contrast(hex(theme, 'ink-1'), hex(theme, surface)), `${theme} ink-1 on ${surface}`).toBeGreaterThanOrEqual(AAA);
        expect(contrast(hex(theme, 'ink-2'), hex(theme, surface)), `${theme} ink-2 on ${surface}`).toBeGreaterThanOrEqual(AA);
        expect(contrast(hex(theme, 'ink-3'), hex(theme, surface)), `${theme} ink-3 on ${surface}`).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  it('AC-006-25: the accent reaches 4.5:1 on every surface it paints', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const surface of ['surface-1', 'surface-2', 'surface-3'] as const) {
        expect(contrast(hex(theme, 'accent'), hex(theme, surface)), `${theme} accent on ${surface}`).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  it('AC-006-25: --on-accent keeps the 7:1 target, and the primary action’s new pair clears AAA', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(contrast(hex(theme, 'on-accent'), hex(theme, 'accent')), `${theme} on accent`).toBeGreaterThanOrEqual(AAA);
      expect(contrast(hex(theme, 'on-accent'), hex(theme, 'ink-1')), `${theme} on-accent on ink-1`).toBeGreaterThanOrEqual(AAA);
      // The primary action is an ink block with surface ink (AC-002-31, re-pointed).
      expect(contrast(hex(theme, 'surface-1'), hex(theme, 'ink-1')), `${theme} primary`).toBeGreaterThanOrEqual(AAA);
    }
  });

  it('AC-006-25: the non-text series strokes reach 3:1', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const stroke of ['data-deficit', 'data-projection', 'chart-series-2'] as const) {
        expect(contrast(hex(theme, stroke), hex(theme, 'surface-1')), `${theme} ${stroke}`).toBeGreaterThanOrEqual(NON_TEXT);
      }
    }
  });

  it('AC-006-25: no minimum is lowered to make a value pass', () => {
    expect([NON_TEXT, AA, AAA]).toEqual([3, 4.5, 7]);
  });
});

interface CssRule {
  selector: string;
  body: string;
}

function rules(): CssRule[] {
  const clean = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] ?? '').trim().replace(/\s+/g, ' '),
    body: match[2] ?? '',
  }));
}

const ADMIN_PREFIXES = ['.operator-bar', '.admin-', '.status-chip', '.config-closed'] as const;
/**
 * Every paint channel AC-006-26 names, including the `border`/`outline` shorthands and the
 * logical-border spellings the sheet uses. The verification caught a shorthand escaping the
 * sheet half while the element half saw it.
 */
const PAINT_CHANNELS =
  /^(color|background|background-color|border(-(top|right|bottom|left|inline|block)(-(start|end))?)?(-color)?|outline(-color)?|fill|stroke|box-shadow)$/;

interface AccentDeclaration {
  selector: string;
  property: string;
}

function paintDeclaration(declaration: string): { property: string; value: string } {
  const [rawProperty, rawValue] = declaration.split(':');
  return { property: (rawProperty ?? '').trim(), value: (rawValue ?? '').trim() };
}

function isAccentPaint({ property, value }: { property: string; value: string }): boolean {
  return PAINT_CHANNELS.test(property) && /\bvar\(--accent\)/.test(value);
}

/** One rule's accent-bearing paint declarations, excluding AC-006-36's state and the admin tree. */
function accentInRule(rule: CssRule): AccentDeclaration[] {
  if (rule.selector.includes(':focus')) return [];
  if (ADMIN_PREFIXES.some((prefix) => rule.selector.startsWith(prefix))) return [];
  return rule.body
    .split(';')
    .map(paintDeclaration)
    .filter(isAccentPaint)
    .map(({ property }) => ({ selector: rule.selector, property }));
}

/** Every resting rule declaration whose value resolves to the accent. */
function accentDeclarations(): AccentDeclaration[] {
  return rules().flatMap(accentInRule);
}

describe('AC-006-26: the accent is spent once on the page, counted on every channel', () => {
  it('AC-006-26: exactly one resting rule declares the accent, and it is the numeral’s color', () => {
    expect(accentDeclarations()).toEqual([{ selector: '.clock__value--days', property: 'color' }]);
  });

  it('AC-006-26: the paints that carried the accent when this spec began no longer do', () => {
    const cta = rules().find((rule) => rule.selector === '.hero__cta');
    expect(cta?.body, '.hero__cta background').not.toContain('--accent');
    expect(cta?.body, '.hero__cta is an ink fill').toContain('background: var(--ink-1)');
    const burnt = rules().find((rule) => rule.selector === '.fuse__burnt');
    expect(burnt?.body, '.fuse__burnt fill').not.toContain('--accent');
    expect(burnt?.body, '.fuse__burnt is an ink').toContain('fill: var(--ink-1)');
    // The chart aliases are neutral, and the only token aliasing the accent is the focus state.
    for (const alias of ['chart-series-1', 'chart-observed'] as const) {
      expect(valueOf('light', alias), alias).not.toBe('var(--accent)');
    }
    const aliases = [...TOKENS.matchAll(/^\s*--([a-z0-9-]+):\s*[^;]*var\(--accent\);/gm)].map((match) => match[1]);
    expect(aliases).toEqual(['focus']);
  });
});

const ELEMENT_ACCENT = `(() => {
  const root = getComputedStyle(document.documentElement);
  const probe = document.createElement('span');
  probe.style.color = root.getPropertyValue('--accent').trim();
  document.body.appendChild(probe);
  const accent = getComputedStyle(probe).color;
  probe.remove();
  const rgb = (value) => {
    const match = value.match(/rgba?\\(([^)]+)\\)/);
    if (!match) return null;
    const parts = match[1].split(',').map(Number);
    return { value: parts.slice(0, 3).join(','), alpha: parts[3] === undefined ? 1 : parts[3] };
  };
  const target = rgb(accent).value;
  const same = (value) => {
    const parsed = rgb(value);
    return !!parsed && parsed.value === target;
  };
  const hits = [];
  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    const channels = [];
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent || '').trim() !== '');
    if (hasText && same(style.color)) channels.push('color');
    const background = rgb(style.backgroundColor);
    if (background && background.alpha > 0 && same(style.backgroundColor)) channels.push('background-color');
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const visible = style['border' + side + 'Style'] !== 'none' && parseFloat(style['border' + side + 'Width']) > 0;
      if (visible && same(style['border' + side + 'Color'])) channels.push('border-' + side.toLowerCase() + '-color');
    }
    if (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 && same(style.outlineColor)) {
      channels.push('outline-color');
    }
    if (el instanceof SVGElement) {
      if (style.fill !== 'none' && same(style.fill)) channels.push('fill');
      if (style.stroke !== 'none' && same(style.stroke)) channels.push('stroke');
    }
    if (style.boxShadow !== 'none' && style.boxShadow.includes(accent)) channels.push('box-shadow');
    if (channels.length > 0) hits.push({ tag: el.tagName.toLowerCase(), cls: el.className.toString(), channels });
  }
  return { accent, hits };
})()`;

interface AccentInventory {
  accent: string;
  hits: { tag: string; cls: string; channels: string[] }[];
}

describe.skipIf(!BROWSER_READY)('AC-006-26: the accent is spent once, measured on the page', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-26: exactly one painted use resolves to the accent, the day numeral', async () => {
    for (const viewport of MATRIX) {
      for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
        const inventory = await served.measure<AccentInventory>(locale, viewport, ELEMENT_ACCENT);
        expect(inventory.hits.length, `${locale} ${viewport.width}: ${JSON.stringify(inventory.hits)}`).toBe(1);
        expect(inventory.hits[0]?.channels, `${locale} ${viewport.width}`).toEqual(['color']);
        expect(inventory.hits[0]?.cls, `${locale} ${viewport.width}`).toContain('clock__value--days');
      }
    }
  }, 600_000);
});

describe('AC-006-36: the focus ring is a state, and its exclusion is bounded', () => {
  it('AC-006-36: exactly one rule uses --focus, it is :focus-visible-scoped, and the offset is non-zero', () => {
    const focusRules = rules().filter((rule) => rule.body.includes('var(--focus)'));
    expect(focusRules.map((rule) => rule.selector)).toEqual([':focus-visible']);
    expect(focusRules[0]?.body).toContain('outline: var(--focus)');
    expect(focusRules[0]?.body).toContain('outline-offset: var(--focus-offset)');
    expect(valueOf('light', 'focus-offset')).toBe('2px');
    expect(valueOf('light', 'focus')).toBe('2px solid var(--accent)');
  });

  it('AC-006-36: the ring reaches 3:1 on its ground, and the offset is what keeps it off the fill', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(contrast(hex(theme, 'accent'), hex(theme, 'surface-1')), `${theme} ring on the page`).toBeGreaterThanOrEqual(NON_TEXT);
      // Inside the primary action's ink fill the accent is 1.71:1 light / 2.15:1 dark, which is
      // why the offset exists.
      expect(contrast(hex(theme, 'accent'), hex(theme, 'ink-1')), `${theme} ring inside the fill`).toBeLessThan(NON_TEXT);
    }
  });
});

const FOCUS_STATES = `(() => {
  const outlinesAtRest = [...document.querySelectorAll('body *')].filter((el) => {
    const style = getComputedStyle(el);
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  }).length;
  const active = document.activeElement;
  const style = active ? getComputedStyle(active) : null;
  const focused = {
    tag: active ? active.tagName.toLowerCase() : null,
    style: style ? style.outlineStyle : null,
    width: style ? parseFloat(style.outlineWidth) : 0,
    colour: style ? style.outlineColor : null,
    offset: style ? style.outlineOffset : null,
  };
  const withRing = [...document.querySelectorAll('body *')].filter((el) => {
    const current = getComputedStyle(el);
    return current.outlineStyle !== 'none' && parseFloat(current.outlineWidth) > 0;
  });
  return { outlinesAtRest, focused, ringCount: withRing.length };
})()`;

interface FocusStates {
  outlinesAtRest: number;
  focused: { tag: string | null; style: string | null; width: number; colour: string | null; offset: string | null };
  ringCount: number;
}

describe.skipIf(!BROWSER_READY)('AC-006-36: the ring appears only on the focused element', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-36: no resting outline, one ring on the keyboard-focused element, gone on blur', async () => {
    const page = await served.open('es', MATRIX[2]);
    const rest = await page.evaluate<FocusStates>(FOCUS_STATES);
    expect(rest.outlinesAtRest, 'at rest').toBe(0);

    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    const focused = await page.evaluate<FocusStates>(FOCUS_STATES);
    expect(focused.focused.width, 'the ring is painted').toBeGreaterThanOrEqual(2);
    expect(focused.focused.style, 'the ring is a solid outline').toBe('solid');
    expect(focused.ringCount, 'only the focused element carries a ring').toBe(1);
    expect(focused.focused.offset, 'the ring is offset outside the control').toBe('2px');

    await page.evaluate<null>(`(() => { document.activeElement?.blur(); return null; })()`);
    const blurred = await page.evaluate<FocusStates>(FOCUS_STATES);
    expect(blurred.ringCount, 'the ring disappears with focus').toBe(0);
  }, 180_000);
});

describe('AC-006-37: the fuse’s burnt segment reads after de-accenting', () => {
  it('AC-006-37: burnt is --ink-1 and cord is --ink-3, and the pair improves', () => {
    const burnt = rules().find((rule) => rule.selector === '.fuse__burnt');
    const cord = rules().find((rule) => rule.selector === '.fuse__cord');
    expect(burnt?.body).toContain('fill: var(--ink-1)');
    expect(cord?.body).toContain('fill: var(--ink-3)');
    expect(burnt?.body).not.toContain('--accent');
    expect(cord?.body).not.toContain('--accent');
    // Light ≥ 3:1 and dark ≥ 2.5:1, up from 1.14 and 1.51.
    expect(contrast(hex('light', 'ink-1'), hex('light', 'ink-3')), 'light pair').toBeGreaterThanOrEqual(3);
    expect(contrast(hex('dark', 'ink-1'), hex('dark', 'ink-3')), 'dark pair').toBeGreaterThanOrEqual(2.5);
  });

  it('AC-006-37: the value is still carried by the burnt length and the label, inside step 4', () => {
    const html = storyPage('es');
    const distance = stepOf(html, 'distance');
    const number = stepOf(html, 'number');
    expect(distance).toContain('class="fuse"');
    expect(number).not.toContain('fuse');
    // Both cues survive: the drawing's burnt width and the printed sentence.
    expect(distance).toMatch(/class="fuse__burnt"[^>]*width="[\d.]+"/);
    expect(distance).toContain('class="fuse__label"');
    const label = /<figcaption class="fuse__label">([^<]*)</.exec(distance)?.[1] ?? '';
    expect(label.trim().length).toBeGreaterThan(0);
  });
});
