import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { contentRegistry } from '../../web/content/registry';
import { renderComponent, PLATE_FIXTURES } from '../fixtures/figures';
import { listSourceFiles, readSource } from '../helpers/source-scan';

function pageFor(locale = 'es'): string {
  const result = contentRegistry.get('ES', locale);
  if (!result.ok) throw new Error('missing locale');
  return renderComponent(PublicPage, {
    content: result.content,
    figures: PLATE_FIXTURES.map((fixture) => fixture()),
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
  });
}

describe('public surface independence', () => {
  it('AC-001-54: the public page renders with admin unconfigured', () => {
    const env = process.env as Record<string, string | undefined>;
    delete env.ADMIN_PASSWORD_HASH;
    delete env.ADMIN_SESSION_SECRET;

    const html = pageFor('es');

    expect(html).toContain('<main');
    expect(html).toContain('fig-01');
    expect(html).toContain('fig-05');
    expect(html).toContain('data-register="agreement"');
    expect(html).toContain('data-register="dispute"');
    expect(html).toContain('data-register="thesis"');
    expect(html).not.toContain('operator-bar');
    expect(html).not.toContain('ADMIN_PASSWORD_HASH');

    const files = listSourceFiles('web/components');
    for (const file of files) {
      const source = readSource(file);
      expect(source, `${file} must not depend on admin config`).not.toContain('admin/config');
      expect(source).not.toContain('ADMIN_PASSWORD_HASH');
    }
  });

  it('AC-001-54: the public page renders in every locale without admin', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it']) {
      const result = contentRegistry.get('ES', locale);
      if (!result.ok) throw new Error('missing locale');
      const html = pageFor(locale);
      expect(html, locale).toContain(result.content.strings['hero.sub']);
      expect(html, locale).toContain(result.content.strings['thesis.label']);
      expect(html.length).toBeGreaterThan(2000);
    }
  });

  it('AC-001-54: a stale snapshot is announced instead of silently reused', () => {
    const result = contentRegistry.get('ES', 'es');
    if (!result.ok) throw new Error('missing locale');
    const html = renderComponent(PublicPage, {
      content: result.content,
      figures: PLATE_FIXTURES.map((fixture) => fixture()),
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: true,
    });

    expect(html).toContain(result.content.t('banner.stale'));
  });
});
