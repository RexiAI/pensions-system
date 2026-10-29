import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

export function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...listSourceFiles(path));
      continue;
    }
    if (path.endsWith('.tsx') || path.endsWith('.ts')) files.push(path);
  }
  return files.sort();
}

export function readSource(path: string): string {
  return readFileSync(path, 'utf8');
}

/** Removes comments so a scan measures code, not prose about the code. */
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const TEXT_ATTRIBUTES = new Set(['aria-label', 'aria-description', 'title', 'alt', 'placeholder']);

function parse(source: string): ts.SourceFile {
  return ts.createSourceFile('scan.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

export interface JsxLiteral {
  kind: 'text' | 'attribute';
  value: string;
}

/**
 * Every JSX text node and text-bearing attribute whose value is a plain string literal.
 * The TypeScript parser is used rather than a regex so an arrow function's `=>` cannot be
 * mistaken for a JSX tag boundary. This is the check behind AC-001-35.
 */
const HAS_LETTER = /[A-Za-zÀ-ÿ]/;

function textLiteral(node: ts.Node, file: ts.SourceFile): JsxLiteral | null {
  if (!ts.isJsxText(node)) return null;
  const text = node.getText(file).trim();
  return HAS_LETTER.test(text) ? { kind: 'text', value: text } : null;
}

function attributeLiteral(node: ts.Node, file: ts.SourceFile): JsxLiteral | null {
  if (!ts.isJsxAttribute(node)) return null;
  if (!TEXT_ATTRIBUTES.has(node.name.getText(file))) return null;
  const initializer = node.initializer;
  if (!initializer || !ts.isStringLiteral(initializer)) return null;
  if (!HAS_LETTER.test(initializer.text)) return null;
  return { kind: 'attribute', value: `${node.name.getText(file)}=${initializer.text}` };
}

export function jsxLiterals(source: string): JsxLiteral[] {
  const file = parse(source);
  const found: JsxLiteral[] = [];
  const visit = (node: ts.Node): void => {
    const literal = textLiteral(node, file) ?? attributeLiteral(node, file);
    if (literal) found.push(literal);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

export function jsxTextLiterals(source: string): string[] {
  return jsxLiterals(source)
    .filter((literal) => literal.kind === 'text')
    .map((literal) => literal.value);
}

export function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  return haystack.split(needle).length - 1;
}
