import type { DerivedFigure } from '../ingest/types';
import type { DerivedSeries } from '../ingest/series-types';

/**
 * The public/operator vocabulary boundary (D3), as a checkable rule rather than a review
 * habit. `if a string's meaning is defined by this repository rather than by the publisher,
 * it is operator vocabulary` — so a spec filename, a scenario id, an open-question reference,
 * a digest, a repo path, an internal source id or a formula id may not reach a public page.
 *
 * Operator surfaces are marked `data-operator="true"` on their subtree (the reproduce panel
 * and the provenance disclosure); `stripOperatorSubtrees` removes them before the scan, which
 * is exactly the rule the directive states.
 */
export const OPERATOR_MARKER = 'data-operator="true"';

export interface BannedPattern {
  name: string;
  pattern: RegExp;
}

export const BANNED_PATTERNS: readonly BannedPattern[] = [
  { name: 'spec filename', pattern: /\.md\b/ },
  { name: 'scenario id', pattern: /AC-\d{3}-\d{2}/ },
  { name: 'open question (es)', pattern: /pregunta abierta/i },
  { name: 'open question (en)', pattern: /open question/i },
  { name: 'spec reference', pattern: /spec \d{3}/i },
  { name: 'digest', pattern: /[0-9a-f]{16,}/ },
  { name: 'repo path', pattern: /data\/derived/ },
];

export interface BannedHit {
  pattern: string;
  context: string;
}

function tagNameAt(html: string, index: number): string {
  const match = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(index, index + 48));
  return match ? match[1] : '';
}

/** Index just past the closing tag matching the element whose opening tag ended at `start`. */
function findClosingTag(html: string, tagName: string, start: number): number {
  const open = new RegExp(`<${tagName}[\\s>]`, 'g');
  const close = new RegExp(`</${tagName}>`, 'g');
  let depth = 1;
  let cursor = start;
  while (depth > 0) {
    open.lastIndex = cursor;
    close.lastIndex = cursor;
    const nextOpen = open.exec(html);
    const nextClose = close.exec(html);
    if (!nextClose) return html.length;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      cursor = nextOpen.index + 1;
      continue;
    }
    depth -= 1;
    cursor = nextClose.index + nextClose[0].length;
  }
  return cursor;
}

/** Removes every `data-operator="true"` subtree, innermost-safe, without an HTML parser. */
export function stripOperatorSubtrees(html: string): string {
  let output = html;
  let marker = output.indexOf(OPERATOR_MARKER);
  while (marker !== -1) {
    const start = output.lastIndexOf('<', marker);
    const name = tagNameAt(output, start);
    if (!name) return output;
    const afterOpen = output.indexOf('>', marker) + 1;
    const end = findClosingTag(output, name, afterOpen);
    output = output.slice(0, start) + output.slice(end);
    marker = output.indexOf(OPERATOR_MARKER);
  }
  return output;
}

function contextAround(html: string, index: number): string {
  const from = Math.max(0, index - 60);
  return html.slice(from, index + 60).replace(/\s+/g, ' ').trim();
}

/**
 * Scans rendered public text. `internalTerms` are the identifiers that live in
 * `data/derived/*.json` (source keys, formula ids): they are checked as literals, so the rule
 * stays current as sources are added.
 */
export function scanPublicText(html: string, internalTerms: readonly string[]): BannedHit[] {
  const hits: BannedHit[] = [];
  for (const { name, pattern } of BANNED_PATTERNS) {
    const match = pattern.exec(html);
    if (match) hits.push({ pattern: name, context: contextAround(html, match.index) });
  }
  for (const term of internalTerms) {
    const index = html.indexOf(term);
    if (index !== -1) hits.push({ pattern: `internal identifier ${term}`, context: contextAround(html, index) });
  }
  return hits;
}

/**
 * Every repository-defined identifier the committed derived data carries — the figures' and the
 * series' alike, so a new artefact cannot leak an identifier the gate does not know about.
 */
export function internalTermsOf(figures: readonly DerivedFigure[], series: readonly DerivedSeries[] = []): string[] {
  const terms = new Set<string>();
  for (const entry of [...figures, ...series]) {
    terms.add(entry.formulaId);
    // A definition id is a repository identifier: the reader sees the definition's words,
    // never the dotted key behind them.
    terms.add(entry.definitionId);
    for (const source of entry.unresolvedSources) terms.add(source);
    const declared = (entry as unknown as Record<string, unknown>)['sourceKey'];
    if (typeof declared === 'string') terms.add(declared);
  }
  return [...terms].sort();
}
