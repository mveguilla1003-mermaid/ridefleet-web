import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Link, type Locale } from '@/i18n/routing';
import { routes } from '@/lib/site';
import {
  buildMetadata,
  breadcrumbSchema,
  faqSchema,
  softwareSchema
} from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Icon, type IconName } from '@/components/Icons';
import {
  ArrowLink,
  BuildingBadge,
  ButtonLink,
  Chip,
  SampleDataNote,
  Section
} from '@/components/ui';


import '@/styles/pages/ride-fleet-manager.css';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}) {
  return buildMetadata({
    locale: params.locale as Locale,
    path: routes.rideFleetManager,
    namespace: 'rideFleetManager'
  });
}

/* ----------------------------------------------------------------- data ---
   Everything below is presentation, not copy: icon ids, chip tones and the
   "this claim is unshipped" flags. Every visible string comes from the
   `rideFleetManager` namespace. */

const RAIL_ICONS: IconName[] = [
  'i-grid',
  'i-vehicle',
  'i-calendar',
  'i-users',
  'i-receipt'
];

const OPS_NAV_ICONS: IconName[] = [
  'i-gauge',
  'i-calendar',
  'i-key',
  'i-camera'
];
const MONEY_NAV_ICONS: IconName[] = ['i-toll-gantry', 'i-receipt', 'i-shield'];

type ChipTone = 'ok' | 'brand' | 'warn' | 'danger' | 'neutral';

const BOARD_ROWS: { icon: IconName; tone: ChipTone; fill: string }[] = [
  { icon: 'i-key', tone: 'ok', fill: 'fill fill--ok' },
  { icon: 'i-clock', tone: 'brand', fill: 'fill' },
  { icon: 'i-refresh', tone: 'warn', fill: 'fill fill--warn' },
  { icon: 'i-camera', tone: 'danger', fill: 'fill fill--danger' },
  { icon: 'i-wrench', tone: 'ok', fill: 'fill fill--ok' },
  { icon: 'i-gauge', tone: 'neutral', fill: 'fill fill--warn' }
];

const INTEGRATION_ICONS: IconName[] = [
  'i-toll-gantry',
  'i-toll-gantry',
  'i-dollar',
  'i-route',
  'i-bolt',
  'i-sms'
];

const RENTAL_FEATURE_ICONS: IconName[] = ['i-user', 'i-lock', 'i-chart'];
const SHARING_FEATURE_ICONS: IconName[] = [
  'i-building',
  'i-location',
  'i-dollar'
];
const LOANER_FEATURE_ICONS: IconName[] = [
  'i-wrench',
  'i-clipboard',
  'i-receipt'
];
const LOANER_ROW_TONES: ChipTone[] = ['warn', 'brand', 'ok'];

const STATION_ICONS: IconName[] = [
  'i-calendar',
  'i-key',
  'i-camera',
  'i-toll-gantry',
  'i-receipt',
  'i-check-circle'
];

const SPINE_DETAIL_ICONS: IconName[] = ['i-clock', 'i-link', 'i-refresh'];

/** Four capability rows × three features. `building` mirrors the static page. */
const CAP_ROWS: { features: { icon: IconName; building?: boolean }[] }[] = [
  {
    features: [
      { icon: 'i-search' },
      { icon: 'i-user' },
      { icon: 'i-key', building: true }
    ]
  },
  {
    features: [{ icon: 'i-grid' }, { icon: 'i-camera' }, { icon: 'i-clipboard' }]
  },
  {
    features: [
      { icon: 'i-gauge' },
      { icon: 'i-route' },
      { icon: 'i-bolt', building: true }
    ]
  },
  {
    features: [
      { icon: 'i-dollar' },
      { icon: 'i-toll-gantry' },
      { icon: 'i-shield', building: true }
    ]
  }
];

