'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, routing, type Locale } from '@/i18n/routing';

/**
 * ES | EN control.
 *
 * Swaps locale while staying on the same page (`usePathname` from the i18n
 * navigation returns the locale-less path), preserving the hash so a visitor
 * deep in a section does not get thrown back to the top.
 *
 * The two buttons are a radio-style group: `aria-pressed` tracks the active
 * locale. That attribute was a real WCAG 4.1.2 defect in the static mockups —
 * it is now derived from state rather than hand-written per page.
 */
export function LocaleSwitch() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const active = (params?.locale as Locale) ?? routing.defaultLocale;

  function go(locale: Locale) {
    if (locale === active) return;
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    router.replace(`${pathname}${hash}`, { locale });
  }

  return (
    <div className="lang" role="group" aria-label={t('languageGroup')}>
      {routing.locales.map((locale, i) => (
        <span key={locale} style={{ display: 'contents' }}>
          {i > 0 ? <span className="sep" aria-hidden="true" /> : null}
          <button
            type="button"
            className={[
              `${locale}-btn`,
              locale === active ? 'is-active' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={locale === active}
            aria-label={t(`switchTo.${locale}`)}
            onClick={() => go(locale)}
          >
            {locale.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
