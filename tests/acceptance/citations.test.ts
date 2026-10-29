import { describe, expect, it } from 'vitest';
import {
  citationRegistry,
  createCitationRegistry,
  validateContentForPublication,
} from '../../web/content/citations';
import { AgreementSection } from '../../web/components/registers/AgreementSection';
import { DisputeSection } from '../../web/components/registers/DisputeSection';
import { content, renderComponent } from '../fixtures/figures';

const ES = content('es');

function unitContaining(html: string, needle: string): string {
  const index = html.indexOf(needle);
  if (index < 0) return '';
  const start = html.lastIndexOf('<div class="claim">', index);
  return html.slice(start === -1 ? index : start, index + needle.length + 2000);
}

describe('citations, attribution and contested claims', () => {
  it('AC-001-37: a named-person claim renders with its citation in the same unit', () => {
    const html = renderComponent(AgreementSection, {
      content: ES,
      citations: citationRegistry,
      claims: [{ text: 'La AIReF proyecta el gasto a largo plazo.', citationId: 'airef-proyecciones' }],
    });

    expect(html).toContain('La AIReF proyecta el gasto a largo plazo.');
    const unit = unitContaining(html, 'La AIReF proyecta el gasto a largo plazo.');
    expect(unit).toContain('Autoridad Independiente de Responsabilidad Fiscal');
    expect(unit).toContain('Proyecciones de gasto público en pensiones');
  });

  it('AC-001-38: a named-person claim without a resolvable citation does not render', () => {
    const withoutCitation = renderComponent(AgreementSection, {
      content: ES,
      citations: citationRegistry,
      claims: [{ text: 'Alguien dijo que el sistema es insostenible.' }],
    });
    const withBrokenCitation = renderComponent(AgreementSection, {
      content: ES,
      citations: citationRegistry,
      claims: [{ text: 'Alguien dijo que el sistema es insostenible.', citationId: 'no-such-citation' }],
    });

    expect(withoutCitation).toBe('');
    expect(withBrokenCitation).toBe('');
    expect(withoutCitation).not.toContain('Alguien dijo');
  });

  it('AC-001-39: a contested claim shows both positions with their citations', () => {
    const html = renderComponent(DisputeSection, { content: ES, citations: citationRegistry });

    expect(html).toContain('data-register="dispute"');
    expect(html).toContain('Se financia con cotizaciones');
    expect(html).toContain('Requiere transferencias');
    expect(html).toContain('Seguridad Social');
    expect(html).toContain('Intervención General de la Administración del Estado');
    expect(html.split('class="dossier__position"').length - 1).toBe(2);
    expect(html.split('class="citation"').length - 1).toBe(2);
  });

  it('AC-001-40: a quote with an unresolvable source does not render', () => {
    const html = renderComponent(DisputeSection, {
      content: ES,
      citations: citationRegistry,
      disputes: [
        {
          id: 'rota',
          positions: [
            { name: 'A', proponent: 'Uno', role: 'Rol', quote: 'Cita sin fuente resoluble.', citationId: 'missing-a' },
            { name: 'B', proponent: 'Dos', role: 'Rol', quote: 'Cita válida.', citationId: 'airef-proyecciones' },
          ],
        },
      ],
    });

    expect(html).toBe('');
    expect(html).not.toContain('Cita sin fuente resoluble.');
    expect(html).not.toContain('Cita válida.');
  });

  it('AC-001-68: admin content cannot introduce an uncited claim', () => {
    const uncited = validateContentForPublication(
      {
        agreement: [{ text: 'Una afirmación sin cita.', citationId: undefined }],
        disputes: [],
      },
      citationRegistry,
    );
    const cited = validateContentForPublication(
      { agreement: [{ text: 'Una afirmación con cita.', citationId: 'eurostat-spr-exp-pens' }], disputes: [] },
      citationRegistry,
    );
    const oneSided = validateContentForPublication(
      {
        agreement: [],
        disputes: [
          {
            id: 'unilateral',
            positions: [
              { name: 'A', proponent: 'Uno', role: 'Rol', quote: 'Solo una.', citationId: 'eurostat-spr-exp-pens' },
            ],
          },
        ],
      },
      citationRegistry,
    );

    expect(uncited.ok).toBe(false);
    if (!uncited.ok) expect(uncited.failures[0]?.reason).toBe('unresolved-citation');
    expect(cited.ok).toBe(true);
    expect(oneSided.ok).toBe(false);
    if (!oneSided.ok) expect(oneSided.failures.some((f) => f.reason === 'single-position')).toBe(true);
  });

  it('AC-001-37: an unknown citation id never resolves', () => {
    const registry = createCitationRegistry([]);

    expect(registry.find('anything')).toBeUndefined();
    expect(registry.find(undefined)).toBeUndefined();
    expect(citationRegistry.all().length).toBeGreaterThan(0);
  });
});
