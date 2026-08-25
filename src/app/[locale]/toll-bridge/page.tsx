import { useMessages, useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { breadcrumbSchema, buildMetadata, faqSchema, softwareSchema } from '@/lib/seo';
import { routes } from '@/lib/site';
import { Icon, type IconName } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import {
  BuildingBadge,
  ButtonLink,
  Chip,
  SampleDataNote
} from '@/components/ui';
import { TollCalculator } from './TollCalculator';

import '@/styles/pages/toll-bridge.css';

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}) {
  return buildMetadata({
    locale: params.locale as Locale,
    path: routes.tollBridge,
    namespace: 'tollBridge'
  });
}

/* -------------------------------------------------------------------------- */
/* Catalog shapes. Lists live as arrays in the JSON and are read through        */
/* `useMessages()` — `t()` cannot map an array. Values that are legitimately    */
/* identical in both locales (brand names, plates, codes, masked credentials)   */
/* are nested under `.value` so the i18n gate accepts the duplication.          */
/* -------------------------------------------------------------------------- */

type Labelled = { value: string };

type TollBridgeMessages = {
  hero: { notes: string[] };
  sync: {
    rows: { name: Labelled; region: string; status: string; time: string }[];
    chart: { days: string[] };
  };
  app: {
    queues: { label: string; count: string }[];
    sources: string[];
    kpis: { label: string; value: string; foot: Labelled }[];
    table: {
      rows: {
        code: string;
        plate: string;
        gantry: Labelled;
        time: string;
        amount: string;
        conf: string;
        resv: Labelled;
        sub: Labelled;
        status: string;
      }[];
    };
  };
  notes: { label: string; body: string }[];
  trust: { items: Labelled[] };
  quo: { rows: { task: string; them: string; us: string }[] };
  how: {
    steps: {
      num: string;
      kicker: string;
      title: string;
      body: string;
      list: { k: string; v: string }[];
    }[];
    ladder: { rows: { num: string; title: string; body: string; chip: string }[] };
    disclosure: { items: { term: string; def: string }[] };
  };
  security: {
    guard: { items: { title: string; body: string }[] };
    conn: {
      rows: {
        name: Labelled;
        region: string;
        user: Labelled;
        pass: Labelled;
        status: string;
        test: string;
      }[];
    };
    roles: {
      rows: {
        role: string;
        crossings: string;
        username: string;
        password: string;
        test: string;
      }[];
    };
  };
  coverage: {
    rows: {
      name: Labelled;
      region: string;
      frequency: string;
      lookback: string;
      status: string;
    }[];
    toggle: { mods: { name: string; sub: string }[] };
  };
  faq: { items: { q: string; a: string }[] };
  cta: {
    list: string[];
    agenda: { items: { t: string; b: string; s: string }[] };
  };
};

/* --- geometry and iconography carried over from the static page ------------ */

const HERO_NOTE_ICONS: IconName[] = ['i-check', 'i-lock', 'i-check'];

/** Bar heights of the seven-day import sparkline; index 4 is the peak. */
const SPARK_HEIGHTS = [38, 56, 47, 71, 100, 83, 44];
const SPARK_PEAK = 4;

const RAIL_ICONS: IconName[] = [
  'i-grid',
  'i-toll-gantry',
  'i-vehicle',
  'i-receipt',
  'i-users'
];
const QUEUE_ICONS: IconName[] = [
  'i-toll-gantry',
  'i-check-circle',
  'i-alert',
  'i-receipt',
  'i-shield'
];
const SOURCE_ICONS: IconName[] = ['i-link', 'i-clock'];
const KPI_CLASSES = ['kpi', 'kpi kpi--brand', 'kpi kpi--gold', 'kpi'];
const NOTE_ICONS: IconName[] = ['i-gauge', 'i-link', 'i-info'];
const NOTE_CLASSES = ['sn', 'sn', 'sn sn--note'];
/* Index-aligned with `trust.items`. One glyph for all five toll networks —
   see the same note on the Ride Fleet Manager strip. */
