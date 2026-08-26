import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { routes } from '@/lib/site';

/**
 * Sticky mobile bottom bar: Book a demo.
 *
 * It used to carry a tap-to-call button beside it, gated on `hasPhone`. That
 * button was REMOVED on 2026-08-26, the day a real number existed — which is
 * exactly when it became a problem rather than a feature.
 *
 * This bar renders on EVERY route: /pricing, /terms, /privacy, the 404. The
 * only number we have is the Valet demo line — a metered line for talking to
 * the AI voice agent, explicitly not support and not reservations. A call
 * button on every page is the "global footer" placement the owner asked us not
 * to ship without checking, and it is the likeliest way a customer with a
 * rental problem dials a sales demo by mistake.
 *
 * The number lives on /valet only, beside copy that says "demo" out loud. Do
 * not reintroduce it here.
 */
export function StickyCta() {
  const t = useTranslations('nav');

  return (
    <div className="sticky-cta">
      <Link className="btn btn--primary" href={routes.demo}>
        {t('bookDemo')}
      </Link>
    </div>
  );
}
