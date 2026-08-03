import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { buildMetadata, breadcrumbSchema, faqSchema } from '@/lib/seo';
import { routes, site, hasPhone } from '@/lib/site';
import { Icon, type IconName } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import { BuildingBadge, SampleDataNote } from '@/components/ui';
import { DemoForm } from './DemoForm';

import '@/styles/pages/book-demo.css';

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.demo,
    namespace: 'demo'
  });
}

const AGENDA_ROWS = [
  { key: 'r1', icon: 'i-users' },
  { key: 'r2', icon: 'i-vehicle' },
  { key: 'r3', icon: 'i-toll-gantry' },
  { key: 'r4', icon: 'i-waveform' },
  { key: 'r5', icon: 'i-dollar' }
] as const satisfies readonly { key: string; icon: IconName }[];

const STEPS = ['s1', 's2', 's3'] as const;
const HANDY = [
  { key: 'h1', icon: 'i-vehicle' },
  { key: 'h2', icon: 'i-layers' },
  { key: 'h3', icon: 'i-clock' }
] as const satisfies readonly { key: string; icon: IconName }[];

/** Week of the reserved scheduler preview. `state` drives the inert styling only. */
const SLOT_DAYS = [
  { key: 'd1', state: 'is-off' },
  { key: 'd2', state: 'is-on' },
  { key: 'd3', state: '' },
  { key: 'd4', state: '' },
  { key: 'd5', state: '' }
] as const;

const SLOT_TIMES = [
  { key: 't1', state: 'is-taken' },
  { key: 't2', state: '' },
  { key: 't3', state: '' },
  { key: 't4', state: 'is-on' },
  { key: 't5', state: '' },
  { key: 't6', state: 'is-taken' }
] as const;

/**
 * Sample rows for the Toll Bridge console. Every visible string is in the
 * catalog; only the geometry (bar widths) and the tone class live here.
 */
const TABLE_ROWS = [
  { key: 'r1', conf: 97, confClass: '', chip: 'chip--ok' },
  { key: 'r2', conf: 94, confClass: '', chip: 'chip--ok' },
  { key: 'r3', conf: 61, confClass: ' conf--low', chip: 'chip--warn' },
  { key: 'r4', conf: 91, confClass: '', chip: 'chip--ok' },
  { key: 'r5', conf: 23, confClass: ' conf--bad', chip: 'chip--danger' }
] as const;

const SPARK_BARS = [46, 58, 52, 74, 66, 88, 100] as const;

