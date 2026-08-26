'use client';

/**
 * The booking form — the whole point of this page.
 *
 * Everything stateful on 05-book-demo.html lives here so `page.tsx` stays a
 * server component: field values, the `is-on` tile/pill states, the qualifying
 * routing note under "fleet size", inline errors and the `role="alert"` error
 * summary.
 *
 * Spam screening mirrors `src/app/api/lead/route.ts` exactly: a `company_website`
 * honeypot that a human never sees, and `elapsedMs` measured from mount to
 * submit — the API discards anything completed in under three seconds. A
 * discarded submission still answers `{ ok: true }`, so a bot cannot tell it was
 * caught, and we send the visitor to the same thank-you page either way.
 *
 * The static page rendered its confirmation inline. Here the success state is a
 * real route (`routes.demoThankYou`), reached with `useRouter` from
 * `@/i18n/routing` so the `/es` | `/en` prefix survives the navigation.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { routes } from '@/lib/site';
import { Icon } from '@/components/Icons';
import { BuildingBadge } from '@/components/ui';

type FieldKey =
  | 'name'
  | 'company'
  | 'email'
  | 'phone'
  | 'operation'
  | 'fleetSize'
  | 'consent';

/** DOM ids kept verbatim from the static page — the CSS and the labels use them. */
const FIELD_ID: Record<FieldKey, string> = {
  name: 'f-name',
  company: 'f-company',
  email: 'f-email',
  phone: 'f-phone',
  operation: 'f-op',
  fleetSize: 'f-size',
  consent: 'f-consent'
};

/** Order matters: the error summary lists problems in the order they appear. */
const FIELD_ORDER: FieldKey[] = [
  'name',
  'company',
  'email',
  'phone',
  'operation',
  'fleetSize',
  'consent'
];

/* 'carsharing' was dropped on 2026-08-17 along with the rest of the
   car-sharing story — the site no longer offers that model, so the form must
   not collect it. Anyone who ran that operation picks 'other' and says so in
   the message field. */
const OPERATIONS = ['rental', 'loaner', 'other'] as const;

const FLEET_SIZES = [
  { key: 'r1', value: '1-9' },
  { key: 'r2', value: '10-49' },
  { key: 'r3', value: '50-149' },
  { key: 'r4', value: '150-499' },
  { key: 'r5', value: '500+' }
] as const;

const PRODUCTS = [
  { key: 'rfm', id: 'p-rfm', value: 'fleet-manager', icon: 'i-vehicle' },
  { key: 'toll', id: 'p-toll', value: 'toll-bridge', icon: 'i-toll-gantry' },
  { key: 'voz', id: 'p-voz', value: 'valet', icon: 'i-waveform' }
] as const;

const DEMO_LANGUAGES = [
  { key: 'es', id: 'l-es', value: 'es' },
  { key: 'en', id: 'l-en', value: 'en' }
] as const;

/** The size band below which a guided demo is honestly too much. */
const SMALL_FLEET = '1-9';

