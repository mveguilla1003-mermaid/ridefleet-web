import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { Icon } from '@/components/Icons';
import { Eyebrow, Section } from '@/components/ui';

/**
 * Restructured 2026-08-25: what exists first, everything unfinished gathered
 * into one closing section. The page previously opened by listing what we do
 * NOT hold and sprinkled "under construction" badges through the body, which
 * read as a draft rather than as a security posture.
 *
 * Two rules still govern the copy, and neither moved:
 *
 * 1. Claims sit at exactly the strength Engineering's brief stated. Nothing
 *    here says "penetration tested" or "third-party audit" — the Testing
 *    section says automated scanning and dynamic testing, in those words,
 *    which is what the brief permits.
 *
 * 2. SOC 2 and ISO 27001 appear ONLY under `working`, described as programmes
 *    with nothing issued. ISO 27001 contradicts the brief of 2026-08-24 and
 *    was published on the owner's direct instruction the following day; that
 *    is flagged for Engineering in the review document. If they say the
 *    programme has not started, item 1 of `working` comes out.
 *
 * The scope section stays at the top. This site and the platform are different
 * systems, and without that split every bullet reads as a claim about
 * ridefleet.com.
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
const WORKING = [0, 1, 2, 3, 4] as const;

export default function SecurityPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('security');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  const list = (section: string, indices: readonly number[]) => (
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
            {common('updated')} <time dateTime="2026-08-25">2026-08-25</time>
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

      {/* Payments leads because it is the question buyers ask first, and it
          carries the seal — whose artwork is white-on-transparent and only
          reads on the ink band. */}
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

          <h2>{t('monitoring.title')}</h2>
          {list('monitoring', MONITORING)}

          <h2>{t('testing.title')}</h2>
          {list('testing', TESTING)}

          <h2>{t('infra.title')}</h2>
          {list('infra', INFRA)}

          <h2>{t('privacy.title')}</h2>
          {list('privacy', PRIVACY)}

          <h2>{t('governance.title')}</h2>
          {list('governance', GOVERNANCE)}

          <h2>{t('site.title')}</h2>
          <p>{t('site.body')}</p>
          <p>
            <Link href={routes.privacy}>{t('site.link')}</Link>
          </p>
        </div>
      </Section>

      {/* Everything unfinished, in one place. This section IS the status, which
          is why no item carries a Building badge any more. */}
      <Section variant="well">
        <div className="prose">
          <h2>{t('working.title')}</h2>
          <p>{t('working.lede')}</p>
          {list('working', WORKING)}
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
