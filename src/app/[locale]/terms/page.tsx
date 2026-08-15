import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { Icon } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import { Section } from '@/components/ui';

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.terms,
    namespace: 'legal.terms'
  });
}

const ACCEPTABLE_ITEMS = [0, 1, 2, 3, 4] as const;

export default function TermsPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('legal.terms');
  const legal = useTranslations('legal');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('terms'), path: routes.terms }
        ])}
      />

      <Section>
        <div className="prose">
          <h1>{t('title')}</h1>
          <p className="lede">{t('lede')}</p>
          <p className="updated">
            {common('updated')} <time dateTime="2026-08-03">2026-08-03</time>
          </p>
          <p className="sample-note">
            <Icon name="i-alert" />
            <span>{legal('draftNote')}</span>
          </p>

          <h2>{t('scope.title')}</h2>
          <p>{t('scope.body')}</p>

          <h2>{t('informational.title')}</h2>
          <p>{t('informational.body')}</p>

          <h2>{t('sample.title')}</h2>
          <p>{t('sample.body')}</p>

          <h2>{t('acceptable.title')}</h2>
          <p>{t('acceptable.body')}</p>
          <ul>
            {ACCEPTABLE_ITEMS.map((i) => (
              <li key={i}>{t(`acceptable.items.${i}`)}</li>
            ))}
          </ul>

          <h2>{t('ip.title')}</h2>
          <p>{t('ip.body')}</p>

          <h2>{t('thirdParty.title')}</h2>
          <p>{t('thirdParty.body')}</p>

          <h2>{t('warranty.title')}</h2>
          <p>{t('warranty.body')}</p>

          <h2>{t('liability.title')}</h2>
          <p>{t('liability.body')}</p>

          <h2>{t('links.title')}</h2>
          <p>{t('links.body')}</p>

          <h2>{t('changes.title')}</h2>
          <p>{t('changes.body')}</p>

          <h2>{t('law.title')}</h2>
          <p>{t('law.body')}</p>

          <h2>{t('contact.title')}</h2>
          <p>
            {t('contact.body')} <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </Section>
    </>
  );
}