/** Same test the API applies, so the two never disagree about one address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content'
] as const;

export function DemoForm() {
  const t = useTranslations('demo');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [operation, setOperation] = useState('');
  const [fleetSize, setFleetSize] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [demoLanguage, setDemoLanguage] = useState<string>('es');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<FieldKey[]>([]);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(0);
  const attribution = useRef<Record<string, string>>({});

  /**
   * Attribution and the timing baseline are read once, on mount: `useEffect`
   * never runs on the server, so this is also the guarantee that the markup
   * rendered on the server and in the browser is identical.
   */
  useEffect(() => {
    mountedAt.current = Date.now();
    const params = new URLSearchParams(window.location.search);
    const captured: Record<string, string> = {};
    for (const key of UTM_KEYS) captured[key] = params.get(key) ?? '';
    captured.referrer = document.referrer;
    captured.landingPath = window.location.pathname;
    attribution.current = captured;
  }, []);

  const messages = useMemo<Record<FieldKey, string>>(
    () => ({
      name: t('form.errors.name'),
      company: t('form.errors.company'),
      email: t('form.errors.email'),
      phone: t('form.errors.phone'),
      operation: t('form.errors.operation'),
      fleetSize: t('form.errors.fleetSize'),
      consent: t('form.errors.consent')
    }),
    [t]
  );

  const [networkError, setNetworkError] = useState(false);

  function validate(): FieldKey[] {
    const found: FieldKey[] = [];
    if (!name.trim()) found.push('name');
    if (!company.trim()) found.push('company');
    if (!EMAIL.test(email.trim())) found.push('email');
    if (!phone.trim()) found.push('phone');
    if (!operation) found.push('operation');
    if (!fleetSize) found.push('fleetSize');
    if (!consent) found.push('consent');
    return found;
  }

  /** Re-validating on change would shout at someone mid-word; only after a failed submit. */
  function clearOnEdit(field: FieldKey) {
    if (!failed) return;
    setErrors((current) => current.filter((key) => key !== field));
  }

  function toggleProduct(value: string) {
    setProducts((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    setNetworkError(false);
    const found = validate();
    setErrors(found);

    if (found.length) {
      setFailed(true);
      // The summary is `role="alert"`, so it announces; focusing it also puts
      // the keyboard where the links to the offending fields are.
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          fleetSize,
          businessModel: operation,
          products,
          demoLanguage,
          notes: notes.trim(),
          consent,
          locale,
          company_website: honeypot,
          elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : 0,
          ...attribution.current
        })
      });

      const result = (await response.json()) as {
        ok?: boolean;
        fields?: string[];
      };

      if (response.ok && result.ok) {
        router.push(routes.demoThankYou);
        return;
      }

      // 422 from the API: surface it on the same fields the client checks.
      const returned = (result.fields ?? []).filter((field): field is FieldKey =>
        FIELD_ORDER.includes(field as FieldKey)
      );
      if (returned.length) {
        setErrors(returned);
        setFailed(true);
        window.requestAnimationFrame(() => summaryRef.current?.focus());
      } else {
        setNetworkError(true);
        setFailed(true);
        window.requestAnimationFrame(() => summaryRef.current?.focus());
      }
      setSending(false);
    } catch {
      setNetworkError(true);
      setFailed(true);
      setSending(false);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  const has = (field: FieldKey) => errors.includes(field);
  const errorId = (field: FieldKey) => `err-${field}`;
  const describedBy = (field: FieldKey, ...extra: string[]) => {
    const ids = [...extra];
    if (has(field)) ids.push(errorId(field));
    return ids.length ? ids.join(' ') : undefined;
  };

  const summaryVisible = failed && (errors.length > 0 || networkError);

  return (
    <>
      {summaryVisible && (
        <div className="errsum" id="errSum" role="alert" tabIndex={-1} ref={summaryRef}>
          <b>
            <Icon name="i-alert" />
            {t('form.errorSummary')}
          </b>
          <ul>
            {FIELD_ORDER.filter(has).map((field) => (
              <li key={field}>
                <a href={`#${FIELD_ID[field]}`}>{messages[field]}</a>
              </li>
            ))}
            {networkError && <li>{t('form.errors.network')}</li>}
          </ul>
        </div>
      )}

      <form id="demoForm" noValidate onSubmit={handleSubmit}>
        <div className="form-head">
          <div>
            <h2>{t('form.title')}</h2>
            <p className="fsub">{t('form.sub')}</p>
          </div>
          <span className="form-step">{t('form.step')}</span>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor={FIELD_ID.name}>
              {t('form.name.label')}
              <span className="req" aria-hidden="true">
                {t('form.requiredMark')}
              </span>
            </label>
            <input
              className="input"
              id={FIELD_ID.name}
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={has('name') || undefined}
              aria-describedby={describedBy('name')}
              placeholder={t('form.name.placeholder')}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearOnEdit('name');
              }}
            />
            {has('name') && (
              <p className="error" id={errorId('name')}>
                {messages.name}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor={FIELD_ID.company}>
              {t('form.company.label')}
              <span className="req" aria-hidden="true">
                {t('form.requiredMark')}
              </span>
            </label>
            <input
              className="input"
              id={FIELD_ID.company}
              name="company"
              type="text"
              autoComplete="organization"
              required
              aria-required="true"
              aria-invalid={has('company') || undefined}
              aria-describedby={describedBy('company')}
              placeholder={t('form.company.placeholder')}
              value={company}
              onChange={(event) => {
                setCompany(event.target.value);
                clearOnEdit('company');
              }}
            />
            {has('company') && (
              <p className="error" id={errorId('company')}>
                {messages.company}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor={FIELD_ID.email}>
              {t('form.email.label')}
              <span className="req" aria-hidden="true">
                {t('form.requiredMark')}
              </span>
            </label>
            <input
              className="input"
              id={FIELD_ID.email}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-required="true"
              aria-invalid={has('email') || undefined}
              aria-describedby={describedBy('email', 'help-email')}
              placeholder={t('form.email.placeholder')}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearOnEdit('email');
              }}
            />
            <p className="help" id="help-email">
              {t('form.email.help')}
            </p>
            {has('email') && (
              <p className="error" id={errorId('email')}>
                {messages.email}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor={FIELD_ID.phone}>
              {t('form.phone.label')}
              <span className="req" aria-hidden="true">
                {t('form.requiredMark')}
              </span>
            </label>
            <input
              className="input"
              id={FIELD_ID.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              aria-required="true"
              aria-invalid={has('phone') || undefined}
              aria-describedby={describedBy('phone', 'help-phone')}
              placeholder={t('form.phone.placeholder')}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                clearOnEdit('phone');
              }}
            />
            <p className="help" id="help-phone">
              {t('form.phone.help')}
            </p>
            {has('phone') && (
              <p className="error" id={errorId('phone')}>
                {messages.phone}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor={FIELD_ID.operation}>
              {t('form.operation.label')}
              <span className="req" aria-hidden="true">
                {t('form.requiredMark')}
              </span>
            </label>
            <select
              className="select"
              id={FIELD_ID.operation}
              name="operation"
              required
              aria-required="true"
              aria-invalid={has('operation') || undefined}
              aria-describedby={describedBy('operation')}
              value={operation}
              onChange={(event) => {
                setOperation(event.target.value);
                clearOnEdit('operation');
              }}
            >
              <option value="">{t('form.operation.options.empty')}</option>
              {OPERATIONS.map((key) => (
                <option key={key} value={key}>
                  {t(`form.operation.options.${key}`)}
                </option>
              ))}
            </select>
            {has('operation') && (
              <p className="error" id={errorId('operation')}>
                {messages.operation}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor={FIELD_ID.fleetSize}>
              {t('form.fleetSize.label')}
              <span className="req" aria-hidden="true">
                {t('form.requiredMark')}
              </span>
            </label>
            <select
              className="select"
              id={FIELD_ID.fleetSize}
              name="fleetSize"
              required
              aria-required="true"
              aria-invalid={has('fleetSize') || undefined}
              aria-describedby={describedBy('fleetSize', 'help-size')}
              value={fleetSize}
              onChange={(event) => {
                setFleetSize(event.target.value);
                clearOnEdit('fleetSize');
              }}
            >
              <option value="">{t('form.fleetSize.options.empty')}</option>
              {FLEET_SIZES.map((size) => (
                <option key={size.key} value={size.value}>
                  {t(`form.fleetSize.options.${size.key}`)}
                </option>
              ))}
            </select>
            <p className="help" id="help-size">
              {t('form.fleetSize.help')}
            </p>
            {has('fleetSize') && (
              <p className="error" id={errorId('fleetSize')}>
                {messages.fleetSize}
              </p>
            )}
            {fleetSize === SMALL_FLEET && (
              <div className="routing" id="routing">
                <Icon name="i-info" />
                <p>
                  <b>{t('form.fleetSize.routing.lead')}</b>{' '}
                  {t('form.fleetSize.routing.body')}{' '}
                  <BuildingBadge label={common('building')} />{' '}
                  {t('form.fleetSize.routing.tail')}
                </p>
              </div>
            )}
          </div>

          <fieldset className="fieldset-b field--full">
            <legend>
              {t('form.products.legend')}
              <span className="opt-tag">{t('form.products.optTag')}</span>
            </legend>
            <div className="choices">
              {PRODUCTS.map((product) => {
                const checked = products.includes(product.value);
                return (
                  <label
                    className={checked ? 'choice is-on' : 'choice'}
                    htmlFor={product.id}
                    key={product.key}
                  >
                    <input
                      type="checkbox"
                      id={product.id}
                      name="products"
                      value={product.value}
                      checked={checked}
                      onChange={() => toggleProduct(product.value)}
                    />
                    <span className="ct">
                      <span className="cn">
                        <Icon name={product.icon} />
                        {t(`form.products.${product.key}.value`)}
                      </span>
                      <span className="cd">
                        {t(`form.products.${product.key}.desc`)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="fieldset-b field--full">
            <legend>{t('form.demoLanguage.legend')}</legend>
            <div
              className="langpick"
              role="radiogroup"
              aria-label={t('form.demoLanguage.legend')}
            >
              {DEMO_LANGUAGES.map((option) => (
                <label
                  className={
                    demoLanguage === option.value ? 'lopt is-on' : 'lopt'
                  }
                  htmlFor={option.id}
                  key={option.key}
                >
                  <input
                    type="radio"
                    id={option.id}
                    name="demoLang"
                    value={option.value}
                    checked={demoLanguage === option.value}
                    onChange={() => setDemoLanguage(option.value)}
                  />
                  <b>{t(`form.demoLanguage.${option.key}.value`)}</b>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field field--full">
            <label htmlFor="f-msg">{t('form.notes.label')}</label>
            <textarea
              className="textarea"
              id="f-msg"
              name="message"
              rows={4}
              aria-describedby="help-msg"
              placeholder={t('form.notes.placeholder')}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <p className="help" id="help-msg">
              {t('form.notes.help')}
            </p>
          </div>

          <div className="field field--full">
            <label
              className={has('consent') ? 'consent is-bad' : 'consent'}
              id="consentBox"
              htmlFor={FIELD_ID.consent}
            >
              <input
                type="checkbox"
                id={FIELD_ID.consent}
                name="consent"
                required
                aria-required="true"
                aria-invalid={has('consent') || undefined}
                aria-describedby={describedBy('consent')}
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  clearOnEdit('consent');
                }}
              />
              <span>
                {t('form.consent.text')}{' '}
                {/* This is the point where someone consents to their data being
                    processed, so the notice has to be reachable — it was a bold
                    <b> that led nowhere, wearing an "under construction" badge
                    even though /privacy has been published all along. Both were
                    wrong: the badge said the notice did not exist, and the
                    missing href meant nobody could read it before agreeing. */}
                <Link className="consent-note" href={routes.privacy}>
                  {t('form.consent.notice')}
                </Link>
              </span>
            </label>
            {has('consent') && (
              <p className="error" id={errorId('consent')}>
                {messages.consent}
              </p>
            )}
          </div>

          {/* Honeypot. A person never sees it, so a value here is a bot; the API
              answers 200 and drops the lead on the floor. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="company_website">{t('form.honeypot')}</label>
            <input
              id="company_website"
              name="company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>
        </div>

        <div className="submit-row">
          <button
            className="btn btn--primary btn--lg"
            type="submit"
            id="submitBtn"
            disabled={sending}
          >
            {sending ? t('form.submitting') : t('form.submit')}
            <Icon name="i-arrow-right" />
          </button>
          <p className="fine">
            <Icon name="i-lock" />
            <span>
              <b>{t('form.fine.lead')}</b> {t('form.fine.body')}
            </span>
          </p>
        </div>
      </form>
    </>
  );
}
