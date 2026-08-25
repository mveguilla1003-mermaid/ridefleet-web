import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/Icons';
import { JsonLd } from '@/components/JsonLd';
import { BuildingBadge, ButtonLink, Chip, SampleDataNote } from '@/components/ui';
import { Link, type Locale } from '@/i18n/routing';
import {
  breadcrumbSchema,
  buildMetadata,
  faqSchema,
  softwareSchema
} from '@/lib/seo';
import { hasPhone, routes, site } from '@/lib/site';
import { PickupSections } from './pickup-sections';

import '@/styles/pages/valet.css';

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

/**
 * `&middot;` separators in the static page are punctuation, not copy — they are
 * identical in both locales, so they live here rather than in the catalog where
 * the i18n gate would (rightly) flag them as untranslated.
 */
const DOT = ' · ';

const HERO_INDEX = [0, 1, 2, 3] as const;
const CALL_STEPS = [0, 1, 2, 3] as const;
const DIFF_ROWS = [0, 1, 2, 3] as const;
const DIFF_POINTS = [0, 1, 2] as const;
const RAIL_ITEMS = [0, 1, 2, 3, 4] as const;
const SPINE_ROWS = [0, 1, 2, 3, 4] as const;
const FAQ_ITEMS = [0, 1, 2, 3, 4, 5] as const;
const VOICE_FACTS = [0, 1, 2] as const;
const EMAIL_ROWS = [0, 1] as const;
const CTA_LIST = [0, 1, 2] as const;

/** Seven lines of the sample transcript, alternating assistant and caller. */
const TRANSCRIPT: { i: number; ai: boolean }[] = [
  { i: 0, ai: true },
  { i: 1, ai: false },
  { i: 2, ai: true },
  { i: 3, ai: false },
  { i: 4, ai: true },
  { i: 5, ai: false },
  { i: 6, ai: true }
];

/** Decorative waveform bars — count matches the static page exactly. */
const WAVE_BARS = Array.from({ length: 126 }, (_, i) => i);
const MINI_WAVE_BARS = Array.from({ length: 116 }, (_, i) => i);

const DIFF_ICONS: IconName[] = ['i-layers', 'i-globe', 'i-users', 'i-link'];
const DIFF_HREFS = ['#canales', '#llamar', '#columna', routes.rideFleetManager];

const RAIL_ICONS: IconName[] = [
  'i-phone',
  'i-sms',
  'i-dollar',
  'i-toll-gantry',
  'i-road'
];

const SPINE_ICONS: IconName[] = [
  'i-calendar',
  'i-clock',
  'i-dollar',
  'i-refresh',
  'i-shield'
];

const SPINE_CONFIRM: { tone: string; icon: IconName }[] = [
  { tone: 'chip--ok', icon: 'i-check' },
  { tone: 'chip--ok', icon: 'i-check' },
  { tone: 'chip--warn', icon: 'i-user' },
  { tone: 'chip--ok', icon: 'i-check' },
  { tone: 'chip--brand', icon: 'i-users' }
];

const AFTER_CALL_ICONS: IconName[] = ['i-check-circle', 'i-mail', 'i-clipboard'];

/** `01`, `02`, … — the ordinal chrome the static page hard-coded per element. */
function ord(i: number) {
  return String(i + 1).padStart(2, '0');
}

