import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { site, localeTags } from './site';

/**
 * Builds the full metadata block a page needs to pass definition-of-done #6:
 * title, description, canonical, hreflang pair + x-default, OG and Twitter.
 *
 * `path` is the locale-less pathname, e.g. '/toll-bridge' or '/'.
 */
export async function buildMetadata({
  locale,
  path,
  namespace
}: {
  locale: Locale;
  path: string;
  namespace: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${namespace}.meta` });
  const clean = path === '/' ? '' : path;
  const canonical = `${site.url}/${locale}${clean}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[localeTags[l]] = `${site.url}/${l}${clean}`;
  }
  languages['x-default'] = `${site.url}/${routing.defaultLocale}${clean}`;

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: localeTags[locale].replace('-', '_'),
      url: canonical,
      title,
      description
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    robots: { index: true, follow: true }
  };
}

export function organizationSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: `${site.url}/${locale}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Juan',
      addressRegion: 'PR',
      addressCountry: 'PR'
    },
    areaServed: ['PR', 'US']
  };
}

export function softwareSchema({
  locale,
  name,
  description,
  path
}: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${site.url}/${locale}${path === '/' ? '' : path}`,
    provider: { '@type': 'Organization', name: site.name, url: site.url }
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };
}

export function breadcrumbSchema(
  locale: Locale,
  trail: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${site.url}/${locale}${item.path === '/' ? '' : item.path}`
    }))
  };
}
