import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { Icon, type IconName } from '@/components/Icons';
import {
  ArrowLink,
  BuildingBadge,
  Eyebrow,
  Section,
  SectionHead
} from '@/components/ui';

/**
 * A confirmation page has nothing to offer a search engine and everything to
 * lose by being indexed: it would rank for the brand, be entered cold by
 * people who never filled the form, and pollute the demo-request conversion
 * count. So the canonical metadata is built as usual and `robots` is then
 * overridden — this is the one page on the site that opts out.
 */
export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  const meta = await buildMetadata({
    locale: params.locale,
    path: routes.demoThankYou,
    namespace: 'thankYou'
  });
  return { ...meta, robots: { index: false, follow: false } };
}

const NEXT_ITEMS = [0, 1, 2] as const;
const NEXT_ICONS: IconName[] = ['i-mail', 'i-calendar', 'i-clock'];
const PREP_ITEMS = [0, 1, 2, 3, 4, 5] as const;

export default function ThankYouPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('thankYou');
  const nav = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <>
      <Section>
        <div className="measure">
          <Eyebrow tone="neutral">{t('eyebrow')}</Eyebrow>
          <h1>{t('title')}</h1>
          <p className="lede">{t('lede')}</p>
        </div>
      </Section>

      {/* Added 2026-08-26. Without this, the only route from a submitted form
          to a booked call was a person answering by hand: the form gathered the
          qualifying answers and then someone had to trade emails about times.
          The calendar was already live further up /demo, but nobody who
          finished the form ever saw it again. */}
      <Section variant="well">
        <div className="measure">
          <h2>{t('book.title')}</h2>
          <p style={{ marginTop: 'var(--sp-3)' }}>{t('book.body')}</p>
          <div className="btn-row">
            <a
              className="btn btn--primary btn--lg"
              href={site.schedulerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('book.cta')}
              <Icon name="i-arrow-up-right" />
            </a>
          </div>
          <p className="meta" style={{ marginTop: 'var(--sp-4)' }}>
            {t('book.alt')}
          </p>
        </div>
      </Section>

      <Section variant="alt">
        <SectionHead title={t('next.title')} lede={t('next.lede')} />
        <div className="feature-grid">
          {NEXT_ITEMS.map((i) => (
            <article className="feature" key={i}>
              <div className="fic">
                <Icon name={NEXT_ICONS[i]} />
              </div>
              <h3>{t(`next.items.${i}.title`)}</h3>
              <p>{t(`next.items.${i}.body`)}</p>
            </article>
          ))}
        </div>
        <p className="small" style={{ marginTop: 'var(--sp-6)' }}>
          {t('next.reminder')} <BuildingBadge label={common('building')} />
        </p>
        <p className="meta" style={{ marginTop: 'var(--sp-2)' }}>
          {t('next.reminderNote')}
        </p>
      </Section>

      <Section>
        <div className="grid grid-2">
          <div>
            <SectionHead title={t('prep.title')} lede={t('prep.lede')} />
          </div>
          <ul className="flist">
            {PREP_ITEMS.map((i) => (
              <li key={i}>
                <span className="fi">
                  <Icon name="i-check" />
                </span>
                <span className="d">{t(`prep.items.${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="measure" style={{ marginTop: 'var(--sp-12)' }}>
          <h2 className="t-h4">{t('change.title')}</h2>
          <p className="small" style={{ marginTop: 'var(--sp-3)' }}>
            {t('change.body')}{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </Section>

      <Section variant="alt">
        <SectionHead title={t('onward.title')} lede={t('onward.lede')} />
        <div className="grid grid-3">
          <div className="stack stack-3">
            <p className="small">{t('onward.rfm')}</p>
            <ArrowLink href={routes.rideFleetManager}>
              {nav('rideFleetManager')}
            </ArrowLink>
          </div>
          <div className="stack stack-3">
            <p className="small">{t('onward.toll')}</p>
            <ArrowLink href={routes.tollBridge} tone="gold">
              {nav('tollBridge')}
            </ArrowLink>
          </div>
          <div className="stack stack-3">
            <p className="small">{t('onward.voz')}</p>
            <ArrowLink href={routes.valet} tone="teal">
              {nav('valet')}
            </ArrowLink>
          </div>
        </div>
      </Section>
    </>
  );
}
