import { useTranslations } from 'next-intl';
import { type Locale } from '@/i18n/routing';
import { Icon, type IconName } from '@/components/Icons';

/**
 * The airport-pickup arc, written from the current RFM tree (origin/main,
 * 0d0887b) read on 2026-08-15 through an isolated worktree.
 *
 * It shipped as its own route, /valet, until 2026-08-17. Then the voice
 * product took the Valet name — which is what RFM's own code calls it — and
 * this stopped making sense as a separate page: the pickup IS Valet answering
 * the phone with Ride Fleet Manager dispatching behind it. So the arc became
 * chapter 04 of the Valet page and its i18n namespace was renamed `valet` ->
 * `pickup`, freeing `valet` for the product.
 *
 * Two things carried over unchanged and must survive any edit:
 *
 * 1. The identity paragraph. Masked-until-verified, a datum that selects a
 *    candidate without ever proving it, and a throttle tuned NOT to charge on
 *    a misheard code are all real and all rare. They are why this section is
 *    credible rather than a feature list.
 *
 * 2. The tracker's honest boundaries. The map needs a GPS unit fitted; with
 *    none, the page is permanently offline. What ships is a HEADWAY an admin
 *    typed, never a countdown — the RFM code says exactly that. "No driver
 *    assignment" and "no ETA" also survived verification and stay. The three
 *    screenshots are from RFM's demo tenant and every position in them is
 *    SIMULATED: the telematics provider has not issued credentials, so no
 *    screenshot of real GPS exists. That is what the caption is for; it is not
 *    decoration. When real GPS lands, RFM reshoots and the caption goes.
 *
 * Nothing here claims valet.ridefleetmanager.com. That host appears nowhere in
 * the RFM repo, so it is unverified from the code and this page never leans on
 * it.
 *
 * Heading levels are one rung lower than they were as a standalone page (the
 * old h1 is an h2 here, and so on down): the Valet page already owns the h1,
 * and the audit's axe pass fails on a skipped level.
 */

const BEATS: IconName[] = ['i-search', 'i-shield', 'i-bell'];
const TRACKER_ITEMS: IconName[] = ['i-mail', 'i-location', 'i-check-circle'];
/** File slugs; the locale suffix picks the matching language pair. */
const TRACKER_SHOTS = ['live', 'location', 'offline'] as const;
const PRECISIONS = [0, 1, 2, 3, 4, 5, 6] as const;

export function PickupSections({ locale }: { locale: Locale }) {
  const t = useTranslations('pickup');
  const chapterOf = useTranslations('valet')('chapterOf');

  return (
    <>
      <section className="sec sec--alt" id="recogida">
        <div className="container">
          <div className="editorial-head">
            <span className="chapter-mark">
              04<span className="of">{chapterOf}</span>
            </span>
            <h2 className="t-h2">{t('title')}</h2>
            <p className="aside">{t('lede')}</p>
          </div>

          <div className="feature-grid" style={{ marginTop: 'var(--sp-8)' }}>
            {BEATS.map((icon, i) => (
              <div className="feature" key={i}>
                <span className="fic">
                  <Icon name={icon} />
                </span>
                <h3>{t(`beats.${i}.value`)}</h3>
                <p>{t(`beats.${i}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="container">
          <div className="measure">
            <h3 className="t-h3">{t('tracker.title')}</h3>
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
                <h4>{t(`tracker.items.${i}.value`)}</h4>
                <p>{t(`tracker.items.${i}.body`)}</p>
              </div>
            ))}
          </div>

          {/* One pair of screens per locale, so the phone in the picture
              speaks the same language as the page around it — the first set
              came back with an English heading over Spanish branch
              instructions, which is what sent it back. */}
          <figure className="shot-figure" style={{ marginTop: 'var(--sp-10)' }}>
            <div className="grid grid-3">
              {TRACKER_SHOTS.map((slug, i) => (
                <div key={slug}>
                  <img
                    src={`/valet/tracker-${slug}-${locale}.png`}
                    alt={t(`tracker.shots.${i}.alt`)}
                    width={780}
                    height={1688}
                    loading="lazy"
                  />
                  <p className="small">{t(`tracker.shots.${i}.caption`)}</p>
                </div>
              ))}
            </div>
            <figcaption className="sample-note">
              <Icon name="i-info" />
              <span>{t('tracker.shotsNote')}</span>
            </figcaption>
          </figure>

          {/* The differentiator, and the reason RFM asked us NOT to embed a
              live tracker on this site: a fixed public URL would break the
              model this paragraph sells. */}
          <div className="card measure" style={{ marginTop: 'var(--sp-10)' }}>
            <h4 className="t-h4">{t('tracker.privacy.title')}</h4>
            <p style={{ marginTop: 'var(--sp-3)' }}>{t('tracker.privacy.body')}</p>
          </div>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="container">
          <div className="split" style={{ alignItems: 'start' }}>
            <div>
              <h3 className="t-h3">{t('trust.title')}</h3>
              <p style={{ marginTop: 'var(--sp-4)' }}>{t('trust.body')}</p>
              <p className="meta" style={{ marginTop: 'var(--sp-4)' }}>
                {t('close')}
              </p>
            </div>
            <div>
              <h3 className="t-h3">{t('precision.title')}</h3>
              <div className="prose" style={{ marginTop: 'var(--sp-4)' }}>
                <ul>
                  {PRECISIONS.map((i) => (
                    <li key={i}>{t(`precision.items.${i}`)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
