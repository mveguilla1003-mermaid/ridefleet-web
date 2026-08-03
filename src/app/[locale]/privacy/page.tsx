import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link, type Locale } from '@/i18n/routing';
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
    path: routes.privacy,
    namespace: 'legal.privacy'
  });
}

const COLLECT_ITEMS = [0, 1, 2, 3, 4] as const;
const WHY_ITEMS = [0, 1, 2, 3] as const;
const RIGHTS_ITEMS = [0, 1, 2, 3, 4] as const;

export default function PrivacyPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('legal.privacy');
  const legal = useTranslations('legal');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('privacy'), path: routes.privacy }
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

          <h2>{t('who.title')}</h2>
          <p>{t('who.body')}</p>

          <h2>{t('collect.title')}</h2>
          <p>{t('collect.body')}</p>
          <ul>
            {COLLECT_ITEMS.map((i) => (
              <li key={i}>{t(`collect.items.${i}`)}</li>
            ))}
          </ul>

          <h2>{t('why.title')}</h2>
          <ul>
            {WHY_ITEMS.map((i) => (
              <li key={i}>{t(`why.items.${i}`)}</li>
            ))}
          </ul>

          <h2>{t('basis.title')}</h2>
          <p>{t('basis.body')}</p>

          <h2>{t('retention.title')}</h2>
          <p>{t('retention.body')}</p>

          <h2>{t('sharing.title')}</h2>
          <p>{t('sharing.body')}</p>

          <h2>{t('rights.title')}</h2>
          <p>{t('rights.body')}</p>
          <ul>
            {RIGHTS_ITEMS.map((i) => (
              <li key={i}>{t(`rights.items.${i}`)}</li>
            ))}
          </ul>
          <p>{t('rights.after')}</p>

          <h2>{t('cookies.title')}</h2>
          <p>{t('cookies.body')}</p>
          <p>
            <Link href={routes.cookies}>{t('cookies.link')}</Link>
          </p>

          <h2>{t('changes.title')}</h2>
          <p>{t('changes.body')}</p>

          <h2>{t('contact.title')}</h2>
          <p>
            {t('contact.body')} <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </Section>
    </>
  );
}