const TRUST_ICONS: IconName[] = [
  'i-toll-gantry',
  'i-toll-gantry',
  'i-toll-gantry',
  'i-toll-gantry',
  'i-toll-gantry',
  'i-dollar',
  'i-route',
  'i-bolt',
  'i-location',
  'i-sms'
];
const GUARD_ICONS: IconName[] = ['i-lock', 'i-layers', 'i-shield', 'i-refresh'];
const LADDER_TONES = ['hi', 'mid', 'lo'] as const;
const LADDER_WIDTHS = [100, 64, 34];
const LADDER_CHIPS = ['ok', 'brand', 'danger'] as const;
const COVERAGE_ICONS: IconName[] = [
  'i-toll-gantry',
  'i-toll-gantry',
  'i-toll-gantry',
  'i-download'
];
const TOGGLE_MOD_CLASSES = [
  'tmod tmod--on',
  'tmod tmod--on tmod--gold',
  'tmod'
];

/** Which permission cells read as granted in the roles matrix. */
const ROLE_MARKS: { crossings: boolean; username: boolean; test: boolean }[] = [
  { crossings: true, username: true, test: true },
  { crossings: true, username: false, test: false },
  { crossings: true, username: false, test: false },
  { crossings: false, username: false, test: false }
];

/** Confidence drives both the bar tint and the status chip on each crossing. */
function confClass(score: number) {
  if (score >= 85) return 'conf';
  return score >= 60 ? 'conf conf--low' : 'conf conf--bad';
}
function confChip(score: number): 'ok' | 'brand' | 'danger' {
  if (score >= 85) return 'ok';
  return score >= 60 ? 'brand' : 'danger';
}

function Mark({ granted, children }: { granted: boolean; children: string }) {
  return (
    <span className={granted ? 'yes' : 'no'}>
      <Icon name={granted ? 'i-check' : 'i-x'} />
      {children}
    </span>
  );
}

