import { Fragment, type CSSProperties } from 'react';
import { useMessages, useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { routes, site } from '@/lib/site';
import { Icon, type IconName } from '@/components/Icons';
import {
  ArrowLink,
  ButtonAnchor,
  ButtonLink,
  Eyebrow,
  SampleDataNote
} from '@/components/ui';

import '@/styles/pages/home.css';

export async function generateMetadata({
  params
}: {
  params: { locale: Locale };
}) {
  return buildMetadata({
    locale: params.locale,
    path: routes.home,
    namespace: 'home'
  });
}

/* -------------------------------------------------------------------------- */
/* Catalog shapes. Lists live as arrays in the JSON and are read through        */
/* `useMessages()` — `t()` cannot map an array.                                 */
/* -------------------------------------------------------------------------- */

type Labelled = { value: string };

type HomeMessages = {
  hero: {
    spec: { label: string; value: string; live?: string }[];
    app: {
      sideNav: { items: { value: string; count?: string }[] };
      pane: { filters: Labelled[] };
      table: {
        plates: {
          plate: string;
          vehicle: string;
          meta: string;
          status: string;
          location: string;
          score: string;
          next: string;
        }[];
      };
    };
    callouts: { label: string; body: string }[];
  };
  trust: { now: Labelled[]; soon: Labelled[] };
  router: {
    doors: {
      idx: string;
      badge: string;
      title: string;
      sub: string;
      ledger: { label: string; value: string }[];
      total: { label: string; value: string; suffix: string };
      verb: string;
      verbSub: string;
      link: string;
    }[];
  };
  spine: {
    chain: { value: string; sub: string }[];
    log: {
      events: { time: string; tag: string; text: string; conf?: string }[];
    };
    lanes: { product: string }[];
  };
  diff: {
    score: { rows: { title: string; sub: string; value: string }[] };
    list: { value: string; body: string }[];
  };
  cta: { list: string[] };
};

/* -------------------------------------------------------------------------- */
/* Structure, not copy. Icon ids, tone classes and the "not written by this     */
/* product" masks are markup decisions, so they stay out of the catalogs where  */
/* they would otherwise flatten into untranslatable keys.                       */
/* -------------------------------------------------------------------------- */

const RAIL_ICONS: IconName[] = [
  'i-grid',
  'i-vehicle',
  'i-calendar',
  'i-users',
  'i-receipt'
];

const SIDE_NAV_ICONS: IconName[] = [
  'i-gauge',
  'i-route',
  'i-wrench',
  'i-camera',
  'i-toll-gantry',
  'i-phone',
  'i-dollar'
];
/** Index at which the sidebar switches from the Operations group to Revenue. */
const SIDE_NAV_REVENUE_FROM = 4;

const FILTER_ICONS: IconName[] = ['i-filter', 'i-location', 'i-chevron-down'];

/** Seven bars of the 30-day toll sparkline, as percentage heights. */
const TOLL_BARS = [38, 54, 44, 68, 58, 80, 100];

const ROW_STYLES: {
  status: string;
  fill: string;
  next: string;
  nextIcon: IconName;
}[] = [
  { status: 'brand', fill: 'fill fill--ok', next: 'neutral', nextIcon: 'i-clock' },
  { status: 'warn', fill: 'fill fill--warn', next: 'neutral', nextIcon: 'i-clock' },
  { status: 'ok', fill: 'fill fill--ok', next: 'brand', nextIcon: 'i-plus' },
  { status: 'neutral', fill: 'fill', next: 'neutral', nextIcon: 'i-clock' },
  {
    status: 'danger',
    fill: 'fill fill--danger',
    next: 'neutral',
    nextIcon: 'i-wrench'
  }
];

/* Index-aligned with `home.trust.now`. The four toll networks share one icon
   on purpose — they are the same kind of integration, and giving each a
   different glyph read as four different capabilities. */
const TRUST_NOW_ICONS: IconName[] = [
  'i-toll-gantry',
  'i-toll-gantry',
  'i-toll-gantry',
  'i-toll-gantry',
  'i-road',
  'i-dollar',
  'i-sms'
];
const TRUST_SOON_ICONS: IconName[] = ['i-gauge', 'i-bolt'];

const DOORS: {
  tone: string;
  icon: IconName;
  href: string;
  linkTone?: 'gold' | 'teal';
}[] = [
  {
    tone: 'toll',
    icon: 'i-toll-gantry',
    href: routes.tollBridge,
    linkTone: 'gold'
  },
  { tone: 'voz', icon: 'i-waveform', href: routes.vozAi, linkTone: 'teal' },
  { tone: 'rfm', icon: 'i-vehicle', href: routes.rideFleetManager }
];

const CHAIN_ICONS: IconName[] = [
  'i-building',
  'i-users',
  'i-calendar',
  'i-vehicle',
  'i-clipboard',
  'i-camera',
  'i-dollar'
];

/** Which product wrote each log line — drives the `.tag--*` colour only. */
const LOG_TAGS = ['voz', 'rfm', 'rfm', 'toll', 'rfm', 'toll', 'voz'];

/** `off` indexes the entity chain: records this product does NOT write to. */
const LANES: { tone: string; icon: IconName; off: number[] }[] = [
  { tone: 'rfm', icon: 'i-vehicle', off: [] },
  { tone: 'toll', icon: 'i-toll-gantry', off: [0, 4, 5] },
  { tone: 'voz', icon: 'i-waveform', off: [0, 4, 5] }
];

const SCORE_ICONS: IconName[] = [
  'i-check-circle',
  'i-sparkle',
  'i-wrench',
  'i-gauge',
  'i-camera',
  'i-clipboard'
];
const SCORE_PTS = ['base', 'zero', 'zero', 'down', 'down', 'down'];

const DIFF_ICONS: IconName[] = [
  'i-route',
  'i-sparkle',
  'i-gauge',
  'i-camera',
  'i-bolt',
  'i-globe'
];
/* No Building badge survives in this list. Planner Copilot, the damage-triage
   claim and telematics all shipped on 2026-08-17, so the three rows that
   carried one (title index 1, body indices 3 and 4) lost it, and the split
   `body` + `bodyTail` shape those two body rows needed — the badge used to sit
   between the halves — collapsed back into a single `body` string. */

/** The ring arc is driven by `--pct` on `.ring`, exactly as the CSS expects. */
const RING_88 = { '--pct': 88 } as CSSProperties;
/** Trailing "/mo" inside a ledger total, at the size the static page used. */
const TOTAL_SUFFIX: CSSProperties = { fontSize: '.55em', letterSpacing: 0 };

/* -------------------------------------------------------------------------- */

export default function HomePage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('home');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');
  const m = (useMessages() as unknown as { home: HomeMessages }).home;

  return (
    <>
      {/* ============================== HERO ============================= */}
      <section className="hero">
        <div className="container container--wide hero-copy">
          <span className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {t('hero.eyebrow')}
          </span>
          <h1 className="display balance">
            {t('hero.titleLead')}{' '}
            <span className="grad">{t('hero.titleGrad')}</span>
          </h1>
          <div className="hero-base">
            <div>
              <p className="lede">{t('hero.lede')}</p>
              <div className="btn-row">
                <ButtonLink href={routes.demo} size="lg" icon="i-arrow-right">
                  {t('hero.ctaPrimary')}
                </ButtonLink>
                <ButtonAnchor href="#router" size="lg">
                  {t('hero.ctaSecondary')}
                </ButtonAnchor>
              </div>
            </div>
            <dl className="hero-spec">
              {m.hero.spec.map((spec) => (
                <div className="hspec" key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>
                    {spec.value}
                    {spec.live ? (
                      <span className="live">
                        <i aria-hidden="true" />
                        {spec.live}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="container--wide container hero-stage app-stage reveal">
          <div className="amb amb--rfm" aria-hidden="true" />

          {/* The whole dashboard is one decorative rendering: `role="img"` with
              a single description, so a screen reader is not walked through a
              mock of somebody else's screen cell by cell. */}
          <div className="app" role="img" aria-label={t('hero.app.ariaLabel')}>
            <div className="app-bar">
              <div className="app-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="app-crumbs">
                <b>{t('hero.app.crumbs.product')}</b>
                <Icon name="i-chevron" />
                <span>{t('hero.app.crumbs.section')}</span>
                <Icon name="i-chevron" />
                <span>{t('terms.crumbLocation.value')}</span>
              </div>
              <div className="app-bar-right">
                <span className="searchpill">
                  <Icon name="i-search" />
                  <span>{t('hero.app.search')}</span>
                  <kbd>{t('hero.app.kbd')}</kbd>
                </span>
                <span className="iconbtn">
                  <Icon name="i-bell" />
                  <span className="dot" />
                </span>
                <span className="avatar">{t('hero.app.avatar')}</span>
              </div>
            </div>

            <div className="app-body">
              <div className="app-rail" aria-hidden="true">
                {RAIL_ICONS.map((icon, i) => (
                  <span className={i === 0 ? 'ri is-on' : 'ri'} key={icon}>
                    <Icon name={icon} />
                  </span>
                ))}
                <span className="spacer" />
                <span className="ri">
                  <Icon name="i-layers" />
                </span>
              </div>

              <div className="app-side" aria-hidden="true">
                {m.hero.app.sideNav.items.map((item, i) => (
                  <Fragment key={item.value}>
                    {i === 0 ? (
                      <div className="grp">{t('hero.app.sideNav.groupOps')}</div>
                    ) : null}
                    {i === SIDE_NAV_REVENUE_FROM ? (
                      <div className="grp">
                        {t('hero.app.sideNav.groupRevenue')}
                      </div>
                    ) : null}
                    <span className={i === 0 ? 'app-nav is-on' : 'app-nav'}>
                      <Icon name={SIDE_NAV_ICONS[i]} />
                      <span>{item.value}</span>
                      {item.count ? (
                        <span className="count">{item.count}</span>
                      ) : null}
                    </span>
                  </Fragment>
                ))}
              </div>

              <div className="app-pane">
                <div className="pane-head">
                  <div>
                    <p className="pane-title">{t('hero.app.pane.title')}</p>
                    <div className="psub">{t('hero.app.pane.sub')}</div>
                  </div>
                  <div className="pane-tools" aria-hidden="true">
                    {m.hero.app.pane.filters.map((filter, i) => (
                      <span
                        className={i === 0 ? 'filter is-on' : 'filter'}
                        key={filter.value}
                      >
                        <Icon name={FILTER_ICONS[i]} />
                        <span>{filter.value}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="kpis">
                  <div className="kpi kpi--ring">
                    <div className="ring" style={RING_88}>
                      <svg
                        viewBox="0 0 88 88"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <circle className="track" cx="44" cy="44" r="38" />
                        <circle className="prog" cx="44" cy="44" r="38" />
                      </svg>
                      <div className="rcenter">
                        <div>
                          <div className="rnum">
                            {t('hero.app.kpi.ringValue')}
                          </div>
                          <div className="rsuf">
                            {t('terms.scoreSuffix.value')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="klab">{t('terms.turnReady.value')}</div>
                      <div className="kfoot">
                        <span className="chip chip--ok">
                          <span className="led" aria-hidden="true" />
                          {t('hero.app.kpi.readyCount')}{' '}
                          {t('hero.app.kpi.readyLabel')}
                        </span>
                      </div>
                      <div className="kfoot">
                        <span className="chip chip--warn">
                          <span className="led" aria-hidden="true" />
                          {t('hero.app.kpi.blockedCount')}{' '}
                          {t('hero.app.kpi.blockedLabel')}
                        </span>
                      </div>
                      <p className="kpi-note">{t('hero.app.kpi.note')}</p>
                    </div>
                  </div>

                  <div className="kpi">
                    <div className="klab">{t('hero.app.kpi.util.label')}</div>
                    <div className="kval">{t('hero.app.kpi.util.value')}</div>
                    <svg
                      className="spark"
                      viewBox="0 0 120 34"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <defs>
                        <linearGradient id="spkG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(127,79,240,.30)" />
                          <stop offset="100%" stopColor="rgba(127,79,240,0)" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 27 L15 23 L30 25 L45 16 L60 19 L75 11 L90 14 L105 7 L120 4 L120 34 L0 34 Z"
                        fill="url(#spkG)"
                      />
                      <path
                        d="M0 27 L15 23 L30 25 L45 16 L60 19 L75 11 L90 14 L105 7 L120 4"
                        fill="none"
                        stroke="#7f4ff0"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="118" cy="4" r="2.6" fill="#6a35e0" />
                    </svg>
                    <div className="kfoot">
                      <span className="chip chip--ok">
                        <Icon name="i-trend" />
                        {t('terms.utilizationDelta.value')}
                      </span>
                      <span>{t('hero.app.kpi.util.foot')}</span>
                    </div>
                  </div>

                  <div className="kpi">
                    <div className="klab">{t('hero.app.kpi.tolls.label')}</div>
                    <div className="kval">{t('hero.app.kpi.tolls.value')}</div>
                    <div className="spark-bars" aria-hidden="true">
                      {TOLL_BARS.map((h, i) => (
                        <i
                          key={i}
                          className={h === 100 ? 'is-hi' : undefined}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="kfoot">
                      <span className="chip chip--neutral">
                        {t('hero.app.kpi.tolls.crossings')}{' '}
                        {t('hero.app.kpi.tolls.crossingsLabel')}
                      </span>
                      <span>{t('hero.app.kpi.tolls.review')}</span>
                    </div>
                  </div>
                </div>

                <div className="tbl">
                  <div className="tbl-scroll">
                    <table className="data">
                      <thead>
                        <tr>
                          <th scope="col">{t('hero.app.table.cols.plate')}</th>
                          <th scope="col" className="th-strong">
                            {t('hero.app.table.cols.vehicle')}
                          </th>
                          <th scope="col">{t('hero.app.table.cols.status')}</th>
                          <th scope="col">
                            {t('hero.app.table.cols.location')}
                          </th>
                          <th scope="col">{t('terms.turnReady.value')}</th>
                          <th scope="col">{t('hero.app.table.cols.next')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.hero.app.table.plates.map((row, i) => (
                          <tr key={row.plate}>
                            <td>
                              <span className="plate">{row.plate}</span>
                            </td>
                            <td>
                              <div className="cell-veh">
                                <span className="thumb">
                                  <Icon name="i-vehicle" />
                                </span>
                                <span>
                                  <b>{row.vehicle}</b>
                                  <small>{row.meta}</small>
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`chip chip--${ROW_STYLES[i].status}`}
                              >
                                <span className="led" aria-hidden="true" />
                                {row.status}
                              </span>
                            </td>
                            <td>{row.location}</td>
                            <td>
                              <span className="meter">
                                <span className="track">
                                  <span
                                    className={ROW_STYLES[i].fill}
                                    style={{ width: `${row.score}%` }}
                                  />
                                </span>
                                <b>{row.score}</b>
                              </span>
                            </td>
                            <td>
                              <span
                                className={`chip chip--${ROW_STYLES[i].next}`}
                              >
                                <Icon name={ROW_STYLES[i].nextIcon} />
                                {row.next}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tbl-foot">
                    <span>{t('hero.app.table.footCount')}</span>
                    <span className="r">
                      <span>{t('hero.app.table.footUpdated')}</span>
                      <span>{t('terms.markets.value')}</span>
                      <span>{common('sampleData')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {m.hero.callouts.map((callout, i) => (
            <div
              className={
                i === 0
                  ? 'callout callout--left co-a'
                  : 'callout callout--right co-b'
              }
              key={callout.label}
            >
              <span className="cl">{callout.label}</span>
              <span className="cv">{callout.body}</span>
            </div>
          ))}

          <SampleDataNote>{a11y('sampleData')}</SampleDataNote>
        </div>
      </section>

      {/* ===================== TRUST / INTEGRATIONS ====================== */}
      <div className="trust">
        <div className="container trust-grid">
          <div>
            <p className="tlab">{t('trust.nowLabel')}</p>
            <div className="integration-strip">
              {m.trust.now.map((item, i) => (
                <span className="integration" key={item.value}>
                  <Icon name={TRUST_NOW_ICONS[i]} />
                  {item.value}
                </span>
              ))}
            </div>
          </div>
          <div className="trust-div" aria-hidden="true" />
          <div className="trust-soon">
            {/* Telematics left the "soon" state on 2026-08-17 and no longer
                carries a Building badge. The two groups stay split because
                they are different KINDS of integration (money/voice vs.
                vehicle data), not because one of them is unfinished — the
                .trust-soon class name is now historical. */}
            <p className="tlab">{t('trust.soonLabel')}</p>
            <div className="integration-strip">
              {m.trust.soon.map((item, i) => (
                <span className="integration" key={item.value}>
                  <Icon name={TRUST_SOON_ICONS[i]} />
                  {item.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================== PAIN ROUTER ========================== */}
      <section className="sec" id="router">
        <div className="container">
          <div className="editorial-head">
            <span className="chapter-mark">
              {t('router.chapter.num')}
              <span className="of">{t('router.chapter.label')}</span>
            </span>
            <h2 className="balance">{t('router.title')}</h2>
            <p className="aside">{t('router.aside')}</p>
          </div>

          <div className="router">
            {m.router.doors.map((door, i) => (
              <article
                className={`door door--${DOORS[i].tone} reveal reveal-${i + 1}`}
                key={door.badge}
              >
                <div className="door-top">
                  <span className="idx">{door.idx}</span>
                  <span className={`pbadge pbadge--${DOORS[i].tone}`}>
                    <span className="pi">
                      <Icon name={DOORS[i].icon} />
                    </span>
                    {door.badge}
                  </span>
                </div>
                <div>
                  <h3 className="t-h3">{door.title}</h3>
                  <p className="dsub">{door.sub}</p>
                </div>
                <div className="ledger">
                  {door.ledger.map((line) => (
                    <div className="lrow" key={line.label}>
                      <span>{line.label}</span>
                      <span className="v">{line.value}</span>
                    </div>
                  ))}
                  <div className="lrow lrow--total">
                    <span>{door.total.label}</span>
                    <span className="v">
                      {door.total.value}
                      <span style={TOTAL_SUFFIX}>{door.total.suffix}</span>
                    </span>
                  </div>
                </div>
                {/* The arithmetic above is an illustration built from the
                    reader's own assumptions, never a measured customer result. */}
                <p className="ledger-note">
                  <Icon name="i-info" />
                  <span>{t('router.ledgerNote')}</span>
                </p>
                <div className="door-foot">
                  <p className="verb">
                    {door.verb}
                    <small>{door.verbSub}</small>
                  </p>
                  <ArrowLink href={DOORS[i].href} tone={DOORS[i].linkTone}>
                    {door.link}
                  </ArrowLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== INK BAND — THE SPINE ====================== */}
      <section className="sec band--ink" id="spine">
        <div
          className="glow glow--brand"
          style={{ width: 760, height: 520, right: -160, top: -180 }}
          aria-hidden="true"
        />
        <div
          className="glow glow--gold"
          style={{ width: 520, height: 420, left: -140, bottom: -160 }}
          aria-hidden="true"
        />
        <div className="container--wide container">
          <div className="editorial-head">
            <span className="chapter-mark">
              {t('spine.chapter.num')}
              <span className="of">{t('spine.chapter.label')}</span>
            </span>
            <h2 className="balance">{t('spine.title')}</h2>
            <p className="aside">{t('spine.aside')}</p>
          </div>

          <div className="chain">
            {m.spine.chain.map((node, i) => (
              <div className="node" key={node.value}>
                <span className="nic">
                  <Icon name={CHAIN_ICONS[i]} />
                </span>
                <b>{node.value}</b>
                <span>{node.sub}</span>
              </div>
            ))}
          </div>

          <div className="spine-grid">
            <div className="log reveal">
              <div className="log-head">
                <b>{t('spine.log.code')}</b>
                <span className="lh-sub">{t('spine.log.sub')}</span>
                <span className="live">
                  <span className="pulse" aria-hidden="true" />
                  {t('spine.log.live')}
                </span>
              </div>
              <div className="log-body">
                {m.spine.log.events.map((event, i) => (
                  <div className="evt" key={event.time}>
                    <span className="tm">{event.time}</span>
                    <span className="tx">
                      <span className={`tag tag--${LOG_TAGS[i]}`}>
                        {event.tag}
                      </span>
                      {event.text}
                      {event.conf ? <b> {event.conf}</b> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="lanes">
                {m.spine.lanes.map((lane, i) => (
                  <div className="lane" key={lane.product}>
                    <div className="lane-top">
                      <span className={`pbadge pbadge--${LANES[i].tone}`}>
                        <span className="pi">
                          <Icon name={LANES[i].icon} />
                        </span>
                        {lane.product}
                      </span>
                      <span className="writes">{t('spine.writes')}</span>
                    </div>
                    <div className="lane-chips">
                      {m.spine.chain.map((entity, j) => (
                        <span
                          className={
                            LANES[i].off.includes(j) ? 'ent ent--off' : 'ent'
                          }
                          key={entity.value}
                        >
                          {entity.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SampleDataNote>{a11y('sampleData')}</SampleDataNote>

          <div className="toggle-line">
            <Icon name="i-bolt" />
            <p>
              <b>{t('spine.toggle.strong')}</b> {t('spine.toggle.rest')}
            </p>
          </div>
        </div>
      </section>

      {/* ========================== SHOWCASE =============================
          Framed from the app origin, never copied here: the chapter copy
          comes from the same file that feeds the in-product training, so a
          copy would drift the day someone corrects a training line.

          Two things this depends on and that break silently if changed:
          the origin must stay in the middleware's `frame-src`, and the
          <iframe> needs its title (axe treats a nameless frame as a WCAG
          failure, so the audit would catch that one).

          Below 900px the frame collapses to a single column and is not
          worth reading, so the CSS swaps it for a link to the full page
          rather than shipping a squashed embed. */}
      <section className="sec sec--alt" id="showcase">
        <div className="container">
          <div className="sec-head">
            <Eyebrow>{t('showcase.eyebrow')}</Eyebrow>
            <h2 className="balance">{t('showcase.title')}</h2>
            <p className="lede">{t('showcase.lede')}</p>
          </div>

          {/* `?lang` is the only parameter the showcase accepts, and it
              defaults to English — without this, Spanish visitors got English
              chapter narration. There is no height, autoplay or start-chapter
              param, so do not invent one. */}
          <div className="showcase-frame" style={{ marginTop: 'var(--sp-8)' }}>
            <iframe
              src={`${site.showcaseUrl}?lang=${params.locale}`}
              title={t('showcase.frameTitle')}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <p className="showcase-small">
            {t('showcase.smallScreen.body')}{' '}
            <a
              href={`${site.showcaseUrl}?lang=${params.locale}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('showcase.smallScreen.cta')}
            </a>
          </p>

          <SampleDataNote>{t('showcase.note')}</SampleDataNote>
        </div>
      </section>

      {/* ======================= DIFFERENTIATORS ========================= */}
      <section className="sec" id="diff">
        <div className="container">
          <div className="editorial-head">
            <span className="chapter-mark">
              {t('diff.chapter.num')}
              <span className="of">{t('diff.chapter.label')}</span>
            </span>
            <h2 className="balance">{t('diff.title')}</h2>
            <p className="aside">{t('diff.aside')}</p>
          </div>

          <div className="diff-grid">
            <div className="score reveal">
              <div className="score-head">
                <div className="ring" style={RING_88}>
                  <svg viewBox="0 0 88 88" aria-hidden="true" focusable="false">
                    <circle className="track" cx="44" cy="44" r="38" />
                    <circle className="prog" cx="44" cy="44" r="38" />
                  </svg>
                  <div className="rcenter">
                    <div>
                      <div className="rnum">{t('diff.score.ringValue')}</div>
                      <div className="rsuf">{t('terms.scoreSuffix.value')}</div>
                    </div>
                  </div>
                </div>
                <div className="sh-t">
                  <h3>{t('diff.score.title')}</h3>
                  <p className="sh-sub">
                    <span className="plate">{t('diff.score.plate')}</span>{' '}
                    {t('diff.score.sub')}
                  </p>
                </div>
              </div>
              <div className="srows">
                {m.diff.score.rows.map((row, i) => (
                  <div className="srow" key={row.title}>
                    <span className="sic">
                      <Icon name={SCORE_ICONS[i]} />
                    </span>
                    <span>
                      <b>{row.title}</b>
                      <small>{row.sub}</small>
                    </span>
                    <span className={`pts pts--${SCORE_PTS[i]}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="score-foot">
                <Icon name="i-shield" />
                <span>{t('diff.score.foot')}</span>
                <span className="score-total">
                  <span className="st-n">{t('diff.score.totalValue')}</span>
                  <span className="st-l">{t('terms.turnReady.value')}</span>
                </span>
              </div>
            </div>

            <ul className="flist diff-list" style={{ marginTop: 0 }}>
              {m.diff.list.map((item, i) => (
                <li key={item.value}>
                  <span className="fi">
                    <Icon name={DIFF_ICONS[i]} />
                  </span>
                  <span>
                    <b>{item.value}</b>
                    <span className="d">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <SampleDataNote>{a11y('sampleData')}</SampleDataNote>
        </div>
      </section>

      {/* The founding-partner invitation used to sit here as chapter 04. It was
          removed on 2026-08-17 — the cohort is no longer being recruited, so a
          chapter asking for three to five operators was selling something that
          is not on offer. It was the last numbered chapter, so 01–03 still run
          without a gap. Its markup owned .partner-grid / .partner-aside /
          .partner-terms / .pterm / .slots / .slot-note and the
          .partner-invite--flush variant; all of those went with it. The plain
          .partner-invite card stays in components.css — Toll Bridge, Valet and
          Ride Fleet Manager still use it. */}

      {/* ============================== CTA ============================== */}
      <section className="sec sec--tight sec--cta">
        <div className="container">
          <div className="cta-band cta-band--duo">
            <div>
              <h2 className="balance">{t('cta.title')}</h2>
              <p>{t('cta.body')}</p>
            </div>
            <div className="cta-act">
              <div className="btn-row">
                <ButtonLink href={routes.demo} size="lg" icon="i-arrow-right">
                  {t('cta.primary')}
                </ButtonLink>
                <ButtonLink href={routes.tollBridge} tone="secondary" size="lg">
                  {t('cta.secondary')}
                </ButtonLink>
              </div>
              <div className="cta-list">
                {m.cta.list.map((line) => (
                  <span key={line}>
                    <Icon name="i-check" />
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