const LEGEND = ['l1', 'l2', 'l3'] as const;
const FAQ_ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export default function DemoPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('demo');
  const nav = useTranslations('nav');
  const a11y = useTranslations('a11y');
  const common = useTranslations('common');

  const schedulerLive = site.schedulerUrl.length > 0;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('bookDemo'), path: routes.demo }
        ])}
      />
      <JsonLd
        data={faqSchema(
          FAQ_ITEMS.map((key) => ({
            q: t(`faq.items.${key}.q`),
            a:
              key === 'q3'
                ? `${t('faq.items.q3.a')} ${common('building')}${t('faq.items.q3.aTail')}`
                : t(`faq.items.${key}.a`)
          }))
        )}
      />

      {/* ======================= PAGE HEADER ======================= */}
      <header className="dhero">
        <div className="container">
          <span className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {t('hero.eyebrow')}
          </span>
          <h1>{t('hero.title')}</h1>
          <p className="lede">{t('hero.lede')}</p>
          <div className="meta-rail">
            <span className="mi">
              <Icon name="i-clock" />
              {t('hero.rail.duration.value')}
            </span>
            <i aria-hidden="true" />
            <span className="mi">
              <Icon name="i-globe" />
              {t('hero.rail.language')}
            </span>
            <i aria-hidden="true" />
            <span className="mi">
              <Icon name="i-user" />
              {t('hero.rail.who')}
            </span>
            <i aria-hidden="true" />
            <span className="mi">
              <Icon name="i-location" />
              {t('hero.rail.place.value')}
            </span>
          </div>
        </div>
      </header>

      {/* ======================= FORM + REASSURANCE ======================= */}
      <section className="sec sec--book" id="form">
        <div className="container">
          <div className="secmark reveal">
            <span className="n" aria-hidden="true">
              {t('book.mark.n')}
            </span>
            <span className="l">{t('book.mark.label')}</span>
            <span className="r">{t('book.mark.note')}</span>
          </div>

          <div className="book">
            <div className="formcard reveal">
              <DemoForm />
            </div>

            <aside className="rail" aria-label={t('book.railLabel')}>
              {/* 1. What happens next */}
              <section className="reveal">
                <div className="rhead">
                  <h2>{t('next.title')}</h2>
                  <span className="rk">{t('next.kicker')}</span>
                </div>
                <div className="steps">
                  {STEPS.map((key) => (
                    <div className="step" key={key}>
                      <span className="sn" aria-hidden="true">
                        {t(`next.steps.${key}.n`)}
                      </span>
                      <div>
                        <h3>{t(`next.steps.${key}.title`)}</h3>
                        <p>{t(`next.steps.${key}.body`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="sla">
                  <Icon name="i-clock" />
                  <span>{t('next.sla')}</span>
                </p>
              </section>

              {/* 2. What the demo covers */}
              <section className="reveal">
                <div className="rhead">
                  <h2>{t('agenda.title')}</h2>
                  <span className="rk">{t('agenda.kicker.value')}</span>
                </div>
                <div className="agenda">
                  {AGENDA_ROWS.map((row) => (
                    <div className="arow" key={row.key}>
                      <span className="amin">{t(`agenda.rows.${row.key}.time`)}</span>
                      <span className="aic" aria-hidden="true">
                        <Icon name={row.icon} />
                      </span>
                      <span>
                        <b>{t(`agenda.rows.${row.key}.title`)}</b>
                        <span className="d">{t(`agenda.rows.${row.key}.desc`)}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="afoot">
                  {t('agenda.foot')}
                  <span className="tot">{t('agenda.total.value')}</span>
                </p>
              </section>

              {/* 3. Scheduler. `site.schedulerUrl` is unset until the account
                  exists, so the honest preview is what ships — the form above
                  does the same job. No third-party script, ever. */}
              <section className="reveal">
                <div className="rhead">
                  <h2>{t('scheduler.title')}</h2>
                  <span className="rk">
                    {schedulerLive ? t('scheduler.kickerLive') : t('scheduler.kicker')}
                  </span>
                </div>

                {schedulerLive ? (
                  <div className="slot">
                    <div className="slot-pick">
                      <div className="sp-head">
                        <b>{t('scheduler.heading')}</b>
                        <span className="tz">{t('scheduler.tz.value')}</span>
                      </div>
                      <a
                        className="btn btn--secondary"
                        href={site.schedulerUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('scheduler.open')}
                        <Icon name="i-arrow-up-right" />
                      </a>
                    </div>
                    <p className="slot-note">
                      <Icon name="i-info" />
                      <span>{t('scheduler.openNote')}</span>
                    </p>
                  </div>
                ) : (
                  <div className="slot" role="img" aria-label={t('scheduler.ariaLabel')}>
                    <div className="slot-stamp">
                      {t('scheduler.stamp')}
                      <BuildingBadge label={common('building')} />
                    </div>
                    <div className="slot-pick" aria-hidden="true">
                      <div className="sp-head">
                        <b>{t('scheduler.heading')}</b>
                        <span className="tz">{t('scheduler.tz.value')}</span>
                      </div>
                      <div className="slot-week">
                        {SLOT_DAYS.map((day) => (
                          <span
                            className={day.state ? `sd ${day.state}` : 'sd'}
                            key={day.key}
                          >
                            <em>{t(`scheduler.days.${day.key}.name`)}</em>
                            <b>{t(`scheduler.days.${day.key}.date`)}</b>
                            <i />
                          </span>
                        ))}
                      </div>
                      <div className="slot-times">
                        {SLOT_TIMES.map((slot) => (
                          <span
                            className={slot.state ? `st ${slot.state}` : 'st'}
                            key={slot.key}
                          >
                            {t(`scheduler.times.${slot.key}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="slot-note">
                      <Icon name="i-info" />
                      <span>{t('scheduler.note')}</span>
                    </p>
                  </div>
                )}
              </section>
            </aside>
          </div>

          {/* Alternative route, not a second CTA: a phone number for the people
              who will not fill in forms. */}
          <section className="altcall reveal" aria-labelledby="callHead">
            <div className="ac-copy">
              <h2 id="callHead">{t('call.title')}</h2>
              <p>{t('call.body')}</p>
            </div>
            <div className="ac-mid">
              <span className="acl">{t('call.handyLabel')}</span>
              <ul className="ac-list">
                {HANDY.map((item) => (
                  <li key={item.key}>
                    <Icon name={item.icon} />
                    {t(`call.handy.${item.key}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ac-tel">
              {hasPhone ? (
                <a className="telrow" href={`tel:${site.phoneHref}`}>
                  <span className="ti" aria-hidden="true">
                    <Icon name="i-phone" />
                  </span>
                  <span>
                    <span className="tn">{site.phoneDisplay}</span>
                    <span className="tk">{t('call.hours')}</span>
                  </span>
                </a>
              ) : (
                <div className="telrow">
                  <span className="ti" aria-hidden="true">
                    <Icon name="i-phone" />
                  </span>
                  <span>
                    <span className="tn">{site.phoneDisplay}</span>
                    <span className="tk">{t('call.hours')}</span>
                  </span>
                </div>
              )}
              {!hasPhone && (
                <p className="telnote">
                  <BuildingBadge label={common('building')} />
                  <span>{t('call.note')}</span>
                </p>
              )}
            </div>
          </section>
        </div>
      </section>

      {/* ======================= WHAT WE OPEN ON SCREEN ======================= */}
      <section className="sec band" id="onscreen" aria-labelledby="onscreenH">
        <div className="container">
          <div className="editorial-head reveal">
            <span className="chapter-mark" aria-hidden="true">
              {t('onscreen.chapter')}
              <span className="of">{t('onscreen.chapterOf')}</span>
            </span>
            <h2 id="onscreenH">{t('onscreen.title')}</h2>
            <p className="aside">{t('onscreen.aside')}</p>
          </div>
        </div>

        <div className="container container--wide app-stage reveal">
          <div className="amb amb--toll" aria-hidden="true" />
          <div className="app" role="img" aria-label={t('onscreen.appLabel')}>
            <div className="app-bar">
              <div className="app-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="app-crumbs">
                <b>{t('onscreen.app.product.value')}</b>
                <Icon name="i-chevron" />
                {t('onscreen.app.section')}
                <Icon name="i-chevron" />
                <span>{t('onscreen.app.range')}</span>
              </div>
              <div className="app-bar-right">
                <span className="searchpill">
                  <Icon name="i-search" />
                  {t('onscreen.app.search')}
                  <kbd>{t('onscreen.app.kbd')}</kbd>
                </span>
                <span className="iconbtn">
                  <Icon name="i-bell" />
                  <span className="dot" />
                </span>
                <span className="avatar">{t('onscreen.app.avatar')}</span>
              </div>
            </div>

            <div className="app-body">
              <div className="app-rail" aria-hidden="true">
                <span className="ri">
                  <Icon name="i-grid" />
                </span>
                <span className="ri">
                  <Icon name="i-vehicle" />
                </span>
                <span className="ri is-on">
                  <Icon name="i-toll-gantry" />
                </span>
                <span className="ri">
                  <Icon name="i-receipt" />
                </span>
                <span className="spacer" />
                <span className="ri">
                  <Icon name="i-layers" />
                </span>
              </div>

              <div className="app-side" aria-hidden="true">
                <div className="grp">{t('onscreen.app.side.tolls')}</div>
                <span className="app-nav is-on">
                  <Icon name="i-toll-gantry" />
                  <span>{t('onscreen.app.side.toReconcile')}</span>
                  <span className="count">
                    {t('onscreen.app.side.toReconcileCount')}
                  </span>
                </span>
                <span className="app-nav">
                  <Icon name="i-check-circle" />
                  <span>{t('onscreen.app.side.reconciled')}</span>
                  <span className="count">
                    {t('onscreen.app.side.reconciledCount')}
                  </span>
                </span>
                <span className="app-nav">
                  <Icon name="i-alert" />
                  <span>{t('onscreen.app.side.disputed')}</span>
                  <span className="count">
                    {t('onscreen.app.side.disputedCount')}
                  </span>
                </span>
                <div className="grp">{t('onscreen.app.side.charging')}</div>
                <span className="app-nav">
                  <Icon name="i-receipt" />
                  <span>{t('onscreen.app.side.rentalCharges')}</span>
                </span>
                <span className="app-nav">
                  <Icon name="i-dollar" />
                  <span>{t('onscreen.app.side.billing')}</span>
                </span>
              </div>

              <div className="app-pane">
                <div className="pane-head">
                  <div>
                    <p className="pane-title">{t('onscreen.app.pane.title')}</p>
                    <div className="psub">{t('onscreen.app.pane.sub')}</div>
                  </div>
                  <div className="pane-tools" aria-hidden="true">
                    <span className="filter is-on">
                      <Icon name="i-filter" />
                      {t('onscreen.app.filters.autoexpreso')}
                    </span>
                    <span className="filter">
                      {t('onscreen.app.filters.sunpass')}
                    </span>
                    <span className="filter">
                      <Icon name="i-chevron-down" />
                      {t('onscreen.app.filters.week')}
                    </span>
                  </div>
                </div>

                <div className="kpis">
                  <div className="kpi">
                    <div className="klab">{t('onscreen.app.kpi.matched.label')}</div>
                    <div className="kval">{t('onscreen.app.kpi.matched.value')}</div>
                    <div className="spark-bars" aria-hidden="true">
                      {SPARK_BARS.map((height, index) => (
                        <i
                          key={height + '-' + index}
                          className={height === 100 ? 'is-hi' : undefined}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="kfoot">
                      <span className="chip chip--ok">
                        <span className="led" />
                        {t('onscreen.app.kpi.matched.chip')}
                      </span>
                    </div>
                  </div>

                  <div className="kpi">
                    <div className="klab">
                      {t('onscreen.app.kpi.recovered.label')}
                    </div>
                    <div className="kval">
                      {t('onscreen.app.kpi.recovered.value')}
                    </div>
                    <svg
                      className="spark"
                      viewBox="0 0 120 34"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <defs>
                        <linearGradient id="spkTB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(232,161,60,.34)" />
                          <stop offset="100%" stopColor="rgba(232,161,60,0)" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 28 L15 24 L30 26 L45 18 L60 20 L75 12 L90 15 L105 8 L120 5 L120 34 L0 34 Z"
                        fill="url(#spkTB)"
                      />
                      <path
                        d="M0 28 L15 24 L30 26 L45 18 L60 20 L75 12 L90 15 L105 8 L120 5"
                        fill="none"
                        stroke="#e8a13c"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="118" cy="5" r="2.6" fill="#f2c069" />
                    </svg>
                    <div className="kfoot">
                      <span className="chip chip--gold">
                        <Icon name="i-trend" />
                        {t('onscreen.app.kpi.recovered.delta.value')}
                      </span>
                      {t('onscreen.app.kpi.recovered.foot')}
                    </div>
                  </div>

                  <div className="kpi">
                    <div className="klab">{t('onscreen.app.kpi.unowned.label')}</div>
                    <div className="kval">{t('onscreen.app.kpi.unowned.value')}</div>
                    <div className="kfoot">
                      <span className="meter">
                        <span className="track">
                          <span
                            className="fill fill--warn"
                            style={{ width: '21%' }}
                          />
                        </span>
                        <b>{t('onscreen.app.kpi.unowned.pct')}</b>
                      </span>
                    </div>
                    <div className="kfoot">
                      <span className="chip chip--warn">
                        <span className="led" />
                        {t('onscreen.app.kpi.unowned.count')}{' '}
                        {t('onscreen.app.kpi.unowned.unit')}
                      </span>
                      {t('onscreen.app.kpi.unowned.foot')}
                    </div>
                  </div>
                </div>

                <div className="tbl">
                  <div className="tbl-scroll">
                    <table className="data">
                      <thead>
                        <tr>
                          <th scope="col">{t('onscreen.app.table.head.crossing')}</th>
                          <th scope="col" className="th-strong">
                            {t('onscreen.app.table.head.plaza.value')}
                          </th>
                          <th scope="col">{t('onscreen.app.table.head.plate')}</th>
                          <th scope="col" className="right">
                            {t('onscreen.app.table.head.amount')}
                          </th>
                          <th scope="col">{t('onscreen.app.table.head.driver')}</th>
                          <th scope="col">
                            {t('onscreen.app.table.head.confidence')}
                          </th>
                          <th scope="col">{t('onscreen.app.table.head.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TABLE_ROWS.map((row) => (
                          <tr key={row.key}>
                            <td>{t(`onscreen.app.table.rows.${row.key}.when.value`)}</td>
                            <td>{t(`onscreen.app.table.rows.${row.key}.plaza.value`)}</td>
                            <td>
                              <span className="plate">
                                {t(`onscreen.app.table.rows.${row.key}.plate`)}
                              </span>
                            </td>
                            <td className="right">
                              <span className="money">
                                {t(`onscreen.app.table.rows.${row.key}.amount`)}
                              </span>
                            </td>
                            <td>{t(`onscreen.app.table.rows.${row.key}.driver.value`)}</td>
                            <td>
                              <span className={`conf${row.confClass}`}>
                                <span className="bar">
                                  <i style={{ width: `${row.conf}%` }} />
                                </span>
                                <b>{t(`onscreen.app.table.rows.${row.key}.conf`)}</b>
                              </span>
                            </td>
                            <td>
                              <span className={`chip ${row.chip}`}>
                                <span className="led" />
                                {t(`onscreen.app.table.rows.${row.key}.status`)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tbl-foot">
                    {t('onscreen.app.table.foot.showing')}
                    <span className="r">
                      <span>{t('onscreen.app.table.foot.source')}</span>
                      <span>{common('sampleData')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <SampleDataNote>{a11y('sampleData')}</SampleDataNote>

          <div className="onscreen-legend reveal">
            {LEGEND.map((key) => (
              <div className={key === 'l2' ? 'osl is-live' : 'osl'} key={key}>
                <span className="oslk">
                  {t(`onscreen.legend.${key}.range`)} {t('onscreen.legend.unit')}
                </span>
                <b>
                  {t(`onscreen.legend.${key}.title`)}
                  {key === 'l2' && (
                    <span className="oslnow">{t('onscreen.legend.l2.now')}</span>
                  )}
                </b>
                <p>{t(`onscreen.legend.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= FAQ ======================= */}
      <section className="sec sec--tight" id="faq">
        <div className="container">
          <div className="editorial-head reveal">
            <span className="chapter-mark" aria-hidden="true">
              {t('faq.chapter')}
              <span className="of">{t('faq.chapterOf')}</span>
            </span>
            <h2>{t('faq.title')}</h2>
            <p className="aside">{t('faq.aside')}</p>
          </div>

          <div className="faq reveal">
            {FAQ_ITEMS.map((key) => (
              <details key={key}>
                <summary>
                  <span className="qn">{t(`faq.items.${key}.n`)}</span>
                  <span>{t(`faq.items.${key}.q`)}</span>
                  <span className="qi" aria-hidden="true">
                    <Icon name="i-chevron-down" />
                  </span>
                </summary>
                <div className="ans">
                  <p>
                    {t(`faq.items.${key}.a`)}
                    {key === 'q3' && (
                      <>
                        {' '}
                        <BuildingBadge label={common('building')} />
                        {t('faq.items.q3.aTail')}
                      </>
                    )}
                  </p>
                  {key === 'q5' && (
                    <Link className="link-arrow" href={routes.tollBridge}>
                      {t('faq.items.q5.link')}
                      <Icon name="i-arrow-right" />
                    </Link>
                  )}
                </div>
              </details>
            ))}

            <div className="faqend">
              <div>
                <h3>{t('faq.end.title')}</h3>
                <p>{t('faq.end.body')}</p>
              </div>
              <a className="link-arrow" href="#form">
                {t('faq.end.cta')}
                <Icon name="i-arrow-right" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
