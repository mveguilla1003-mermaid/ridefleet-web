import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { routes } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { Icon, type IconName } from '@/components/Icons';
import { ArrowLink, ButtonLink, Eyebrow, Section } from '@/components/ui';

/**
 * The airport-pickup arc, written from the current RFM tree (origin/main,
 * 0d0887b) read on 2026-08-15 through an isolated worktree.
 *
 * Naming, deliberately: in the code this is "shuttle" — the model, the
 * routes, the page and the i18n namespace are all `shuttle`. "Valet" is an
 * internal arc name and, in one doc, the name of the voice-side system. So
 * the route stays /valet because that is what the owner calls it, the copy
 * describes the function, and the lede says what it is called inside the
 * product. It is NOT presented as a fourth product: it is Voz AI and Ride
 * Fleet Manager doing one job together.
 *
 * Also deliberate: nothing here claims valet.ridefleetmanager.com. That host
 * appears nowhere in the RFM repo, so it is unverified from the code and this
 * page does not lean on it.
 *
 * The identity paragraph is the one to protect in any edit. Masked-until-
 * verified, the datum that selected a candidate never proving it, and a
 * throttle tuned not to charge a misheard code are all real and all rare;
 * they are the reason this page is credible.
 */

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.valet,
    namespace: 'valet'
  });
}

const BEATS: IconName[] = ['i-search', 'i-shield', 'i-bell'];
const TRACKER_ITEMS: IconName[] = ['i-lock', 'i-gauge', 'i-clock'];
const PRECISIONS = [0, 1, 2, 3, 4, 5] as const;

export default function ValetPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('valet');
  const nav = useTranslations('nav');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('valet'), path: routes.valet }
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
        <div className="feature-grid">
          {BEATS.map((icon, i) => (
            <div className="feature" key={i}>
              <span className="fic">
                <Icon name={icon} />
              </span>
              <h2>{t(`beats.${i}.value`)}</h2>
              <p>{t(`beats.${i}.body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- Live tracker, shipped 2026-08-15 (RFM 6d8173c) ----------------
          This section is why three lines of `precision` had to change: the
          page previously said there was no map, no vehicle tracking and no
          customer status page, and all three became false the day the
          tracker landed. "No driver assignment" and "no ETA" survived
          verification and stay.

          The honest boundaries are load-bearing here. The map depends on a
          GPS unit being fitted; without it the page is permanently offline.
          What the product shows is a HEADWAY the admin typed, never a
          countdown — the code says so in as many words, and repeating that
          on the site is the whole reason a buyer would believe the rest. */}
      <Section>
        <div className="measure">
          <h2>{t('tracker.title')}</h2>
          <p className="lede" style={{ marginTop: 'var(--sp-4)' }}>
            {t('tracker.body')}
          </p>
        </div>
        <div className="feature-grid" style={{ marginTop: 'var(--sp-8)' }}>
          {TRACKER_ITEMS.map((icon, i) => (
            <div className="feature" key={i}>
              <span className="fic">
                <Icon name={icon} />
              </span>
              <h3>{t(`tracker.items.${i}.value`)}</h3>
              <p>{t(`tracker.items.${i}.body`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="alt">
        <div className="split" style={{ alignItems: 'start' }}>
          <div>
            <h2>{t('trust.title')}</h2>
            <p style={{ marginTop: 'var(--sp-4)' }}>{t('trust.body')}</p>
            <p className="meta" style={{ marginTop: 'var(--sp-4)' }}>
              {t('close')}
            </p>
          </div>
          <div>
            <h2>{t('precision.title')}</h2>
            <div className="prose" style={{ marginTop: 'var(--sp-4)' }}>
              <ul>
                {PRECISIONS.map((i) => (
                  <li key={i}>{t(`precision.items.${i}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section variant="well">
        <div className="measure">
          <div className="btn-row">
            <ButtonLink href={routes.demo} icon="i-arrow-right">
              {nav('bookDemo')}
            </ButtonLink>
          </div>
          <div style={{ marginTop: 'var(--sp-6)' }}>
            <ArrowLink href={routes.vozAi} tone="teal">
              {nav('vozAi')}
            </ArrowLink>
          </div>
        </div>
      </Section>
    </>
  );
}
