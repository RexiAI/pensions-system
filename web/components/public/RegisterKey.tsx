import { REGISTER_ROWS } from '../../content/registers';
import type { CountryLocaleContent } from '../../content/types';
import { localePath } from './SiteHeader';

export interface RegisterKeyProps {
  content: CountryLocaleContent;
}

/**
 * Teaches the registers, with live samples, before any argument is made. The heading's count
 * is interpolated from the rows this component actually renders, so prose and DOM cannot
 * disagree (AC-001-91); the content gate rejects a locale whose heading states another
 * number.
 */
export function RegisterKey({ content }: RegisterKeyProps) {
  return (
    <section className="register-key" id="metodo" aria-labelledby="register-key-heading">
      <h2 className="register__label" id="register-key-heading">
        {content.t('register.key.heading', { count: REGISTER_ROWS.length })}
      </h2>
      {REGISTER_ROWS.map((row) => (
        <div className="register-key__row" key={row.label}>
          <p className="register__label">{content.t(row.label)}</p>
          <p>{content.t(row.sample)}</p>
        </div>
      ))}
      <p className="register-key__method">
        <a href={localePath(content.locale)}>{content.t('fig.01.title')}</a>
      </p>
    </section>
  );
}
