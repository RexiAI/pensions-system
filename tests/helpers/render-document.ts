import { createElement, type ComponentType, type ReactElement } from 'react';
import { renderToReadableStream } from 'react-dom/server';

/**
 * Renders a root layout the way Next does — as a server component, params included — so a test
 * can assert on the document a route produces without needing `next build` or a server.
 */
export function elementFor<P extends object>(
  component: (props: P) => unknown,
  props: P,
): ReactElement {
  return createElement(component as unknown as ComponentType<P>, props);
}

export async function renderDocument(element: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(element);
  return new Response(stream).text();
}

/** The `<html lang>` value of a rendered document, or `null` when the attribute is absent. */
export function documentLang(html: string): string | null {
  const match = /<html[^>]*\slang="([^"]*)"/.exec(html);
  return match?.[1] ?? null;
}

/**
 * Server markup with React's text escapes undone: `l'année` reaches the HTML as `l&#x27;année`,
 * and a copy assertion is about the sentence the reader sees, not about the escaping.
 */
export function decodeText(html: string): string {
  return html
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}
