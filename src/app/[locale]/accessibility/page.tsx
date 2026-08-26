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
    path: routes.accessibility,
    namespace: 'legal.accessibility'
  });
}

const VERIFIED_ITEMS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const GAP_ITEMS = [0, 1, 2] as const;

export default function AccessibilityPage({
  params
}: {
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);

  const t = useTranslations('legal.accessibility');
  const legal = useTranslations('legal');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('accessibility'), path: routes.accessibility }
        ])}
      />

      <Section>
        <div className="prose">
          <h1>{t('title')}</h1>
          <p className="lede">{t('lede')}</p>
          <p className="updated">
            {common('updated')} <time dateTime="2026-08-25">2026-08-25</time>
          </p>
          <p className="sample-note">
            <Icon name="i-alert" />
            <span>{legal('draftNote')}</span>
          </p>

          <h2>{t('target.title')}</h2>
          <p>{t('target.body')}</p>

          <h2>{t('status.title')}</h2>
          <p>{t('status.body')}</p>

          <h2>{t('verified.title')}</h2>
          <ul>
            {VERIFIED_ITEMS.map((i) => (
              <li key={i}>{t(`verified.items.${i}`)}</li>
            ))}
          </ul>

          <h2>{t('gaps.title')}</h2>
          <p>{t('gaps.lede')}</p>
          <ul>
            {GAP_ITEMS.map((i) => (
              <li key={i}>{t(`gaps.items.${i}`)}</li>
            ))}
          </ul>
          <h3>{t('gaps.scheduler')}</h3>
          <p>{t('gaps.schedulerBody')}</p>

          <h2>{t('barriers.title')}</h2>
          <p>{t('barriers.body')}</p>
          <p>{t('barriers.promise')}</p>

          <h2>{t('contact.title')}</h2>
          <p>
            {t('contact.body')} <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </Section>
    </>
  );
}
