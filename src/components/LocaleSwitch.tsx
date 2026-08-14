'use client';

import type { MouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Link,
  usePathname,
  useRouter,
  routing,
  type Locale
} from '@/i18n/routing';

/**
 * ES | EN control — real links, not buttons. Switching language IS
 * navigation: as an <a> the alternate URL is crawlable, opens in a new tab,
 * and works with JavaScript disabled. `usePathname` from the i18n navigation
 * returns the locale-less path, so each link points at the SAME page in the
 * other locale, never back at the home page.
 *
 * The one thing an href cannot carry is the visitor's current #fragment
 * (server-rendered markup cannot know it), so a same-tab click is upgraded
 * on the client to keep the hash — a visitor deep in a section stays there.
 * Without JS the link still works, minus the hash.
 *
 * Active state: `aria-current` (aria-pressed is for buttons) plus the
 * `.is-active` chip styling (--p-800 on --n-0, 9.93 AAA) from components.css.
 */
export function LocaleSwitch() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  // Provider locale, not route params: the root 404 renders outside
  // `[locale]`, where params are empty but the provider is always right.
  const active = useLocale() as Locale;

  function keepHash(e: MouseEvent<HTMLAnchorElement>, locale: Locale) {
    // Only plain same-tab activations are upgraded; modified clicks
    // (new tab / window) keep native link behaviour.
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const hash = window.location.hash;
    if (!hash || locale === active) return;
    e.preventDefault();
    router.replace(`${pathname}${hash}`, { locale });
  }

  return (
    <div className="lang" role="group" aria-label={t('languageGroup')}>
      {routing.locales.map((locale, i) => (
        <span key={locale} style={{ display: 'contents' }}>
          {i > 0 ? <span className="sep" aria-hidden="true" /> : null}
          <Link
            href={pathname}
            locale={locale}
            className={locale === active ? 'is-active' : undefined}
            aria-current={locale === active ? 'true' : undefined}
            aria-label={t(`switchTo.${locale}`)}
            onClick={(e) => keepHash(e, locale)}
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
