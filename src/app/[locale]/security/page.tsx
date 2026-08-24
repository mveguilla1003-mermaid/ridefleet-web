import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { Icon } from '@/components/Icons';
import { BuildingBadge, Eyebrow, Section } from '@/components/ui';

/**
 * Rewritten 2026-08-24 from Engineering's security brief.
 *
 * The brief's own rule governs every line here: claims may be rephrased for
 * tone but NEVER strengthened. Three things it explicitly forbids are absent
 * on purpose — "penetration tested", "SOC 2" in any form, and any absolute
 * ("100% safe", "bank-level encryption"). Two optional details are also left
 * out: the exact hosting regions, and a security@ address that nobody has yet
 * confirmed is monitored.
 *
 * The scope section is load-bearing. This site and the platform are different
 * systems; without that split, every bullet below would read as a claim about
 * ridefleet.com — false in the opposite direction, which is just as bad.
 *
 * Three Building badges survive because the brief does not cover what they
 * mark: the toll-credential vault, a customer-readable audit log, and a timed
 * restore drill with published RPO/RTO. Do not clear them without a line from
 * Engineering saying those three specifically are done.
 */

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.security,
    namespace: 'security'
  });
}

const ENCRYPTION = [0, 1, 2, 3] as const;
const PAYMENTS = [0, 1] as const;
const ACCESS = [0, 1, 2, 3, 4] as const;
const MONITORING = [0, 1, 2] as const;
const TESTING = [0, 1, 2] as const;
const INFRA = [0, 1, 2, 3, 4] as const;
const PRIVACY = [0, 1, 2, 3] as const;
const GOVERNANCE = [0, 1] as const;
const NOT_YET = [0, 1, 2, 3] as const;

export default function SecurityPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('security');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  /** Inline "still being built" marker — never a footnote (guardrail #3). */
  const building = <BuildingBadge label={common('building')} />;

  const list = (
    section: string,
    indices: readonly number[]
  ) => (
    <ul>
      {indices.map((i) => (
        <li key={i}>{t(`${section}.items.${i}`)}</li>
      ))}
    </ul>
  );

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('security'), path: routes.security }
        ])}
      />

      <Section>
        <div className="measure">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1>{t('title')}</h1>
          <p className="lede">{t('lede')}</p>
          <p className="meta" style={{ marginTop: 'var(--sp-5)' }}>
            {common('updated')} <time dateTime="2026-08-24">2026-08-24</time>
          </p>
        </div>
      </Section>

      {/* Scope first: which system each claim below is about. */}
      <Section variant="alt">
        <div className="prose">
          <h2>{t('scope.title')}</h2>
          <p>{t('scope.body')}</p>
          <ul>
            <li>{t('scope.site')}</li>
            <li>{t('scope.platform')}</li>
          </ul>
        </div>
      </Section>

      <Section>
        <div className="measure">
          <h2>{t('noCert.title')}</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-4)' }}>
            {t('noCert.body')}
          </p>
        </div>
      </Section>

      {/* Payments carries the seal, so it gets the ink band: the SecurityMetrics
          artwork is white-on-transparent and only reads on a dark surface. */}
      <Section className="band--ink">
        <div className="measure">
          <h2>{t('payments.title')}</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-4)' }}>
            {t('payments.body')}
          </p>
          <div className="cert">
            <img
              className="cert-seal"
              src="/trust/securitymetrics-credit-card-safe.png"
              alt={t('payments.seal')}
              width={141}
              height={141}
              loading="lazy"
            />
            <div className="cert-copy">
              <ul className="cert-list">
                {PAYMENTS.map((i) => (
                  <li key={i}>{t(`payments.items.${i}`)}</li>
                ))}
              </ul>
              <a
                className="cert-link"
                href={site.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('payments.link')}
                <Icon name="i-external" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="prose">
          <h2>{t('encryption.title')}</h2>
          {list('encryption', ENCRYPTION)}

          <h2>{t('access.title')}</h2>
          {list('access', ACCESS)}
          <h3>
            {t('access.audit')} {building}
          </h3>
          <p>{t('access.auditBody')}</p>

          <h2>{t('monitoring.title')}</h2>
          {list('monitoring', MONITORING)}

          <h2>{t('testing.title')}</h2>
          {list('testing', TESTING)}

          <h2>{t('infra.title')}</h2>
          {list('infra', INFRA)}
          <h3>
            {t('infra.restore')} {building}
          </h3>
          <p>{t('infra.restoreBody')}</p>

          <h2>{t('privacy.title')}</h2>
          {list('privacy', PRIVACY)}

          <h2>{t('governance.title')}</h2>
          {list('governance', GOVERNANCE)}

          <h2>
            {t('tollVault.title')} {building}
          </h2>
          <p>{t('tollVault.body')}</p>

          <h2>{t('site.title')}</h2>
          <p>{t('site.body')}</p>
          <p>
            <Link href={routes.privacy}>{t('site.link')}</Link>
          </p>

          <h2>{t('notYet.title')}</h2>
          <p>{t('notYet.lede')}</p>
          <ul>
            {NOT_YET.map((i) => (
              <li key={i}>{t(`notYet.items.${i}`)}</li>
            ))}
          </ul>
          <p>{t('notYet.close')}</p>
        </div>
      </Section>

      <Section variant="alt">
        <div className="measure">
          <h2>{t('contact.title')}</h2>
          <p style={{ marginTop: 'var(--sp-3)' }}>
            {t('contact.body')}{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </Section>
    </>
  );
}
