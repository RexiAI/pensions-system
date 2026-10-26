import type { CountryLocaleContent } from '../../content/types';

export interface ScopeEntry {
  geo: string;
  /** The country's display name in the reader's locale, from that country's own record. */
  name: string;
  /** The country's own route, resolved by the caller: one country's route is not another's. */
  href: string;
}

export interface ScopeMarkProps {
  content: CountryLocaleContent;
  /** The countries this deployment publishes, resolved from the content model. */
  countries: readonly ScopeEntry[];
}

/**
 * The single-country scope, at the first viewport (T19, R4). The marker is typographic and
 * data-derived: the name and the coverage clause come from the country record in the reader's
 * locale, never from a literal in a component. With two published countries the reader resolves
 * each name from its own record, so no geo code reaches the page.
 *
 * Degradation is fixed rather than designed per case: exactly one published country renders as
 * plain text (a single-option control is worse than none), two or more render as a bare
 * `<details>` country index. Never a disabled control, never a flag.
 */
export function ScopeMark({ content, countries }: ScopeMarkProps) {
  const { name, scopeClause } = content.country;
  if (countries.length <= 1) {
    return (
      <p className="scope" data-scope="text">
        <span className="scope__name">{name}</span>
        <span className="scope__separator"> · </span>
        <span className="scope__clause">{scopeClause}</span>
      </p>
    );
  }
  return (
    <details className="scope" data-scope="index">
      <summary className="scope__name">{name}</summary>
      <ul className="scope__list">
        {countries.map((country) => (
          <li key={country.geo}>
            <a href={country.href} hrefLang={content.locale}>
              {country.name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