export default function ValetPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = useTranslations('valet');
  const nav = useTranslations('nav');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');

  const bold = { b: (chunks: ReactNode) => <b>{chunks}</b> };
  const mono = {
    mono: (chunks: ReactNode) => <span className="mono">{chunks}</span>
  };

  const telHref = hasPhone ? `tel:${site.phoneHref}` : '#llamar';

  const telBigInner = (
    <>
      <span className="ti" aria-hidden="true">
        <Icon name="i-phone" />
      </span>
      <span>
        <span className="tn">{site.phoneDisplay}</span>
        <span className="tk">{t('line.kicker')}</span>
      </span>
    </>
  );

  return (
    <>
      <JsonLd
        data={softwareSchema({
          locale: params.locale,
          name: 'Valet',
          description: t('meta.description'),
          path: routes.valet
        })}
      />
      <JsonLd
        data={breadcrumbSchema(params.locale, [
          { name: nav('home'), path: routes.home },
          { name: nav('valet'), path: routes.valet }
        ])}
      />
      <JsonLd
        data={faqSchema(
          FAQ_ITEMS.map((i) => ({
            q: t(`faq.items.${i}.q`),
            a: t(`faq.items.${i}.a`)
          }))
        )}
      />

      {/* ------------------------------------------------------------ hero --- */}
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <div className="hero-copy">
            <div>
              <span className="pbadge pbadge--voz">
                <span className="pi">
                  <Icon name="i-waveform" />
                </span>
                {t('hero.badge')}
              </span>

              <h1 className="display">
                {t('hero.titleLead')}
                <span className="t-teal">{t('hero.titleAccent')}</span>
              </h1>

              <p className="lede">{t('hero.lede')}</p>

              <div className="btn-row">
                <ButtonLink href={routes.demo} size="lg" icon="i-arrow-right">
                  {t('hero.ctaDemo')}
                </ButtonLink>
                {/* Icon leads the label here, so this cannot be `ButtonAnchor`. */}
                <a className="btn btn--secondary btn--lg" href="#llamar">
                  <Icon name="i-phone" />
                  {t('hero.ctaCall')}
                </a>
              </div>

              <p className="hero-note">
                <span>{t('hero.note.channels')}</span>
                <i aria-hidden="true" />
                <span>{t('hero.note.languages')}</span>
                <i aria-hidden="true" />
                <span>{t('hero.note.hours')}</span>
                <i aria-hidden="true" />
                <span>{t('hero.note.spine')}</span>
              </p>
            </div>

            <div className="hero-idx">
              <span className="ix-lab">{t('hero.index.label')}</span>
              <ul className="hero-index">
                {HERO_INDEX.map((i) => (
                  <li key={i}>
                    <span className="ix">{ord(i)}</span>
                    <span>
                      <b>{t(`hero.index.items.${i}.title`)}</b>
                      <span className="d">{t(`hero.index.items.${i}.desc`)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <a className="ix-more" href="#diferencia">
                {t('hero.index.more')}
                <Icon name="i-arrow-right" />
              </a>
            </div>
          </div>

          {/* -------------------------------------------- sample call console --- */}
          <div className="reveal stage app-stage">
            <div className="amb amb--voz" aria-hidden="true" />
            <div className="app" role="group" aria-label={t('console.label')}>
              <div className="app-bar">
                <div className="app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="app-crumbs">
                  <b>{t('hero.badge')}</b>
                  <Icon name="i-chevron" />
                  <span>{t('console.crumbSection')}</span>
                  <Icon name="i-chevron" />
                  <span>{t('console.crumb.code')}</span>
                </div>
                <div className="app-bar-right">
                  <Chip tone="neutral" dot={false}>
                    <Icon name="i-info" />
                    <span>{t('console.sampleChip')}</span>
                  </Chip>
                  <span className="iconbtn" aria-hidden="true">
                    <Icon name="i-bell" />
                  </span>
                  <span className="avatar" aria-hidden="true">
                    {t('console.agent.value')}
                  </span>
                </div>
              </div>

              <div className="app-body voz-body">
                <div className="voz-main">
                  <div className="callhead">
                    <span className="av" aria-hidden="true">
                      <Icon name="i-robot" />
                    </span>
                    <span className="idt">
                      <b>{t('console.call.persona')}</b>
                      <span>{t('console.call.line')}</span>
                    </span>
                    <span className="hr">
                      <Chip tone="teal" dot={false}>
                        <Icon name="i-globe" />
                        <span>{t('console.call.lang.value')}</span>
                      </Chip>
                      <span className="ctimer">
                        <Icon name="i-clock" />
                        {t('console.call.timer')}
                      </span>
                    </span>
                  </div>

                  <div className="waveband">
                    <span className="wlab">{t('console.wave.label')}</span>
                    <span className="wave" aria-hidden="true">
                      {WAVE_BARS.map((i) => (
                        <i key={i} />
                      ))}
                    </span>
                    <Chip tone="ok">
                      <span>{t('console.wave.status')}</span>
                    </Chip>
                  </div>

                  <div className="transcript">
                    {TRANSCRIPT.map(({ i, ai }) => {
                      const lang = t(`console.transcript.lines.${i}.lt`).toLowerCase();
                      return (
                        <div
                          key={i}
                          className={ai ? 'tl tl--ai' : 'tl tl--caller'}
                        >
                          <span className="ts">
                            {t(`console.transcript.lines.${i}.ts`)}
                          </span>
                          <div className="bub">
                            <span className="spk">
                              <span className="nm">
                                {ai
                                  ? t('console.transcript.ai')
                                  : t('console.transcript.caller')}
                              </span>
                              <span className="lt">
                                {t(`console.transcript.lines.${i}.lt`)}
                              </span>
                            </span>
                            <p lang={lang}>
                              {t(`console.transcript.lines.${i}.value`)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="acts">
                    <span className="alab">{t('console.acts.label')}</span>
                    <ol>
                      <li>
                        <span className="at">{t('console.acts.a1.at')}</span>
                        <b className="ab">{t('console.acts.a1.title')}</b>
                        <span className="ad">
                          {t('console.acts.a1.code')}
                          {DOT}
                          <span className="plate">{t('console.acts.a1.plate')}</span>
                        </span>
                        <span className="atag">{t('console.acts.a1.tag')}</span>
                      </li>
                      <li>
                        <span className="at">{t('console.acts.a2.at')}</span>
                        <b className="ab">{t('console.acts.a2.title')}</b>
                        <span className="ad">
                          {t('console.acts.a2.value')}
                          {DOT}
                          <span className="money">{t('console.acts.a2.amount')}</span>
                        </span>
                        <span className="atag">{t('console.acts.a2.tag')}</span>
                      </li>
                      <li>
                        <span className="at">{t('console.acts.a3.at')}</span>
                        <b className="ab">{t('console.acts.a3.title')}</b>
                        <span className="ad">
                          {t('console.acts.a3.detail')}
                          <span className="money">{t('console.acts.a3.amount')}</span>
                        </span>
                        <span className="atag atag--w">
                          {t('console.acts.a3.tag')}
                        </span>
                      </li>
                      <li>
                        <span className="at">{t('console.acts.a4.at')}</span>
                        <b className="ab">{t('console.acts.a4.title')}</b>
                        <span className="ad">{t('console.acts.a4.detail')}</span>
                        <span className="atag atag--h">
                          {t('console.acts.a4.tag')}
                        </span>
                      </li>
                    </ol>
                    <p className="afoot">{t.rich('console.acts.foot', bold)}</p>
                  </div>

                  <p className="tcap">{t('console.transcript.caption')}</p>
                </div>

                <aside className="voz-side">
                  <div className="vs-grp">
                    <span className="vs-lab">{t('console.record.label')}</span>
                    <div className="reskit">
                      <div className="rk">
                        <span className="k">{t('console.record.booking.k')}</span>
                        <span className="v">
                          {t('console.record.booking.value')}
                        </span>
                      </div>
                      <div className="rk">
                        <span className="k">{t('console.record.customer.k')}</span>
                        <span className="v">
                          {t('console.record.customer.value')}
                        </span>
                      </div>
                      <div className="rk">
                        <span className="k">{t('console.record.unit.k')}</span>
                        <span className="v">
                          {t('console.record.unit.value')}
                          {DOT}
                          <span className="plate">
                            {t('console.record.unit.plate')}
                          </span>
                        </span>
                      </div>
                      <div className="rk">
                        <span className="k">{t('console.record.due.k')}</span>
                        <span className="v">{t('console.record.due.value')}</span>
                      </div>
                      <div className="rk">
                        <span className="k">{t('console.record.tolls.k')}</span>
                        <span className="v money">
                          {t('console.record.tolls.amount')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="vs-grp">
                    <span className="vs-lab">{t('console.intent.label')}</span>
                    <div className="intent">
                      {DIFF_POINTS.map((i) => {
                        const score = Number(t(`console.intent.items.${i}.score`));
                        return (
                          <div className="ir" key={i}>
                            <span>{t(`console.intent.items.${i}.label`)}</span>
                            <span
                              className={score < 0.75 ? 'conf conf--low' : 'conf'}
                            >
                              <span className="bar" aria-hidden="true">
                                <i style={{ width: `${Math.round(score * 100)}%` }} />
                              </span>
                              <b>{t(`console.intent.items.${i}.score`)}</b>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="vs-grp">
                    <span className="vs-lab">{t('console.handoff.label')}</span>
                    <div className="handoff">
                      <span className="ht">
                        <Icon name="i-users" />
                        {t('console.handoff.title')}
                      </span>
                      <p>{t('console.handoff.body')}</p>
                      <span className="hrow" aria-hidden="true">
                        <span className="fauxbtn fauxbtn--p">
                          <Icon name="i-phone" />
                          {t('console.handoff.primary')}
                        </span>
                        <span className="fauxbtn fauxbtn--s">
                          {t('console.handoff.secondary')}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="vs-grp vs-grp--tail">
                    <span className="vs-lab">{t('console.after.label')}</span>
                    <ul className="aftercall">
                      <li>
                        <Icon name={AFTER_CALL_ICONS[0]} />
                        <span>
                          <b>{t('console.after.summary.title')}</b>
                          <span className="ac-d">
                            {t('console.after.summary.value')}
                          </span>
                        </span>
                      </li>
                      <li>
                        <Icon name={AFTER_CALL_ICONS[1]} />
                        <span>
                          <b>{t('console.after.confirm.title')}</b>
                          <span className="ac-d">
                            {t('console.after.confirm.detail')}
                            <span className="money">
                              {t('console.after.confirm.amount')}
                            </span>
                          </span>
                        </span>
                      </li>
                      <li>
                        <Icon name={AFTER_CALL_ICONS[2]} />
                        <span>
                          <b>{t('console.after.case.title')}</b>
                          <span className="ac-d">
                            {t('console.after.case.detail')}
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
          </div>

          <SampleDataNote>{a11y('sampleData')}</SampleDataNote>
        </div>
      </section>

      {/* --------------------------------------------------- call it yourself --- */}
      <section className="sec band" id="llamar">
        <div className="container">
          <div className="callblock">
            <div className="reveal">
              <span className="eyebrow eyebrow--teal">
                <span className="dot" aria-hidden="true" />
                {t('line.eyebrow')}
              </span>
              <h2 className="t-h2" style={{ marginTop: 'var(--sp-5)' }}>
                {t('line.title')}
              </h2>
              <p className="lede" style={{ marginTop: 'var(--sp-5)' }}>
                {t.rich('line.lede', mono)}
              </p>

              {/*
                The demo line is not provisioned yet: `hasPhone` is false until the
                carrier hands over a number, so this renders as a non-interactive
                plate rather than a `tel:` link that would dial nothing.
              */}
              {hasPhone ? (
                <a
                  className="telbig"
                  href={telHref}
                  aria-describedby="telNote"
                  style={{ marginTop: 'var(--sp-8)' }}
                >
                  {telBigInner}
                </a>
              ) : (
                <span
                  className="telbig"
                  aria-describedby="telNote"
                  style={{ marginTop: 'var(--sp-8)' }}
                >
                  {telBigInner}
                </span>
              )}

              <p className="tel-note" id="telNote">
                <BuildingBadge label={common('building')} />{' '}
                {t('line.note')}
              </p>
            </div>

            <div className="reveal reveal-2">
              <ul className="callsteps">
                {CALL_STEPS.map((i) => (
                  <li key={i}>
                    <span className="sn">{ord(i)}</span>
                    <span>
                      <b>{t(`line.steps.${i}.title`)}</b>
                      <span className="d">{t(`line.steps.${i}.desc`)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="btn-row" style={{ marginTop: 'var(--sp-8)' }}>
                <ButtonLink
                  href={routes.demo}
                  tone="secondary"
                  icon="i-arrow-right"
                >
                  {t('line.cta')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- 01 · the difference --- */}
      <section className="sec dif" id="diferencia">
        <div className="container">
          <div className="editorial-head">
            <span className="chapter-mark">
              01<span className="of">{t('chapterOf')}</span>
            </span>
            <h2 className="t-h2">{t('difference.title')}</h2>
            <p className="aside">{t('difference.aside')}</p>
          </div>

          {DIFF_ROWS.map((i) => (
            <div className="reveal ed-row" key={i}>
              <div className="dmark">
                <span className="dn">{ord(i)}</span>
                <span className="dic" aria-hidden="true">
                  <Icon name={DIFF_ICONS[i]} />
                </span>
              </div>
              <div className="lhs">
                <h3>{t(`difference.items.${i}.title`)}</h3>
                <p className="dsub">{t(`difference.items.${i}.sub`)}</p>
                {/*
                  Three of these are in-page anchors; the fourth crosses to
                  another route, so it goes through `Link` to pick up the locale
                  prefix.
                */}
                {DIFF_HREFS[i].startsWith('#') ? (
                  <a className="dnote" href={DIFF_HREFS[i]}>
                    {t(`difference.items.${i}.note`)}
                    <Icon name="i-arrow-right" />
                  </a>
                ) : (
                  <Link className="dnote" href={DIFF_HREFS[i]}>
                    {t(`difference.items.${i}.note`)}
                    <Icon name="i-arrow-right" />
                  </Link>
                )}
              </div>
              <ul className="ed-list">
                {DIFF_POINTS.map((p) => (
                  <li key={p}>
                    <b>{t(`difference.items.${i}.points.${p}.title`)}</b>
                    {t(`difference.items.${i}.points.${p}.text`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ 02 · channels --- */}
      <section className="sec sec--alt" id="canales">
        <div className="container">
          <div className="editorial-head">
            <span className="chapter-mark">
              02<span className="of">{t('chapterOf')}</span>
            </span>
            <h2 className="t-h2">{t('channels.title')}</h2>
            <p className="aside">{t('channels.aside')}</p>
          </div>

          <div className="reveal chan-grid">
            <div className="chan chan--lead">
              <div className="chan-h">
                <span className="ci" aria-hidden="true">
                  <Icon name="i-phone" />
                </span>
                <h3>{t('channels.voice.value')}</h3>
                <span className="cn">01</span>
              </div>
              <p>{t('channels.voice.body')}</p>
              <ul className="chan-facts">
                {VOICE_FACTS.map((i) => (
                  <li key={i}>{t(`channels.voice.facts.${i}`)}</li>
                ))}
              </ul>
              <div className="mini">
                <span className="mhead">
                  <Icon name="i-mic" />
                  {t('channels.voice.mini.head')}
                </span>
                <div className="mailrow">
                  <span className="miniwave" aria-hidden="true">
                    {MINI_WAVE_BARS.map((i) => (
                      <i key={i} />
                    ))}
                  </span>
                  <span className="mtime">{t('channels.voice.mini.time')}</span>
                </div>
                <div className="msg msg--in">
                  {t('channels.voice.mini.in.text')}
                </div>
                <div className="msg msg--out">
                  {t('channels.voice.mini.out.text')}
                  <span className="mm">{t('channels.voice.mini.out.value')}</span>
                </div>
              </div>
            </div>

            <div className="chan">
              <div className="chan-h">
                <span className="ci" aria-hidden="true">
                  <Icon name="i-message" />
                </span>
                <h3>{t('channels.chat.value')}</h3>
                <span className="cn">02</span>
              </div>
              <p>{t('channels.chat.body')}</p>
              <div className="mini">
                <span className="mhead">
                  <Icon name="i-message" />
                  {t('channels.chat.mini.head')}
                </span>
                <div className="msg msg--in">
                  {t('channels.chat.mini.in.text')}
                  <span className="mm">{t('channels.chat.mini.in.value')}</span>
                </div>
                <div className="msg msg--out">
                  {t('channels.chat.mini.out.text')}
                  <span className="mm">{t('channels.chat.mini.out.value')}</span>
                </div>
              </div>
            </div>

            <div className="chan">
              <div className="chan-h">
                <span className="ci" aria-hidden="true">
                  <Icon name="i-mail" />
                </span>
                <h3>{t('channels.email.value')}</h3>
                <span className="cn">03</span>
              </div>
              <p>{t('channels.email.body')}</p>
              <div className="mini">
                <span className="mhead">
                  <Icon name="i-mail" />
                  {t('channels.email.mini.head')}
                </span>
                {EMAIL_ROWS.map((i) => (
                  <div className="mailrow" key={i}>
                    <span
                      className="mdot"
                      aria-hidden="true"
                      style={i === 1 ? { background: 'var(--gold-500)' } : undefined}
                    />
                    <span className="msub">
                      {t(`channels.email.mini.rows.${i}.text`)}
                    </span>
                    <span className="mtime">
                      {t(`channels.email.mini.rows.${i}.value`)}
                    </span>
                  </div>
                ))}
                <span
                  className="chip chip--warn"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Icon name="i-user" />
                  {t('channels.email.mini.chip')}
                </span>
              </div>
            </div>

            <div className="chan">
              <div className="chan-h">
                <span className="ci" aria-hidden="true">
                  <Icon name="i-sms" />
                </span>
                <h3>{t('channels.sms.value')}</h3>
                <span className="cn">04</span>
              </div>
              <p>
                {t('channels.sms.body')}{' '}
                <BuildingBadge label={common('building')} />
              </p>
              <div className="mini">
                <span className="mhead">
                  <Icon name="i-sms" />
                  {t('channels.sms.mini.head')}
                </span>
                <div className="msg msg--out">
                  {t('channels.sms.mini.out.text')}
                  <span className="mm">{t('channels.sms.mini.out.value')}</span>
                </div>
                <div className="msg msg--in">
                  {t('channels.sms.mini.in.text')}
                  <span className="mm">{t('channels.sms.mini.in.value')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- runs on --- */}
      <div className="trust trust--rail">
        <div className="container">
          <div className="rail">
            <div className="rail-lab">
              <span className="caps">{t('rail.label')}</span>
              <p>{t('rail.body')}</p>
            </div>
            <ul className="rail-list">
              {RAIL_ITEMS.map((i) => (
                <li key={i}>
                  <Icon name={RAIL_ICONS[i]} />
                  <b>{t(`rail.items.${i}.value`)}</b>
                  <span>{t(`rail.items.${i}.label`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- 03 · spine --- */}
      <section className="sec" id="columna">
        <div className="container">
          <div className="editorial-head">
            <span className="chapter-mark">
              03<span className="of">{t('chapterOf')}</span>
            </span>
            <h2 className="t-h2">{t('spine.title')}</h2>
            <p className="aside">{t('spine.aside')}</p>
          </div>

          <div className="reveal tbl">
            <div className="tbl-scroll">
              <table className="data">
                <caption className="sr-only">{t('spine.table.caption')}</caption>
                <thead>
                  <tr>
                    <th className="th-strong" scope="col">
                      {t('spine.table.headers.situation')}
                    </th>
                    <th scope="col">{t('spine.table.headers.does')}</th>
                    <th scope="col">{t('spine.table.headers.touches')}</th>
                    <th scope="col">{t('spine.table.headers.confirms')}</th>
                  </tr>
                </thead>
                <tbody>
                  {SPINE_ROWS.map((i) => (
                    <tr key={i}>
                      <td>
                        <span className="cell-sit">
                          <span className="si" aria-hidden="true">
                            <Icon name={SPINE_ICONS[i]} />
                          </span>
                          <span>
                            <b>{t(`spine.table.rows.${i}.title`)}</b>
                            <small>{t(`spine.table.rows.${i}.sub`)}</small>
                          </span>
                        </span>
                      </td>
                      <td>{t(`spine.table.rows.${i}.does`)}</td>
                      <td>{t(`spine.table.rows.${i}.touches`)}</td>
                      <td>
                        <span className={`chip ${SPINE_CONFIRM[i].tone}`}>
                          <Icon name={SPINE_CONFIRM[i].icon} />
                          {t(`spine.table.rows.${i}.confirm`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tbl-foot">
              <span>{t('spine.table.foot')}</span>
              <span className="r">
                <span className="swipe" aria-hidden="true">
                  {t('spine.table.swipe')}
                  <Icon name="i-arrow-right" />
                </span>
                <span>{t('spine.table.updated')}</span>
              </span>
            </div>
          </div>

          <div className="spine-note">
            <div>
              <p>{t('spine.note')}</p>
            </div>
            <div className="sn-cta">
              <span className="k">{t('spine.check.k')}</span>
              <span className="v">{t('spine.check.v')}</span>
              <a className="ix-more" href="#llamar" style={{ marginTop: 0 }}>
                {t('spine.check.link')}
                <Icon name="i-arrow-right" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- 04 · airport pickup --- */}
      {/* Was its own route, /valet, until this page took that path. It sits
          after the spine on purpose: the arc only makes sense once the reader
          knows Valet answers the phone and Ride Fleet Manager holds the
          record. See pickup-sections.tsx for what must not be softened. */}
      <PickupSections locale={params.locale} />

      {/* ------------------------------------------------ faq + design partner --- */}
      <section className="sec sec--alt" id="faq">
        <div className="container">
          <div className="faq-split">
            <div>
              <p
                className="caps t-muted"
                style={{ marginBottom: 'var(--sp-4)' }}
              >
                {t('faq.label')}
              </p>
              {/*
                Plain `<details>` rather than the shared `<Faq>`: this page's CSS
                styles `.faq details`, `summary .q` and `.faq .a`, which the shared
                component's `.faq-item` / `.faq-body` markup does not produce.
              */}
              <div className="faq">
                {FAQ_ITEMS.map((i) => (
                  <details key={i} open={i === 0}>
                    <summary>
                      <span className="q">{t(`faq.items.${i}.q`)}</span>
                      <Icon name="i-chevron-down" />
                    </summary>
                    <div className="a">{t(`faq.items.${i}.a`)}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- module row --- */}
      <section className="sec sec--tight">
        <div className="container">
          <div
            className="sec-head sec-head--split"
            style={{ marginBottom: 0 }}
          >
            <div>
              <span className="eyebrow eyebrow--neutral">
                <span className="dot" aria-hidden="true" />
                {t('toggle.eyebrow')}
              </span>
              <h2 className="t-h2">{t('toggle.title')}</h2>
            </div>
            <p className="sub">{t('toggle.sub')}</p>
          </div>

          <div className="toggle-row">
            <Link className="tgl tgl--rfm" href={routes.rideFleetManager}>
              <span className="th">
                <Icon name="i-vehicle" />
                <b>{t('toggle.rfm.title')}</b>
              </span>
              <p>{t('toggle.rfm.body')}</p>
              <span className="link-arrow">
                {t('toggle.see')}
                <Icon name="i-arrow-right" />
              </span>
            </Link>
            <Link className="tgl tgl--toll" href={routes.tollBridge}>
              <span className="th">
                <Icon name="i-toll-gantry" />
                <b>{t('toggle.toll.title')}</b>
              </span>
              <p>{t('toggle.toll.body')}</p>
              <span className="link-arrow link-arrow--gold">
                {t('toggle.see')}
                <Icon name="i-arrow-right" />
              </span>
            </Link>
            {/* This page — a span, not a link, so it is not a target of itself. */}
            <span className="tgl tgl--voz is-here" aria-current="page">
              <span className="th">
                <Icon name="i-waveform" />
                <b>{t('toggle.voz.title')}</b>
              </span>
              <p>{t('toggle.voz.body')}</p>
              <span className="caps t-teal">{t('toggle.here')}</span>
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- final cta --- */}
      <section className="sec sec--flush-top" id="demo">
        <div className="container">
          <div className="cta-band cta-band--split">
            <div className="cta-l">
              <span className="eyebrow eyebrow--teal">
                <span className="dot" aria-hidden="true" />
                {t('cta.eyebrow')}
              </span>
              <h2 className="t-h2" style={{ marginTop: 'var(--sp-5)' }}>
                {t('cta.title')}
              </h2>
              <p>{t('cta.body')}</p>
            </div>
            <div className="cta-r">
              <div className="btn-row">
                <ButtonLink href={routes.demo} size="lg" icon="i-arrow-right">
                  {t('cta.demo')}
                </ButtonLink>
                {/* Icon leads the label, and the href degrades to the anchor
                    while the line is unprovisioned. */}
                <a className="btn btn--teal btn--lg" href={telHref}>
                  <Icon name="i-phone" />
                  {t('cta.call', { phone: site.phoneDisplay })}
                </a>
              </div>
              <div className="cta-list">
                {CTA_LIST.map((i) => (
                  <span key={i}>
                    <Icon name="i-check" />
                    <span>{t(`cta.list.${i}`)}</span>
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
