import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { Icon } from '@/components/Icons';
import { BuildingBadge, Eyebrow, Section } from '@/components/ui';

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

const ACCESS_ITEMS = [0, 1, 2, 3] as const;
const NOT_YET_ITEMS = [0, 1, 2, 3] as const;

export default function SecurityPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('security');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  /** Inline "still being built" marker — never a footnote (guardrail #3). */
  const building = <BuildingBadge label={common('building')} />;

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
            {common('updated')} <time dateTime="2026-08-17">2026-08-17</time>
          </p>
        </div>
      </Section>

      <Section variant="alt">
        <div className="measure">
          <h2>{t('noCert.title')}</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-4)' }}>
            {t('noCert.body')}
          </p>
        </div>
      </Section>

      {/* The scan certificate sits immediately after "what we do NOT have",
          because that is exactly where a reader asks "so is there anything?".
          The scope paragraph is the load-bearing part: this certificate covers
          a quarterly vulnerability scan of the network the team works from —
          NOT the product, NOT this site. The page loses its whole point the
          day someone softens that into "PCI certified". */}
      {/* `band--ink` paints its own surface with layered gradients down to
          --ink-900, and remaps the surface/text aliases with it, so the white
          seal artwork lands on dark with the ratios components.css already
          documents. Do not add `sec--well`: its flat --surface-2 is overridden
          by that gradient anyway, and it only adds a stray border. */}
      <Section className="band--ink">
        <div className="measure">
          <h2>{t('scan.title')}</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-4)' }}>
            {t('scan.body')}
          </p>
          <div className="cert">
            {/* Not wrapped in the link: the text link below says where it
                goes, which reads better to a screen reader than an image
                whose alt would have to double as the link's name. */}
            <img
              className="cert-seal"
              src="/trust/securitymetrics-credit-card-safe.png"
              alt={t('scan.seal')}
              width={141}
              height={141}
              loading="lazy"
            />
            <div className="cert-copy">
              <p className="cert-scope">{t('scan.scope')}</p>
              <a
                className="cert-link"
                href={site.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('scan.link')}
                <Icon name="i-external" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="prose">
          <h2>{t('holdings.title')}</h2>
          <p>{t('holdings.body')}</p>
          <p>
            <Link href={routes.privacy}>{t('holdings.link')}</Link>
          </p>

          <h2>{t('hosting.title')}</h2>
          <p>{t('hosting.body')}</p>
          <h3>
            {t('hosting.pending')} {building}
          </h3>
          <p>{t('hosting.pendingBody')}</p>

          <h2>{t('transit.title')}</h2>
          <p>{t('transit.body')}</p>

          <h2>{t('rest.title')}</h2>
          <p>{t('rest.body')}</p>
          <h3>
            {t('rest.vault')} {building}
          </h3>
          <p>{t('rest.vaultBody')}</p>

          <h2>{t('access.title')}</h2>
          <p>{t('access.body')}</p>
          <ul>
            {ACCESS_ITEMS.map((i) => (
              <li key={i}>{t(`access.items.${i}`)}</li>
            ))}
          </ul>
          <h3>
            {t('access.audit')} {building}
          </h3>
          <p>{t('access.auditBody')}</p>

          <h2>{t('backups.title')}</h2>
          <p>{t('backups.body')}</p>
          <h3>
            {t('backups.gap')} {building}
          </h3>
          <p>{t('backups.gapBody')}</p>

          <h2>{t('subprocessors.title')}</h2>
          <p>{t('subprocessors.body')}</p>
          <h3>
            {t('subprocessors.list')} {building}
          </h3>
          <p>{t('subprocessors.listBody')}</p>

          <h2>{t('incident.title')}</h2>
          <p>{t('incident.body')}</p>
          <p>{t('incident.commitment')}</p>
          <h3>
            {t('incident.policy')} {building}
          </h3>
          <p>{t('incident.policyBody')}</p>

          <h2>{t('notYet.title')}</h2>
          <p>{t('notYet.lede')}</p>
          <ul>
            {NOT_YET_ITEMS.map((i) => (
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