/** Which comparison rows carry a sub-label and which carry a Building badge. */
const COMPARE_ROWS: { sub?: boolean; badge?: boolean }[] = [
  { sub: true },
  { sub: true },
  { sub: true },
  { badge: true },
  { badge: true },
  { sub: true },
  { badge: true },
  {}
];

const MODULE_BADGES: { className: string; icon: IconName; on: boolean }[] = [
  { className: 'pbadge pbadge--rfm', icon: 'i-vehicle', on: true },
  { className: 'pbadge pbadge--toll', icon: 'i-toll-gantry', on: true },
  { className: 'pbadge pbadge--voz', icon: 'i-waveform', on: false }
];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const pad2 = (n: number) => String(n).padStart(2, '0');

export default function RideFleetManagerPage({
  params
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale as Locale);

  const t = useTranslations('rideFleetManager');
  const tCommon = useTranslations('common');
  const tA11y = useTranslations('a11y');
  const tNav = useTranslations('nav');

  /** Tag handlers for the rich strings the catalog carries. */
  const rich = {
    b: (chunks: ReactNode) => <b>{chunks}</b>,
    em: (chunks: ReactNode) => <em>{chunks}</em>,
    grad: (chunks: ReactNode) => <span className="grad">{chunks}</span>
  };

  const faqItems = range(6).map((i) => ({
    q: t(`faq.items.${i}.q`),
    a: t(`faq.items.${i}.a`)
  }));

  return (
    <>
      <JsonLd
        data={softwareSchema({
          locale: params.locale as Locale,
          name: t('hero.badge'),
          description: t('meta.description'),
          path: routes.rideFleetManager
        })}
      />
      <JsonLd
        data={breadcrumbSchema(params.locale as Locale, [
          { name: tNav('home'), path: routes.home },
          { name: t('hero.badge'), path: routes.rideFleetManager }
        ])}
      />
      <JsonLd data={faqSchema(faqItems)} />


      {/* ========================= HERO ========================= */}
      <section className="hero sec sec--tight" id="top">
        <div className="hero-bg" aria-hidden="true">
          <span className="grid" />
          <span className="glow g1" />
          <span className="glow g2" />
        </div>
        <div className="container hero-in">
          <div className="hero-head">
            <span className="pbadge pbadge--rfm">
              <span className="pi">
                <Icon name="i-vehicle" />
              </span>{' '}
              {t('hero.badge')}
            </span>
            <h1 className="display">{t.rich('hero.title', rich)}</h1>
          </div>

          <div className="hero-copy">
            <div>
              <p className="lede">{t('hero.lede')}</p>
              <div className="btn-row">
                <ButtonLink
                  href={routes.demo}
                  tone="primary"
                  size="lg"
                  icon="i-arrow-right"
                >
                  {t('hero.primary')}
                </ButtonLink>
                <a className="btn btn--secondary btn--lg" href="#columna">
                  {t('hero.secondary')}
                </a>
              </div>
              <p className="hero-note">
                {range(3).map((i) => (
                  <span key={i}>
                    <Icon name="i-check" />
                    {t(`hero.notes.${i}`)}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <ul className="hero-index">
                {range(3).map((i) => (
                  <li key={i}>
                    <span className="ix">{pad2(i + 1)}</span>
                    <span>{t.rich(`hero.index.${i}`, rich)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---- product surface: fleet board ---- */}
          <div className="stage reveal">
            <span className="amb" aria-hidden="true" />
            <div className="app" role="img" aria-label={t('board.ariaLabel')}>
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="app-crumbs">
                  <b>{t('board.crumbs.product')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('board.crumbs.section')}</span>
                  <Icon name="i-chevron" />
                  <span>{t('board.crumbs.place.value')}</span>
                </span>
                <span className="app-bar-right">
                  <span className="searchpill">
                    <Icon name="i-search" />
                    <span>{t('board.search.label')}</span>
                    <kbd>{t('board.search.code')}</kbd>
                  </span>
                  <span className="iconbtn">
                    <Icon name="i-bell" />
                    <span className="dot" />
                  </span>
                  <span className="avatar">{t('board.avatar')}</span>
                </span>
              </div>

              <div className="app-body">
                <aside className="app-rail" aria-hidden="true">
                  {RAIL_ICONS.map((icon, i) => (
                    <span className={i === 0 ? 'ri is-on' : 'ri'} key={icon + i}>
                      <Icon name={icon} />
                    </span>
                  ))}
                  <span className="spacer" />
                  <span className="ri">
                    <Icon name="i-chart" />
                  </span>
                </aside>

                <aside className="app-side" aria-hidden="true">
                  <span className="grp">{t('board.side.ops.label')}</span>
                  {OPS_NAV_ICONS.map((icon, i) => (
                    <span className={i === 0 ? 'app-nav is-on' : 'app-nav'} key={icon}>
                      <Icon name={icon} />
                      <span>{t(`board.side.ops.items.${i}.label`)}</span>
                      {i > 0 ? (
                        <span className="count">
                          {t(`board.side.ops.items.${i}.count`)}
                        </span>
                      ) : null}
                    </span>
                  ))}
                  <span className="grp">{t('board.side.money.label')}</span>
                  {MONEY_NAV_ICONS.map((icon, i) => (
                    <span className="app-nav" key={icon}>
                      <Icon name={icon} />
                      <span>{t(`board.side.money.items.${i}.label`)}</span>
                      {i === 0 ? (
                        <span className="count">
                          {t('board.side.money.items.0.count')}
                        </span>
                      ) : null}
                    </span>
                  ))}
                </aside>

                <div className="app-pane">
                  <div className="pane-head">
                    <div>
                      <p className="pane-title">{t('board.pane.title')}</p>
                      <p className="psub">{t('board.pane.sub')}</p>
                    </div>
                    <div className="pane-tools">
                      <span className="segmented" role="group" aria-hidden="true">
                        <button type="button" tabIndex={-1} aria-selected="true">
                          {t('board.pane.today')}
                        </button>
                        <button type="button" tabIndex={-1} aria-selected="false">
                          {t('board.pane.week')}
                        </button>
                      </span>
                      <span className="filter is-on">
                        <Icon name="i-filter" />
                        {t('board.pane.filter')}
                      </span>
                    </div>
                  </div>

                  <div className="kpis kpis--lead">
                    <div className="kpi kpi--ring">
                      <div
                        className="ring"
                        style={{ '--pct': t('board.kpi.ready.pct') } as CSSProperties}
                      >
                        <svg viewBox="0 0 88 88" aria-hidden="true" focusable="false">
                          <circle className="track" cx="44" cy="44" r="38" />
                          <circle className="prog" cx="44" cy="44" r="38" />
                        </svg>
                        <span className="rcenter">
                          <span className="rnum">{t('board.kpi.ready.pct')}</span>
                          <span className="rsuf">
                            {t('board.kpi.ready.pctSymbol')}
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="klab">{t('board.kpi.ready.value')}</span>
                        <div className="kval">
                          {t('board.kpi.ready.count')}
                          <span className="sub">{t('board.kpi.ready.total')}</span>
                        </div>
                        <div className="kfoot">
                          <Icon name="i-check-circle" />
                          {t('board.kpi.ready.foot')}
                        </div>
                      </div>
                    </div>
                    <div className="kpi">
                      <span className="klab">{t('board.kpi.handovers.label')}</span>
                      <div className="kval">{t('board.kpi.handovers.count')}</div>
                      <div className="kfoot">{t('board.kpi.handovers.foot')}</div>
                    </div>
                    <div className="kpi">
                      <span className="klab">{t('board.kpi.billed.label')}</span>
                      <div className="kval">{t('board.kpi.billed.amount')}</div>
                      <div className="kfoot">{t('board.kpi.billed.foot')}</div>
                    </div>
                  </div>

                  <div className="tbl tbl--stack">
                    <div className="tbl-scroll">
                      <table className="data">
                        <caption className="sr-only">
                          {t('board.table.caption')}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">{t('board.table.head.unit')}</th>
                            <th scope="col">{t('board.table.head.plate')}</th>
                            <th scope="col">{t('board.table.head.status')}</th>
                            <th scope="col">{t('board.table.head.level')}</th>
                            <th scope="col" className="th-strong">
                              {t('board.table.head.next')}
                            </th>
                            <th scope="col" className="right">
                              {t('board.table.head.time')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {BOARD_ROWS.map((row, i) => {
                            const level = t(`board.table.rows.${i}.level`);
                            return (
                              <tr key={i}>
                                <td>
                                  <span className="cell-veh">
                                    <span className="thumb">
                                      <Icon name="i-vehicle" />
                                    </span>
                                    <span>
                                      <b>{t(`board.table.rows.${i}.vehicle.value`)}</b>
                                      <small>
                                        {t(`board.table.rows.${i}.vehicle.sub`)}
                                      </small>
                                    </span>
                                  </span>
                                </td>
                                <td>
                                  <span className="plate">
                                    {t(`board.table.rows.${i}.plate`)}
                                  </span>
                                </td>
                                <td>
                                  <Chip tone={row.tone}>
                                    {t(`board.table.rows.${i}.status.value`)}
                                  </Chip>
                                </td>
                                <td>
                                  <span className="meter">
                                    <span className="track">
                                      <span
                                        className={row.fill}
                                        style={{ width: level }}
                                      />
                                    </span>
                                    <b>{level}</b>
                                  </span>
                                </td>
                                <td>
                                  <span className="nact">
                                    <Icon name={row.icon} />
                                    <span>
                                      <b>{t(`board.table.rows.${i}.next.title`)}</b>
                                      <small>
                                        {t(`board.table.rows.${i}.next.sub`)}
                                      </small>
                                    </span>
                                  </span>
                                </td>
                                <td className="right tcell">
                                  {t(`board.table.rows.${i}.time`)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="tbl-foot">
                      <span>{t('board.table.foot.left')}</span>
                      <span className="r">
                        <span>{t('board.table.foot.updated')}</span>
                        <span>{t('board.table.foot.code')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stage-notes">
              {range(3).map((i) => (
                <p className={i === 2 ? 'sn sn--note' : 'sn'} key={i}>
                  <span className="snl">
                    {i === 2 ? <Icon name="i-info" /> : null}
                    {t(`board.notes.${i}.label`)}
                  </span>
                  {t(`board.notes.${i}.body`)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= INTEGRATIONS ========================= */}
      <section className="trust">
        <div className="container">
          <p className="tlab">{t('trust.label')}</p>
          <div className="integration-strip">
            {INTEGRATION_ICONS.map((icon, i) => (
              <span className="integration" key={i}>
                <Icon name={icon} />
                {t(`trust.integrations.${i}.value`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= 01 · BUSINESS MODELS ========================= */}
      <Section id="modelos">
        <div className="editorial-head reveal">
          <span className="chapter-mark">
            {t('models.head.mark')}
            <span className="of">{t('models.head.of')}</span>
          </span>
          <h2>{t('models.head.title')}</h2>
          <p className="aside">{t('models.head.aside')}</p>
        </div>

        {/* -- Model 1: traditional rental -- */}
        <div className="model reveal">
          <div className="m-copy">
            <div className="m-kicker">
              <span className="mi">{t('models.rental.n')}</span>
              <span className="mw">{t('models.rental.kicker')}</span>
            </div>
            <h3>{t('models.rental.title')}</h3>
            <p>{t('models.rental.body')}</p>
            <ul className="flist">
              {RENTAL_FEATURE_ICONS.map((icon, i) => (
                <li key={icon}>
                  <span className="fi">
                    <Icon name={icon} />
                  </span>
                  <span>
                    <b>{t(`models.rental.features.${i}.title`)}</b>
                    <span className="d">
                      {t(`models.rental.features.${i}.body`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="app-stage mini">
            <div
              className="app"
              role="img"
              aria-label={t('models.rental.app.ariaLabel')}
            >
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="app-crumbs">
                  <b>{t('models.rental.app.crumb')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('models.rental.app.number')}</span>
                </span>
              </div>
              <div className="app-pane">
                <div className="pane-head">
                  <div>
                    <p className="pane-title">
                      {t('models.rental.app.vehicle.value')} ·{' '}
                      <span className="plate">
                        {t('models.rental.app.vehicle.plate')}
                      </span>
                    </p>
                    <p className="psub">{t('models.rental.app.sub')}</p>
                  </div>
                  <div className="pane-tools">
                    <Chip tone="brand">{t('models.rental.app.chip')}</Chip>
                  </div>
                </div>
                <div className="mini-rows">
                  {range(3).map((i) => (
                    <div className="mini-row" key={i}>
                      <span className="mno">
                        {t(`models.rental.app.rows.${i}.no`)}
                      </span>
                      <span className="mtx">
                        <b>{t(`models.rental.app.rows.${i}.title`)}</b>
                        <small>{t(`models.rental.app.rows.${i}.sub`)}</small>
                      </span>
                      <span className="mt">
                        {t(`models.rental.app.rows.${i}.amount`)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="steprail" aria-hidden="true">
                  {range(5).map((i) => (
                    <Fragment key={i}>
                      <i className={i < 3 ? 'done' : i === 3 ? 'now' : undefined}>
                        {t(`models.rental.app.steps.${i}.value`)}
                      </i>
                      {i < 4 ? <span className="arw">›</span> : null}
                    </Fragment>
                  ))}
                </div>
                <div className="mini-foot">
                  <span>{t('models.rental.app.foot.label')}</span>
                  <span className="tot">{t('models.rental.app.foot.total')}</span>
                </div>
              </div>
            </div>
            <SampleDataNote>{tA11y('sampleData')}</SampleDataNote>
          </div>
        </div>

        {/* -- Model 2: car-sharing marketplace -- */}
        <div className="model model--flip reveal">
          <div className="m-copy">
            <div className="m-kicker">
              <span className="mi">{t('models.sharing.n')}</span>
              <span className="mw">{t('models.sharing.kicker')}</span>
            </div>
            <h3>{t('models.sharing.title')}</h3>
            <p>{t('models.sharing.body')}</p>
            <ul className="flist">
              {SHARING_FEATURE_ICONS.map((icon, i) => (
                <li key={icon}>
                  <span className="fi">
                    <Icon name={icon} />
                  </span>
                  <span>
                    <b>{t(`models.sharing.features.${i}.title`)}</b>
                    <span className="d">
                      {t(`models.sharing.features.${i}.body`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="app-stage mini">
            <div
              className="app"
              role="img"
              aria-label={t('models.sharing.app.ariaLabel')}
            >
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="app-crumbs">
                  <b>{t('models.sharing.app.crumb')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('models.sharing.app.host.value')}</span>
                </span>
              </div>
              <div className="app-pane">
                <div className="pane-head">
                  <div>
                    <p className="pane-title">{t('models.sharing.app.title')}</p>
                    <p className="psub">{t('models.sharing.app.sub')}</p>
                  </div>
                </div>
                <div className="tbl tbl--compact">
                  <div className="tbl-scroll">
                    <table className="data">
                      <caption className="sr-only">
                        {t('models.sharing.app.caption')}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">
                            {t('models.sharing.app.head.unit')}
                          </th>
                          <th scope="col">
                            {t('models.sharing.app.head.bookings')}
                          </th>
                          <th scope="col">
                            {t('models.sharing.app.head.rate')}
                          </th>
                          <th scope="col" className="right">
                            {t('models.sharing.app.head.payout')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {range(3).map((i) => (
                          <tr key={i}>
                            <td>
                              {t(`models.sharing.app.rows.${i}.vehicle.value`)} ·{' '}
                              <span className="plate">
                                {t(`models.sharing.app.rows.${i}.vehicle.plate`)}
                              </span>
                            </td>
                            <td>{t(`models.sharing.app.rows.${i}.bookings`)}</td>
                            <td>{t(`models.sharing.app.rows.${i}.rate`)}</td>
                            <td className="right">
                              <span className="money">
                                {t(`models.sharing.app.rows.${i}.payout`)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mini-foot">
                  <span>{t('models.sharing.app.foot.label')}</span>
                  <span className="tot">
                    {t('models.sharing.app.foot.total')}
                  </span>
                </div>
              </div>
            </div>
            <SampleDataNote>{tA11y('sampleData')}</SampleDataNote>
          </div>
        </div>

        {/* -- Model 3: dealership loaners -- */}
        <div className="model reveal">
          <div className="m-copy">
            <div className="m-kicker">
              <span className="mi">{t('models.loaners.n')}</span>
              <span className="mw">{t('models.loaners.kicker')}</span>
            </div>
            <h3>{t('models.loaners.title')}</h3>
            <p>{t('models.loaners.body')}</p>
            <ul className="flist">
              {LOANER_FEATURE_ICONS.map((icon, i) => (
                <li key={icon}>
                  <span className="fi">
                    <Icon name={icon} />
                  </span>
                  <span>
                    <b>{t(`models.loaners.features.${i}.title`)}</b>
                    <span className="d">
                      {t(`models.loaners.features.${i}.body`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="app-stage mini">
            <div
              className="app"
              role="img"
              aria-label={t('models.loaners.app.ariaLabel')}
            >
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="app-crumbs">
                  <b>{t('models.loaners.app.crumb')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('models.loaners.app.place')}</span>
                </span>
              </div>
              <div className="app-pane">
                <div className="pane-head">
                  <div>
                    <p className="pane-title">{t('models.loaners.app.title')}</p>
                    <p className="psub">{t('models.loaners.app.sub')}</p>
                  </div>
                </div>
                <div className="mini-rows">
                  {LOANER_ROW_TONES.map((tone, i) => (
                    <div className="mini-row" key={i}>
                      <span className="mno">
                        {t(`models.loaners.app.rows.${i}.number`)}
                      </span>
                      <span className="mtx">
                        <b>
                          {t(`models.loaners.app.rows.${i}.vehicle.value`)} ·{' '}
                          <span className="plate">
                            {t(`models.loaners.app.rows.${i}.vehicle.plate`)}
                          </span>
                        </b>
                        <small>{t(`models.loaners.app.rows.${i}.sub`)}</small>
                      </span>
                      <span className="mt">
                        <Chip tone={tone}>
                          {t(`models.loaners.app.rows.${i}.chip`)}
                        </Chip>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mini-foot">
                  <span>{t('models.loaners.app.foot.label')}</span>
                  <span className="tot">
                    {t('models.loaners.app.foot.total')}
                  </span>
                </div>
              </div>
            </div>
            <SampleDataNote>{tA11y('sampleData')}</SampleDataNote>
          </div>
        </div>
      </Section>

      {/* ========================= 02 · THE OPERATIONS SPINE ========================= */}
      <Section id="columna" className="band">
        <div className="editorial-head reveal">
          <span className="chapter-mark">
            {t('spine.head.mark')}
            <span className="of">{t('spine.head.of')}</span>
          </span>
          <h2>{t('spine.head.title')}</h2>
          <p className="aside">{t('spine.head.aside')}</p>
        </div>

        <div className="spine reveal">
          {STATION_ICONS.map((icon, i) => (
            <div className="station" key={i}>
              <span className="node">
                <Icon name={icon} />
              </span>
              <span className="sn">{t(`spine.stations.${i}.n`)}</span>
              <h3>{t(`spine.stations.${i}.value`)}</h3>
              <p>{t(`spine.stations.${i}.body`)}</p>
              <span className="rec">{t(`spine.stations.${i}.rec`)}</span>
            </div>
          ))}
        </div>

        <div className="spine-detail reveal">
          <div className="log">
            <div className="log-head">
              <span className="pulse" aria-hidden="true" />
              <span className="caps">{t('spine.log.title')}</span>
              <span className="tag">{t('spine.log.tag')}</span>
            </div>
            {range(8).map((i) => (
              <div className="evt" key={i}>
                <span className="tm">{t(`spine.log.events.${i}.time`)}</span>
                <span className="tx">
                  {t.rich(`spine.log.events.${i}.text`, rich)}
                </span>
              </div>
            ))}
            <div className="log-foot">{t.rich('spine.log.foot', rich)}</div>
          </div>
          <div>
            <h3>{t('spine.detail.title')}</h3>
            <p className="small" style={{ marginTop: 'var(--sp-4)' }}>
              {t('spine.detail.body')}
            </p>
            <ul className="flist">
              {SPINE_DETAIL_ICONS.map((icon, i) => (
                <li key={icon}>
                  <span className="fi">
                    <Icon name={icon} />
                  </span>
                  <span>
                    <b>{t(`spine.detail.features.${i}.title`)}</b>
                    <span className="d">
                      {t(`spine.detail.features.${i}.body`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ========================= 03 · CAPABILITIES ========================= */}
      <Section id="capacidades" className="sec--pb-sm">
        <div className="editorial-head reveal">
          <span className="chapter-mark">
            {t('caps.head.mark')}
            <span className="of">{t('caps.head.of')}</span>
          </span>
          <h2>{t('caps.head.title')}</h2>
          <p className="aside">{t.rich('caps.head.aside', rich)}</p>
        </div>

        {CAP_ROWS.map((row, r) => (
          <div className="cap-row reveal" key={r}>
            <div className="cap-head">
              <span className="cn">{t(`caps.rows.${r}.kicker`)}</span>
              <h3>{t(`caps.rows.${r}.title`)}</h3>
              <p>{t(`caps.rows.${r}.body`)}</p>
            </div>
            <div className="feature-grid">
              {row.features.map((feature, f) => (
                <div className="feature" key={f}>
                  <span className="fic">
                    <Icon name={feature.icon} />
                  </span>
                  <h4>
                    {t(`caps.rows.${r}.features.${f}.value`)}
                    {feature.building ? (
                      <>
                        {' '}
                        <BuildingBadge label={tCommon('building')} />
                      </>
                    ) : null}
                  </h4>
                  <p>{t(`caps.rows.${r}.features.${f}.body`)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* ========================= 04 · COMPARISON ========================= */}
      <Section id="comparacion" variant="alt" className="sec--pt-sm sec--pb-sm">
        <div className="editorial-head reveal">
          <span className="chapter-mark">
            {t('compare.head.mark')}
            <span className="of">{t('compare.head.of')}</span>
          </span>
          <h2>{t('compare.head.title')}</h2>
          <p className="aside">{t('compare.head.aside')}</p>
        </div>

        <div className="tbl cmp reveal">
          <div className="tbl-scroll">
            <table className="data">
              <caption className="sr-only">{t('compare.caption')}</caption>
              <thead>
                <tr>
                  <th scope="col" className="th-strong">
                    {t('compare.th.capability')}
                  </th>
                  <th scope="col" className="c-us">
                    {t('compare.th.us')}
                  </th>
                  <th scope="col" className="c-them">
                    {t('compare.th.them')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className="c-cap">
                      {t(`compare.rows.${i}.cap`)}
                      {row.sub ? (
                        <small>{t(`compare.rows.${i}.sub.value`)}</small>
                      ) : null}
                    </td>
                    <td className="c-us" data-label={t('compare.th.us')}>
                      {t(`compare.rows.${i}.us`)}
                      {row.badge ? (
                        <>
                          {' '}
                          <BuildingBadge label={t(`compare.rows.${i}.badge`)} />
                        </>
                      ) : null}
                    </td>
                    <td className="c-them" data-label={t('compare.th.them')}>
                      {t(`compare.rows.${i}.them`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="cmp-note">
          <Icon name="i-info" />
          <span>{t.rich('compare.note', rich)}</span>
        </p>
      </Section>

      {/* ========================= MODULES ========================= */}
      <Section className="sec--pad-sm">
        <div className="toggle-band reveal">
          <div>
            <span className="eyebrow">
              <span className="dot" />
              {t('modules.eyebrow')}
            </span>
            <h2 style={{ marginTop: 'var(--sp-4)' }}>{t('modules.title')}</h2>
            <p style={{ marginTop: 'var(--sp-4)' }}>{t('modules.body')}</p>
            <div className="btn-row" style={{ marginTop: 'var(--sp-6)' }}>
              <ArrowLink href={routes.tollBridge}>
                {t('modules.linkToll')}
              </ArrowLink>
              <ArrowLink href={routes.vozAi}>{t('modules.linkVoz')}</ArrowLink>
            </div>
          </div>
          <div className="toggle-mods" aria-hidden="true">
            {MODULE_BADGES.map((mod, i) => (
              <div className={mod.on ? 'tmod tmod--on' : 'tmod'} key={i}>
                <span className={mod.className}>
                  <span className="pi">
                    <Icon name={mod.icon} />
                  </span>{' '}
                  {t(`modules.mods.${i}.code`)}
                </span>
                <span className="tx">
                  <b>{t(`modules.mods.${i}.name`)}</b>
                  <small>{t(`modules.mods.${i}.desc`)}</small>
                </span>
                <span className="sw" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ========================= FAQ + PARTNER ========================= */}
      <Section id="faq" className="sec--pt-sm">
        <div className="faq-split">
          <div>
            <h2 style={{ marginBottom: 'var(--sp-6)' }}>{t('faq.title')}</h2>
            <div className="faq">
              {faqItems.map((item, i) => (
                <details key={i} open={i === 0}>
                  <summary>
                    <span className="q">{item.q}</span>
                    <Icon name="i-chevron-down" />
                  </summary>
                  <p className="a">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="partner">
            <div className="partner-invite">
              <h3>{t('partner.title')}</h3>
              <p>{t('partner.body')}</p>
              <ButtonLink
                href={routes.demo}
                tone="primary"
                size="sm"
                icon="i-arrow-right"
              >
                {t('partner.cta')}
              </ButtonLink>
            </div>
            <div className="slot-row">
              {range(3).map((i) => (
                <span className="logo-slot" key={i}>
                  {tCommon('logoSlot')}
                </span>
              ))}
            </div>
            <p className="slot-cap">{t('partner.slotsNote')}</p>
          </aside>
        </div>
      </Section>

      {/* ========================= CTA ========================= */}
      <Section id="demo" variant="flush-top">
        <div className="cta-band cta-band--split reveal">
          <div>
            <span className="cta-eyebrow">{t('cta.eyebrow')}</span>
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.body')}</p>
            <p className="cta-tags">
              {range(4).map((i) => (
                <span key={i}>{t(`cta.tags.${i}.value`)}</span>
              ))}
            </p>
          </div>
          <div className="cta-actions">
            <div className="btn-row">
              <ButtonLink
                href={routes.demo}
                tone="primary"
                size="lg"
                icon="i-arrow-right"
              >
                {t('cta.primary')}
              </ButtonLink>
              <Link className="btn btn--secondary btn--lg" href={routes.tollBridge}>
                {t('cta.secondary')}
              </Link>
            </div>
            <p className="cta-list">
              {range(3).map((i) => (
                <span key={i}>
                  <Icon name="i-check" />
                  {t(`cta.list.${i}`)}
                </span>
              ))}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
