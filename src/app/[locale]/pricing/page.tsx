import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { ButtonLink, Eyebrow, Section } from '@/components/ui';

/**
 * Pricing without prices, on purpose.
 *
 * The eight figures the plan carries are still unconfirmed, and publishing an
 * unconfirmed price is worse than publishing none: it sets an expectation the
 * first call has to walk back. So this page does the honest version — it says
 * WHAT MOVES the number, states plainly what is included versus billed
 * separately (both facts we can stand behind), and routes to the demo.
 *
 * When the numbers are confirmed, this page is where they go; the structure
 * here is already the shape a table would slot into.
 */

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.pricing,
    namespace: 'pricing'
  });
}

const DRIVERS = [0, 1, 2] as const;

export default function PricingPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('pricing');
  const nav = useTranslations('nav');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('pricing'), path: routes.pricing }
        ])}
      />

      <Section>
        <div className="measure">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1>{t('title')}</h1>
          <p className="lede">{t('lede')}</p>
        </div>
      </Section>

      <Section variant="alt">
        <h2>{t('drivers.title')}</h2>
        <div className="feature-grid" style={{ marginTop: 'var(--sp-8)' }}>
          {DRIVERS.map((i) => (
            <div className="feature" key={i}>
              <h3>{t(`drivers.items.${i}.value`)}</h3>
              <p>{t(`drivers.items.${i}.body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="measure">
          <h2>{t('included.title')}</h2>
          <p style={{ marginTop: 'var(--sp-4)' }}>{t('included.body')}</p>
          <p className="meta" style={{ marginTop: 'var(--sp-4)' }}>
            {t('included.note')}
          </p>
        </div>
      </Section>

      <Section variant="well">
        <div className="measure">
          <h2>{t('cta.title')}</h2>
          <p style={{ marginTop: 'var(--sp-4)' }}>{t('cta.body')}</p>
          <div className="btn-row" style={{ marginTop: 'var(--sp-6)' }}>
            <ButtonLink href={routes.demo} icon="i-arrow-right">
              {t('cta.button')}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
