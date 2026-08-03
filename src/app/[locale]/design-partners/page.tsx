import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes } from '@/lib/site';
import { Icon } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import {
  ButtonLink,
  Chip,
  Eyebrow,
  Section,
  SectionHead
} from '@/components/ui';

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.designPartners,
    namespace: 'designPartners'
  });
}

const FIT_ITEMS = [0, 1, 2] as const;
const GET_ITEMS = [0, 1, 2, 3] as const;
const EXPECT_ITEMS = [0, 1, 2, 3] as const;

/**
 * Eleven slots, every one of them empty. The count is the wall's layout, not a
 * promise of eleven partnerships — the cohort size is stated in words in
 * `slots.body`. Nothing here may ever be filled with an invented logo.
 */
const PARTNER_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export default function DesignPartnersPage({
  params
}: {
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);

  const t = useTranslations('designPartners');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('designPartners'), path: routes.designPartners }
        ])}
      />

      <Section>
        <div className="measure">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1>{t('title')}</h1>
          <p className="lede">{t('lede')}</p>
          <div className="cluster" style={{ marginTop: 'var(--sp-6)' }}>
            <Chip tone="brand">{t('status')}</Chip>
          </div>
          <div className="btn-row" style={{ marginTop: 'var(--sp-6)' }}>
            <ButtonLink href={routes.demo} icon="i-arrow-right">
              {t('apply.cta')}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section variant="alt">
        <SectionHead title={t('fit.title')} />
        <div className="feature-grid">
          {FIT_ITEMS.map((i) => (
            <article className="feature" key={i}>
              <div className="fic">
                <Icon name="i-users" />
              </div>
              <h3>{t(`fit.items.${i}.title`)}</h3>
              <p>{t(`fit.items.${i}.body`)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid grid-2">
          <div>
            <h2>{t('get.title')}</h2>
            <ul className="flist">
              {GET_ITEMS.map((i) => (
                <li key={i}>
                  <span className="fi">
                    <Icon name="i-check" />
                  </span>
                  <div>
                    <b>{t(`get.items.${i}.title`)}</b>
                    <span className="d">{t(`get.items.${i}.body`)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{t('expect.title')}</h2>
            <ul className="flist flist--gold">
              {EXPECT_ITEMS.map((i) => (
                <li key={i}>
                  <span className="fi">
                    <Icon name="i-clipboard" />
                  </span>
                  <div>
                    <b>{t(`expect.items.${i}.title`)}</b>
                    <span className="d">{t(`expect.items.${i}.body`)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section variant="alt">
        <div className="measure">
          <h2>{t('slots.title')}</h2>
          <p style={{ marginTop: 'var(--sp-3)' }}>{t('slots.body')}</p>
          <p className="meta" style={{ marginTop: 'var(--sp-3)' }}>
            {t('slots.note')}
          </p>
        </div>

        <div style={{ marginTop: 'var(--sp-10)' }}>
          <h3>{t('wall.title')}</h3>
          <p className="small measure" style={{ marginTop: 'var(--sp-3)' }}>
            {t('wall.body')}
          </p>
          <div className="grid grid-4" style={{ marginTop: 'var(--sp-6)' }}>
            {PARTNER_SLOTS.map((i) => (
              <div className="logo-slot" key={i}>
                {common('logoSlot')}
              </div>
            ))}
          </div>
          <p className="sample-note">
            <Icon name="i-info" />
            <span>{t('wall.caption')}</span>
          </p>
        </div>
      </Section>

      <Section>
        <div className="cta-band">
          <h2>{t('apply.title')}</h2>
          <p>{t('apply.body')}</p>
          <div className="btn-row">
            <ButtonLink href={routes.demo} size="lg" icon="i-arrow-right">
              {t('apply.cta')}
            </ButtonLink>
          </div>
          <p className="meta" style={{ marginTop: 'var(--sp-6)' }}>
            {t('apply.after')}
          </p>
        </div>
      </Section>
    </>
  );
}
