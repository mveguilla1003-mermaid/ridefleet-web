import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { Icon } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import { BuildingBadge, Section } from '@/components/ui';

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.cookies,
    namespace: 'legal.cookies'
  });
}

export default function CookiesPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('legal.cookies');
  const legal = useTranslations('legal');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('cookies'), path: routes.cookies }
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

          <h2>{t('today.title')}</h2>
          <p>{t('today.body')}</p>

          <h2>{t('essential.title')}</h2>
          <p>{t('essential.body')}</p>

          <h2>{t('language.title')}</h2>
          <p>{t('language.body')}</p>

          <h2>{t('analytics.title')}</h2>
          <p>
            {t('analytics.badgeBody')}{' '}
            <BuildingBadge label={common('building')} />
          </p>
          <p>{t('analytics.body')}</p>

          <h2>{t('control.title')}</h2>
          <p>{t('control.body')}</p>

          <h2>{t('forms.title')}</h2>
          <p>{t('forms.body')}</p>
          <p>
            <Link href={routes.privacy}>{t('forms.link')}</Link>
          </p>

          <h2>{t('contact.title')}</h2>
          <p>
            {t('contact.body')} <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </Section>
    </>
  );
}
