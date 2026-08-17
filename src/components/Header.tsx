'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Icon } from './Icons';
import { LocaleSwitch } from './LocaleSwitch';
import { primaryNav, routes } from '@/lib/site';

/**
 * The one shared header. Five per-page copies were the single biggest source
 * of drift in the static mockups (three spellings of one product name on one
 * page), so nav labels come from `primaryNav` + the `nav` message namespace
 * and exist exactly once.
 *
 * Mobile: below 960px `.nav-links` is hidden by the design system, so the
 * hamburger panel is the only product-to-product path on the primary market's
 * primary device. It closes on route change, on Escape, and returns focus to
 * the toggle.
 */
export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={stuck ? 'nav is-stuck' : 'nav'} aria-label={t('primary')}>
      <div className="container nav-in">
        <Link className="brand" href={routes.home}>
          <span className="mark">
            <Icon name="i-vehicle" />
          </span>
          Ride Fleet
        </Link>

        <div className="nav-links">
          {primaryNav.map(({ key, navKey }) => (
            <Link
              key={key}
              href={routes[key]}
              aria-current={isCurrent(routes[key]) ? 'page' : undefined}
            >
              {t(navKey)}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <LocaleSwitch />
          <Link className="btn btn--primary btn--sm" href={routes.demo}>
            <span className="nav-long">{t('bookDemo')}</span>
            <span className="nav-short">{t('bookDemoShort')}</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            id="navToggle"
            aria-expanded={open}
            aria-controls="navMobile"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'i-x' : 'i-menu'} />
          </button>
        </div>
      </div>

      <div className={open ? 'nav-mobile is-open' : 'nav-mobile'} id="navMobile">
        <div className="container">
          {primaryNav.map(({ key, navKey }) => (
            <Link
              key={key}
              href={routes[key]}
              aria-current={isCurrent(routes[key]) ? 'page' : undefined}
            >
              {t(navKey)}
            </Link>
          ))}
          <Link href={routes.security}>{t('security')}</Link>
          <Link className="btn btn--primary" href={routes.demo}>
            {t('bookDemo')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
