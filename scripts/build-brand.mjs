/**
 * Generates the site mark and every raster of it, from `web/styles/tokens.css` and the
 * committed locale data, so the assets cannot drift from the design system (design §D7).
 *
 *   node scripts/build-brand.mjs
 *
 * Outputs:
 *   app/icon.svg         32, scales (the tab icon; the measured 404 on every route)
 *   app/favicon.ico      32, PNG payload inside an ICO container
 *   app/apple-icon.png   180
 *   app/icon-192.png     192, manifest
 *   app/icon-512.png     512, manifest
 *   app/manifest.ts      web app manifest, colours read from the tokens
 *   web/brand/generated.ts  the mark as data, for anything that cannot read CSS
 *
 * Colours and the letter are read, never typed: `--ink-1` is the ground, `--surface-1` the
 * letter, and the letter is the first character of the wordmark in the locale data.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const TOKENS = 'web/styles/tokens.css';
const LOCALE = 'web/content/data/ES/es.json';

/** Share-card dimensions are constants here on purpose: a build-script concern, not a token. */
const SHARE_CARD = { width: 1200, height: 630 };

function hexToken(css, name) {
  const match = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!match) throw new Error(`token ${name} not found in ${TOKENS}`);
  return match[1];
}

function fontStack(css) {
  const match = /--font-sans:\s*(.+);/.exec(css);
  if (!match) throw new Error(`--font-sans not found in ${TOKENS}`);
  return match[1].replace(/'/g, '').replace(/\s*,\s*/g, ', ');
}

function readWordmark() {
  const document = JSON.parse(readFileSync(LOCALE, 'utf8'));
  const wordmark = document.strings['site.wordmark'];
  if (typeof wordmark !== 'string' || wordmark.length === 0) {
    throw new Error('site.wordmark is missing: the mark has no letter to draw');
  }
  return wordmark.trim();
}

const css = readFileSync(TOKENS, 'utf8');
const wordmark = readWordmark();
const brand = {
  letter: wordmark[0],
  wordmark,
  ground: hexToken(css, '--ink-1'),
  letterColor: hexToken(css, '--surface-1'),
  font: fontStack(css),
};

function rgb(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

/**
 * The letterform, as membership tests in a unit box. Drawn from geometry rather than from a
 * font because the build has no rasteriser: a grotesque `p` is a stem and a round bowl, and
 * at 180 and 512 they are the same two shapes.
 */
const STEM = { left: 0.3, right: 0.44, top: 0.12, bottom: 0.9 };
const BRIDGE = { left: 0.3, right: 0.54, top: 0.12, bottom: 0.26 };
const BOWL = { centerX: 0.54, centerY: 0.36, outer: 0.26, inner: 0.13 };

function inBox(u, v, box) {
  return u >= box.left && u <= box.right && v >= box.top && v <= box.bottom;
}

function inRing(u, v) {
  const distance = Math.hypot(u - BOWL.centerX, v - BOWL.centerY);
  return distance <= BOWL.outer && distance > BOWL.inner;
}

function inGlyph(u, v) {
  return inBox(u, v, STEM) || inBox(u, v, BRIDGE) || inRing(u, v);
}

/** 2x2 supersampling: enough to keep a 32px icon from looking chewed. */
function coverage(px, py, size) {
  const samples = 2;
  let hits = 0;
  for (let sy = 0; sy < samples; sy += 1) {
    for (let sx = 0; sx < samples; sx += 1) {
      if (inGlyph((px + (sx + 0.5) / samples) / size, (py + (sy + 0.5) / samples) / size)) hits += 1;
    }
  }
  return hits / (samples * samples);
}

function pixels(size) {
  const [groundR, groundG, groundB] = rgb(brand.ground);
  const [letterR, letterG, letterB] = rgb(brand.letterColor);
  const buffer = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const alpha = coverage(x, y, size);
      const offset = (y * size + x) * 4;
      buffer[offset] = Math.round(groundR + (letterR - groundR) * alpha);
      buffer[offset + 1] = Math.round(groundG + (letterG - groundG) * alpha);
      buffer[offset + 2] = Math.round(groundB + (letterB - groundB) * alpha);
      buffer[offset + 3] = 255;
    }
  }
  return buffer;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** An ICO container may carry a PNG payload directly, which is how the 32 stops 404ing. */
function encodeIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 32;
  entry[1] = 32;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${brand.letter}">
  <rect width="32" height="32" fill="${brand.ground}" />
  <text x="16" y="17" text-anchor="middle" dominant-baseline="central" fill="${brand.letterColor}"
        font-family="${brand.font}" font-weight="600" font-size="21">${brand.letter}</text>
</svg>
`;
}

function manifestModule() {
  return `/**
 * Generated by scripts/build-brand.mjs from web/styles/tokens.css — do not edit by hand.
 * Run \`npm run brand\` after changing a token.
 */
import type { MetadataRoute } from 'next';
import { BRAND } from '../web/brand/generated';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.wordmark,
    short_name: BRAND.wordmark,
    start_url: '/',
    display: 'standalone',
    background_color: BRAND.ground,
    theme_color: BRAND.ground,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
`;
}

function brandModule() {
  return `/**
 * The mark and its colours, generated by scripts/build-brand.mjs from
 * web/styles/tokens.css and the committed locale data. Do not edit by hand: run
 * \`npm run brand\` instead, so the mark cannot drift from the tokens.
 */
export const BRAND = {
  letter: ${JSON.stringify(brand.letter)},
  wordmark: ${JSON.stringify(brand.wordmark)},
  ground: ${JSON.stringify(brand.ground)},
  onGround: ${JSON.stringify(brand.letterColor)},
  font: ${JSON.stringify(brand.font)},
  shareCard: { width: ${SHARE_CARD.width}, height: ${SHARE_CARD.height} },
} as const;
`;
}

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  return `${path}: ${Buffer.isBuffer(contents) ? `${contents.length} bytes` : 'written'}`;
}

const report = [
  write('app/icon.svg', iconSvg()),
  write('app/favicon.ico', encodeIco(encodePng(32, pixels(32)))),
  write('app/apple-icon.png', encodePng(180, pixels(180))),
  write('app/icon-192.png', encodePng(192, pixels(192))),
  write('app/icon-512.png', encodePng(512, pixels(512))),
  write('app/manifest.ts', manifestModule()),
  write('web/brand/generated.ts', brandModule()),
];

console.log(`brand: letter "${brand.letter}", ground ${brand.ground}, ink ${brand.letterColor}`);
console.log(`share card: ${SHARE_CARD.width}x${SHARE_CARD.height} (app/opengraph-image.tsx)`);
for (const line of report) console.log(line);
