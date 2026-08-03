import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from './Icons';
import { hasPhone, routes, site } from '@/lib/site';

/**
 * Sticky mobile bottom bar: Book a demo + tap-to-call.
 *
 * The call button only renders once the tracked line is provisioned
 * (NEXT_PUBLIC_DEMO_PHONE_E164). A `tel:` link to a masked number would be a
 * dead control, so it is absent rather than broken.
 */
export function StickyCta() {
  const t = useTranslations('nav');

  return (
    <div className="sticky-cta">
      <Link className="btn btn--primary" href={routes.demo}>
        {t('bookDemo')}
      </Link>
      {hasPhone ? (
        <a className="btn btn--secondary" href={`tel:${site.phoneHref}`}>
          <Icon name="i-phone" />
          <span className="sr-only">{t('callLine')}</span>
        </a>
      ) : null}
    </div>
  );
}