export default function TollBridgePage({
  params
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);

  const locale = params.locale as Locale;
  const t = useTranslations('tollBridge');
  const a11y = useTranslations('a11y');
  const common = useTranslations('common');
  const nav = useTranslations('nav');
  const m = (useMessages() as unknown as { tollBridge: TollBridgeMessages })
    .tollBridge;

  const faqItems = m.faq.items;

  return (
    <>
      <JsonLd
        data={softwareSchema({
          locale,
          name: 'Toll Bridge',
          description: t('meta.description'),
          path: routes.tollBridge
        })}
      />
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('tollBridge'), path: routes.tollBridge }
        ])}
      />
      <JsonLd data={faqSchema(faqItems)} />

      {/* ================================================================
          INK BAND · hero + reconciliation console (one continuous band)
          ================================================================ */}
      <section className="sec sec--tight band band--ink hero-ink" id="top">
        <span className="mesh" aria-hidden="true" />
        <span className="glow glow--gold" aria-hidden="true" />
        <span className="glow glow--brand" aria-hidden="true" />

        <div className="container hero-in">
          <div className="hero-copy">
            <div>
              <span className="pbadge pbadge--toll">
                <span className="pi">
                  <Icon name="i-toll-gantry" />
                </span>{' '}
                {t('hero.badge')}
              </span>

              <h1 className="display">
                {t('hero.titleLead')}
                <span className="grad">{t('hero.titleGrad')}</span>
                {t('hero.titleTail')}
              </h1>

              <p className="lede">{t('hero.lede')}</p>

              <div className="btn-row">
                <ButtonLink
                  href={routes.demo}
                  size="lg"
                  icon="i-arrow-right"
                >
                  {t('hero.ctaDemo')}
                </ButtonLink>
                <a className="btn btn--secondary btn--lg" href="#calculadora">
                  {t('hero.ctaCalc')}
                </a>
              </div>

              <p className="hero-note">
                {m.hero.notes.map((note, i) => (
                  <span key={i}>
                    <Icon name={HERO_NOTE_ICONS[i]} />
                    {note}
                  </span>
                ))}
              </p>
            </div>

            <aside className="sync" aria-label={t('sync.aria')}>
              <div className="sync-head">
                <span className="live">
                  <span className="pulse" />
                  {t('sync.live')}
                </span>
                <span className="tag">{t('sync.tag')}</span>
              </div>

              {m.sync.rows.map((row, i) => (
                <div className="srow" key={i}>
                  <span className="si">
                    <Icon name="i-toll-gantry" />
                  </span>
                  <span>
                    <b>{row.name.value}</b>
                    <small>{row.region}</small>
                  </span>
                  <span className="sright">
                    <Chip tone="ok">{row.status}</Chip>
                    <span className="stime">{row.time}</span>
                  </span>
                </div>
              ))}

              <div className="srow">
                <span className="si">
                  <Icon name="i-toll-gantry" />
                </span>
                <span>
                  <b>{t('sync.epass.name.value')}</b>
                  <small>{t('sync.epass.region')}</small>
                </span>
                <span className="sright">
                  <BuildingBadge label={common('building')} />
                </span>
              </div>

              <div className="ssp" role="img" aria-label={t('sync.chart.aria')}>
                <div className="ssp-head">
                  <span>{t('sync.chart.head')}</span>
                  <b>{t('sync.chart.total')}</b>
                </div>
                <div className="ssp-bars" aria-hidden="true">
                  {m.sync.chart.days.map((day, i) => (
                    <i
                      key={i}
                      className={i === SPARK_PEAK ? 'pk' : undefined}
                      style={{ height: `${SPARK_HEIGHTS[i]}%` }}
                    >
                      <s>{day}</s>
                    </i>
                  ))}
                </div>
              </div>

              <p className="sync-foot">{t('sync.foot')}</p>
            </aside>
          </div>

          <div className="stage reveal">
            <span className="amb" aria-hidden="true" />
            <div className="app" role="img" aria-label={t('app.aria')}>
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="app-crumbs">
                  <b>{t('hero.badge')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('app.crumbSection')}</span>
                  <Icon name="i-chevron" />
                  <span>{t('app.crumbDate')}</span>
                </span>
                <span className="app-bar-right">
                  <span className="searchpill">
                    <Icon name="i-search" />
                    {t('app.search.label')}
                    <kbd>{t('app.search.code')}</kbd>
                  </span>
                  <span className="iconbtn">
                    <Icon name="i-refresh" />
                  </span>
                  <span className="iconbtn">
                    <Icon name="i-bell" />
                    <span className="dot" />
                  </span>
                  <span className="avatar">{t('app.avatar.value')}</span>
                </span>
              </div>

              <div className="app-body">
                <aside className="app-rail" aria-hidden="true">
                  {RAIL_ICONS.map((icon, i) => (
                    <span className={i === 1 ? 'ri is-on' : 'ri'} key={icon}>
                      <Icon name={icon} />
                    </span>
                  ))}
                  <span className="spacer" />
                  <span className="ri">
                    <Icon name="i-chart" />
                  </span>
                </aside>

                <aside className="app-side" aria-hidden="true">
                  <span className="grp">{t('app.groups.tolls')}</span>
                  {m.app.queues.map((queue, i) => (
                    <span
                      className={i === 0 ? 'app-nav is-on' : 'app-nav'}
                      key={i}
                    >
                      <Icon name={QUEUE_ICONS[i]} />
                      {queue.label}
                      <span className="count">{queue.count}</span>
                    </span>
                  ))}
                  <span className="grp">{t('app.groups.sources')}</span>
                  {m.app.sources.map((source, i) => (
                    <span className="app-nav" key={i}>
                      <Icon name={SOURCE_ICONS[i]} />
                      {source}
                    </span>
                  ))}
                </aside>

                <div className="app-pane">
                  <div className="pane-head">
                    <div>
                      <p className="pane-title">{t('app.pane.title')}</p>
                      <p className="psub">{t('app.pane.sub')}</p>
                    </div>
                    <div className="pane-tools">
                      <span className="live">
                        <span className="pulse" />
                        {t('app.pane.live')}
                      </span>
                      {/* Painted controls, not <button>s: real buttons inside
                          the role="img" board are nested-interactive (axe) —
                          reachable by keyboard yet hidden from readers. */}
                      <span className="segmented" aria-hidden="true">
                        <span className="is-on">{t('app.pane.segAll')}</span>
                        <span>{t('app.pane.segReview')}</span>
                      </span>
                      <span className="filter is-on">
                        <Icon name="i-filter" />
                        {t('app.pane.filter')}
                      </span>
                    </div>
                  </div>

                  <div className="kpis kpis--4">
                    {m.app.kpis.map((kpi, i) => (
                      <div className={KPI_CLASSES[i]} key={i}>
                        <span className="klab">{kpi.label}</span>
                        <div className="kval">{kpi.value}</div>
                        <div className="kfoot">{kpi.foot.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="tbl">
                    <div className="tbl-scroll">
                      <table className="data">
                        <caption className="sr-only">
                          {t('app.table.caption')}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">{t('app.table.head.txn')}</th>
                            <th scope="col">{t('app.table.head.plate')}</th>
                            <th scope="col">{t('app.table.head.gantry')}</th>
                            <th scope="col">{t('app.table.head.time')}</th>
                            <th scope="col" className="right">
                              {t('app.table.head.amount')}
                            </th>
                            <th scope="col">{t('app.table.head.confidence')}</th>
                            <th scope="col" className="th-strong">
                              {t('app.table.head.reservation')}
                            </th>
                            <th scope="col">{t('app.table.head.status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.app.table.rows.map((row) => {
                            const score = Number(row.conf);
                            return (
                              <tr key={row.code}>
                                <td className="tcell">{row.code}</td>
                                <td>
                                  <span className="plate">{row.plate}</span>
                                </td>
                                <td>
                                  <span className="gantry">
                                    <Icon name="i-road" />
                                    {row.gantry.value}
                                  </span>
                                </td>
                                <td className="tcell">{row.time}</td>
                                <td className="right">
                                  <span className="money">{row.amount}</span>
                                </td>
                                <td>
                                  <span className={confClass(score)}>
                                    <span className="bar">
                                      <i style={{ width: `${score}%` }} />
                                    </span>
                                    <b>{row.conf}</b>
                                  </span>
                                </td>
                                <td>
                                  <span className="resv">
                                    <b>{row.resv.value}</b>
                                    <small>{row.sub.value}</small>
                                  </span>
                                </td>
                                <td>
                                  <Chip tone={confChip(score)}>{row.status}</Chip>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="tbl-foot">
                      <span>{t('app.table.foot.showing')}</span>
                      <span className="r">
                        <span>{t('app.table.foot.lastImport')}</span>
                        <span>{t('app.table.foot.tz.value')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stage-notes">
              {m.notes.map((note, i) => (
                <div className={NOTE_CLASSES[i]} key={i}>
                  <span className="snl">
                    <Icon name={NOTE_ICONS[i]} />
                    {note.label}
                  </span>
                  <span>{note.body}</span>
                </div>
              ))}
            </div>

            <SampleDataNote>{a11y('sampleData')}</SampleDataNote>
          </div>
        </div>
      </section>

      {/* ========================= INTEGRATIONS ========================= */}
      <section className="trust trust--rail">
        <div className="container trust-in">
          <p className="tlab">{t('trust.label')}</p>
          <div className="integration-strip">
            {m.trust.items.map((item, i) => (
              <span className="integration" key={item.value}>
                <Icon name={TRUST_ICONS[i]} />
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================== 01 · THE LEAK, QUANTIFIED ================== */}
      <section className="sec" id="calculadora">
        <div className="container">
          <div className="editorial-head reveal">
            <span className="chapter-mark">
              {t('leak.chapter')}
              <span className="of">{t('leak.of')}</span>
            </span>
            <h2>{t('leak.title')}</h2>
            <p className="aside">{t('leak.aside')}</p>
          </div>

          <TollCalculator />

          <p className="honesty reveal">
            <Icon name="i-info" />
            <span>
              <b>{t('honesty.lead')}</b> {t('honesty.body')}
            </span>
          </p>

          <div className="quo reveal">
            <div className="quo-head">
              <h3>{t('quo.title')}</h3>
              <p>{t('quo.sub')}</p>
            </div>

            <div className="tbl">
              <div className="tbl-scroll">
                <table className="data">
                  <caption className="sr-only">{t('quo.caption')}</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="c-task">
                        {t('quo.head.task')}
                      </th>
                      <th scope="col" className="c-them">
                        {t('quo.head.them')}
                      </th>
                      <th scope="col" className="c-us">
                        {t('quo.head.us')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.quo.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="c-task">{row.task}</td>
                        <td className="c-them" data-label={t('quo.labels.them')}>
                          {row.them}
                        </td>
                        <td className="c-us" data-label={t('quo.labels.us')}>
                          {row.us}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 02 · HOW IT WORKS ====================== */}
      <section className="sec" id="como">
        <div className="container">
          <div className="editorial-head reveal">
            <span className="chapter-mark">
              {t('how.chapter')}
              <span className="of">{t('how.of')}</span>
            </span>
            <h2>{t('how.title')}</h2>
            <p className="aside">{t('how.aside')}</p>
          </div>

          {m.how.steps.map((step) => (
            <div className="ed-row step reveal" key={step.num}>
              <span className="sk">
                {step.num} · {step.kicker}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <ul className="ed-list">
                {step.list.map((item, i) => (
                  <li key={i}>
                    <b>{item.k}</b>
                    <span>{item.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="ladder reveal">
            <div className="ladder-cap">
              <h4>{t('how.ladder.title')}</h4>
              <p>{t('how.ladder.sub')}</p>
            </div>

            {m.how.ladder.rows.map((row, i) => (
              <div className={`lrow lrow--${LADDER_TONES[i]}`} key={i}>
                <span className="lnum">{row.num}</span>
                <span className="lbar" aria-hidden="true">
                  <i style={{ width: `${LADDER_WIDTHS[i]}%` }} />
                </span>
                <span className="ltx">
                  <b>{row.title}</b>
                  <span className="d">{row.body}</span>
                </span>
                <Chip tone={LADDER_CHIPS[i]}>{row.chip}</Chip>
              </div>
            ))}
          </div>

          <details className="disclosure reveal">
            <summary>
              <span className="dh">{t('how.disclosure.summary')}</span>
              <Icon name="i-chevron-down" />
            </summary>
            <div className="dbody">
              <dl className="dl-grid">
                {m.how.disclosure.items.map((item, i) => (
                  <div key={i}>
                    <dt>{item.term}</dt>
                    <dd>{item.def}</dd>
                  </div>
                ))}
              </dl>
              <p className="honesty" style={{ marginTop: 'var(--sp-6)' }}>
                <Icon name="i-alert" />
                <span>{t('how.disclosure.note')}</span>
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* ============== 03 · CREDENTIALS & SECURITY =================== */}
      <section className="sec sec--well" id="seguridad">
        <div className="container">
          <div className="editorial-head reveal">
            <span className="chapter-mark">
              {t('security.chapter')}
              <span className="of">{t('security.of')}</span>
            </span>
            <h2>{t('security.title')}</h2>
            <p className="aside">{t('security.aside')}</p>
          </div>

          <div className="guard reveal">
            <div className="guard-copy">
              <h3>{t('security.guard.title')}</h3>
              <p>{t('security.guard.body')}</p>

              <ul className="flist flist--gold">
                {m.security.guard.items.map((item, i) => (
                  <li key={i}>
                    <span className="fi">
                      <Icon name={GUARD_ICONS[i]} />
                    </span>
                    <span>
                      <b>{item.title}</b>
                      <span className="d">{item.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="app app--mini"
              role="img"
              aria-label={t('security.conn.aria')}
            >
              <div className="app-bar">
                <span className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="app-crumbs">
                  <b>{t('hero.badge')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('security.conn.crumb')}</span>
                </span>
                <span className="app-bar-right">
                  <span className="iconbtn">
                    <Icon name="i-lock" />
                  </span>
                  <span className="avatar">{t('app.avatar.value')}</span>
                </span>
              </div>
              <div className="app-pane">
                <div className="pane-head">
                  <div>
                    <p className="pane-title">{t('security.conn.title')}</p>
                    <p className="psub">{t('security.conn.sub')}</p>
                  </div>
                </div>

                <div className="conn">
                  {m.security.conn.rows.map((row, i) => (
                    <div className="crow" key={i}>
                      <span className="cico">
                        <Icon name="i-toll-gantry" />
                      </span>
                      <span className="ctx">
                        <b>{row.name.value}</b>
                        <small>{row.region}</small>
                      </span>
                      <span className="cfields">
                        <span className="cf">
                          <i>{t('security.conn.userLabel')}</i>
                          <em>{row.user.value}</em>
                        </span>
                        <span className="cf">
                          <i>{t('security.conn.passLabel')}</i>
                          <em>{row.pass.value}</em>
                        </span>
                      </span>
                      <span className="cright">
                        <Chip tone="ok">{row.status}</Chip>
                        <span className="fauxbtn">
                          <Icon name="i-refresh" />
                          {row.test}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="conn-note">
                  <Icon name="i-check-circle" />
                  <span>
                    <b>{t('security.conn.noteLead')}</b>
                    {t('security.conn.noteBody')}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <SampleDataNote>{a11y('sampleData')}</SampleDataNote>

          <div className="roles reveal">
            <div className="roles-head">
              <h3>{t('security.roles.title')}</h3>
              <p>{t('security.roles.sub')}</p>
            </div>

            <div className="tbl">
              <div className="tbl-scroll">
                <table className="data">
                  <caption className="sr-only">
                    {t('security.roles.caption')}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('security.roles.head.role')}</th>
                      <th scope="col">{t('security.roles.head.crossings')}</th>
                      <th scope="col">{t('security.roles.head.username')}</th>
                      <th scope="col">{t('security.roles.head.password')}</th>
                      <th scope="col">{t('security.roles.head.test')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.security.roles.rows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.role}</td>
                        <td data-label={t('security.roles.labels.crossings')}>
                          <Mark granted={ROLE_MARKS[i].crossings}>
                            {row.crossings}
                          </Mark>
                        </td>
                        <td data-label={t('security.roles.labels.username')}>
                          <Mark granted={ROLE_MARKS[i].username}>
                            {row.username}
                          </Mark>
                        </td>
                        <td data-label={t('security.roles.labels.password')}>
                          <span className="never">{row.password}</span>
                        </td>
                        <td data-label={t('security.roles.labels.test')}>
                          <Mark granted={ROLE_MARKS[i].test}>{row.test}</Mark>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="soc reveal">
            <div>
              <h4>
                {t('security.soc.certTitle')}{' '}
                <BuildingBadge label={common('building')} />
              </h4>
              <p>{t('security.soc.certBody')}</p>
            </div>
            <div>
              <h4>{t('security.soc.demoTitle')}</h4>
              <p>{t('security.soc.demoBody')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== 04 · COVERAGE ======================== */}
      <section className="sec" id="cobertura">
        <div className="container">
          <div className="editorial-head reveal">
            <span className="chapter-mark">
              {t('coverage.chapter')}
              <span className="of">{t('coverage.of')}</span>
            </span>
            <h2>{t('coverage.title')}</h2>
            <p className="aside">{t('coverage.aside')}</p>
          </div>

          <div className="cov reveal">
            <div className="tbl">
              <div className="tbl-scroll">
                <table className="data">
                  <caption className="sr-only">{t('coverage.caption')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('coverage.head.authority')}</th>
                      <th scope="col">{t('coverage.head.region')}</th>
                      <th scope="col">{t('coverage.head.frequency')}</th>
                      <th scope="col">{t('coverage.head.lookback')}</th>
                      <th scope="col">{t('coverage.head.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.coverage.rows.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <span className="pname">
                            <span className="pi">
                              <Icon name={COVERAGE_ICONS[i]} />
                            </span>
                            <b>{row.name.value}</b>
                          </span>
                        </td>
                        <td data-label={t('coverage.labels.region')}>
                          {row.region}
                        </td>
                        <td
                          data-label={t('coverage.labels.frequency')}
                          className="mono"
                        >
                          {row.frequency}
                        </td>
                        <td
                          data-label={t('coverage.labels.lookback')}
                          className="mono"
                        >
                          {row.lookback}
                        </td>
                        <td data-label={t('coverage.labels.status')}>
                          {i === 2 ? (
                            <BuildingBadge label={row.status} />
                          ) : i === 3 ? (
                            <Chip tone="neutral" dot={false}>
                              {row.status}
                            </Chip>
                          ) : (
                            <Chip tone="ok">{row.status}</Chip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="cov-note">
              <Icon name="i-info" />
              <span>{t('coverage.note.body')}</span>
              <Link className="cov-ask" href={routes.demo}>
                {t('coverage.note.ask')}
              </Link>
            </p>
          </div>

          <div className="toggle-band reveal">
            <div>
              <h2>{t('coverage.toggle.title')}</h2>
              <p>{t('coverage.toggle.body')}</p>
            </div>
            <div className="toggle-mods">
              {m.coverage.toggle.mods.map((mod, i) => (
                <div className={TOGGLE_MOD_CLASSES[i]} key={mod.name}>
                  <span className="tx">
                    <b>{mod.name}</b>
                    <small>{mod.sub}</small>
                  </span>
                  <span className="sw" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================= FAQ ============================= */}
      <section className="sec" id="faq">
        <div className="container">
          <div className="faq-split">
            <div className="faq reveal">
              {faqItems.map((item, i) => (
                <details key={i}>
                  <summary>
                    <span className="q">{item.q}</span>
                    <Icon name="i-chevron-down" />
                  </summary>
                  <p className="a">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================= CTA ============================= */}
      <section className="sec sec--cta cta-close" id="demo">
        <div className="container">
          <div className="cta-grid reveal">
            <div>
              <span className="cta-eyebrow">{t('cta.eyebrow')}</span>
              <h2>{t('cta.title')}</h2>
              <p className="cta-lede">{t('cta.lede')}</p>
              <div className="btn-row">
                <ButtonLink href={routes.demo} size="lg" icon="i-arrow-right">
                  {t('cta.primary')}
                </ButtonLink>
                <ButtonLink
                  href={routes.rideFleetManager}
                  tone="secondary"
                  size="lg"
                >
                  {t('cta.secondary')}
                </ButtonLink>
              </div>
              <p className="cta-list">
                {m.cta.list.map((item, i) => (
                  <span key={i}>
                    <Icon name="i-check" />
                    {item}
                  </span>
                ))}
              </p>
            </div>

            <div className="cta-agenda">
              <div className="ag-h">
                <b>{t('cta.agenda.title')}</b>
                <span>{t('cta.agenda.tag')}</span>
              </div>
              <ol>
                {m.cta.agenda.items.map((item, i) => (
                  <li key={i}>
                    <span className="ag-t">{item.t}</span>
                    <span>
                      <span className="ag-b">{item.b}</span>
                      <span className="ag-s">{item.s}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
