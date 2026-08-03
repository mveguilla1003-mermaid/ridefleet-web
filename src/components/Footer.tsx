import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from './Icons';
import { footerNav, legalNav, routes, site } from '@/lib/site';

/**
 * The one shared footer. Four columns plus the legal utility row that no page
 * in the static set carried at all.
 *
 * Markets are rendered as TEXT LABELS, never flag emoji: on Windows Chrome the
 * regional-indicator pairs fall back to the literal letters "PR" / "US", and
 * the site has a hard no-emoji rule regardless.
 */
export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link className="brand" href={routes.home}>
              <span className="mark">
                <Icon name="i-vehicle" />
              </span>
              Ride Fleet
            </Link>
            <p className="foot-about">{t('about')}</p>
          </div>

          {footerNav.map((col) => (
            <div className="foot-col" key={col.headingKey}>
              <h2>{t(`headings.${col.headingKey}`)}</h2>
              {col.links.map((link, i) => (
                <Link
                  key={`${link.labelKey}-${i}`}
                  href={
                    link.hash
                      ? `${routes[link.key]}#${link.hash}`
                      : routes[link.key]
                  }
                >
                  {nav(link.labelKey)}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="foot-bot">
          <span>
            © {site.founded} Ride Fleet. {t('rights')}
          </span>
          <span className="foot-status">
            <span className="led" aria-hidden="true" />
            {site.locationLabel}
          </span>
        </div>

        <div className="foot-legal">
          {legalNav.map((item, i) => (
            <span key={item.key} style={{ display: 'contents' }}>
              {i > 0 ? (
                <span className="dot" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <Link href={routes[item.key]}>{nav(item.labelKey)}</Link>
            </span>
          ))}
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <span>{t('markets')}</span>
        </div>
      </div>
    </footer>
  );
}
