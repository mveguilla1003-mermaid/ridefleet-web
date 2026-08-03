import { useTranslations } from 'next-intl';
import { Section, Eyebrow, ButtonLink, ArrowLink } from '@/components/ui';
import { routes } from '@/lib/site';

/** Branded 404 — keeps the shared header, footer and a way forward. */
export default function NotFound() {
  const t = useTranslations('notFound');
  const nav = useTranslations('nav');

  return (
    <Section>
      <div style={{ maxWidth: 'var(--container-narrow)' }}>
        <Eyebrow tone="neutral">{t('eyebrow')}</Eyebrow>
        <h1>{t('title')}</h1>
        <p className="lede">{t('lede')}</p>
        <div className="btn-row" style={{ marginTop: 'var(--sp-6)' }}>
          <ButtonLink href={routes.demo}>{t('cta')}</ButtonLink>
          <ButtonLink href={routes.home} tone="secondary">
            {nav('home')}
          </ButtonLink>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--sp-5)',
            marginTop: 'var(--sp-8)'
          }}
        >
          <ArrowLink href={routes.rideFleetManager}>
            {nav('rideFleetManager')}
          </ArrowLink>
          <ArrowLink href={routes.tollBridge} tone="gold">
            {nav('tollBridge')}
          </ArrowLink>
          <ArrowLink href={routes.vozAi} tone="teal">
            {nav('vozAi')}
          </ArrowLink>
        </div>
      </div>
    </Section>
  );
}
