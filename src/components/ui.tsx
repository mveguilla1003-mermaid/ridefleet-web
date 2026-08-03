import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { Icon, type IconName } from './Icons';

/* ---------------------------------------------------------------- text ---- */

/** Accessible name for controls whose only visible label is an icon. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * `.eyebrow` in the static pages always carried a leading `<span class="dot">`
 * — `components.css` sizes and colours it, so an eyebrow without one renders
 * flush left and reads a few pixels off from every hand-written eyebrow on the
 * ported pages. It stays a prop because a handful of eyebrows inside dense
 * editorial rows deliberately drop it.
 */
export function Eyebrow({
  children,
  tone = 'brand',
  className,
  dot = true
}: {
  children: ReactNode;
  tone?: 'brand' | 'gold' | 'teal' | 'neutral';
  className?: string;
  dot?: boolean;
}) {
  const cls = ['eyebrow', tone !== 'brand' ? `eyebrow--${tone}` : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <p className={cls}>
      {dot ? <span className="dot" aria-hidden="true" /> : null}
      {children}
    </p>
  );
}

/* ------------------------------------------------------------- sections --- */

export function Section({
  id,
  children,
  variant,
  className
}: {
  id?: string;
  children: ReactNode;
  variant?: 'alt' | 'well' | 'tight' | 'flush-top';
  className?: string;
}) {
  const cls = ['sec', variant ? `sec--${variant}` : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <section id={id} className={cls}>
      <div className="container">{children}</div>
    </section>
  );
}

export function Band({
  id,
  children,
  tone = 'paper',
  className
}: {
  id?: string;
  children: ReactNode;
  tone?: 'paper' | 'ink' | 'brand';
  className?: string;
}) {
  const cls = ['band', `band--${tone}`, className].filter(Boolean).join(' ');
  return (
    <section id={id} className={cls}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  center,
  tone = 'brand'
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  center?: boolean;
  tone?: 'brand' | 'gold' | 'teal' | 'neutral';
}) {
  return (
    <div className={center ? 'sec-head sec-head--center' : 'sec-head'}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2>{title}</h2>
      {lede ? <p className="lede">{lede}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------- actions --- */

type BtnTone = 'primary' | 'secondary' | 'ghost' | 'gold' | 'teal';
type BtnSize = 'xs' | 'sm' | 'lg';

function btnClass(tone?: BtnTone, size?: BtnSize, block?: boolean) {
  return [
    'btn',
    tone ? `btn--${tone}` : '',
    size ? `btn--${size}` : '',
    block ? 'btn--block' : ''
  ]
    .filter(Boolean)
    .join(' ');
}

/** Internal link styled as a button. Locale prefix is added by `Link`. */
export function ButtonLink({
  href,
  children,
  tone = 'primary',
  size,
  block,
  icon
}: {
  href: string;
  children: ReactNode;
  tone?: BtnTone;
  size?: BtnSize;
  block?: boolean;
  icon?: IconName;
}) {
  return (
    <Link className={btnClass(tone, size, block)} href={href}>
      {children}
      {icon ? <Icon name={icon} /> : null}
    </Link>
  );
}

/** External / protocol link (tel:, mailto:) styled as a button. */
export function ButtonAnchor({
  href,
  children,
  tone = 'secondary',
  size,
  block,
  icon,
  external
}: {
  href: string;
  children: ReactNode;
  tone?: BtnTone;
  size?: BtnSize;
  block?: boolean;
  icon?: IconName;
  external?: boolean;
}) {
  return (
    <a
      className={btnClass(tone, size, block)}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {icon ? <Icon name={icon} /> : null}
    </a>
  );
}

export function ArrowLink({
  href,
  children,
  tone = 'brand'
}: {
  href: string;
  children: ReactNode;
  tone?: 'brand' | 'gold' | 'teal';
}) {
  const cls = ['link-arrow', tone !== 'brand' ? `link-arrow--${tone}` : '']
    .filter(Boolean)
    .join(' ');
  return (
    <Link className={cls} href={href}>
      {children}
      <Icon name="i-arrow-right" />
    </Link>
  );
}

/* ---------------------------------------------------------------- chips --- */

export function Chip({
  children,
  tone = 'neutral',
  dot = true
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'ok' | 'warn' | 'danger' | 'gold' | 'teal';
  dot?: boolean;
}) {
  return (
    <span className={`chip chip--${tone}`}>
      {dot ? <span className="led" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/**
 * The "Building / En construcción" badge. Definition-of-done #3 requires it
 * INLINE in the claim, never in a footnote — so this renders as a sibling of
 * the claim text, not at the end of a section.
 */
export function BuildingBadge({
  label,
  icon = 'i-alert'
}: {
  label: string;
  icon?: IconName;
}) {
  return (
    <span className="badge-building">
      <Icon name={icon} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ faq --- */

/**
 * Native `<details>` disclosure: keyboard-operable and screen-reader-correct
 * with no JS, which is why it is preferred over a custom accordion.
 */
export function Faq({
  id,
  items
}: {
  id?: string;
  items: { q: string; a: ReactNode }[];
}) {
  return (
    <div className="faq faq--cards" id={id}>
      {items.map((item, i) => (
        <details className="faq-item" key={i}>
          <summary>
            <span>{item.q}</span>
            <Icon name="i-chevron-down" />
          </summary>
          <div className="faq-body">
            {typeof item.a === 'string' ? <p>{item.a}</p> : item.a}
          </div>
        </details>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- misc ----- */

export function Rule({
  variant
}: {
  variant?: 'brand' | 'fade' | 'thick';
}) {
  return (
    <hr className={['rule', variant ? `rule--${variant}` : ''].filter(Boolean).join(' ')} />
  );
}

/**
 * Labels a screenshot or mocked product surface as sample data. Required by
 * the no-fabricated-proof guardrail: every product surface on the site is a
 * rendering, not a customer's real screen.
 */
export function SampleDataNote({ children }: { children: ReactNode }) {
  return (
    <p className="sample-note">
      <Icon name="i-info" />
      <span>{children}</span>
    </p>
  );
}
