import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { routes, site, localeTags } from '@/lib/site';
// Real commit dates per route, maintained by scripts/build-lastmod.mjs (runs
// as the npm prebuild hook on full-history checkouts). A route missing here
// simply ships no lastModified — never a fabricated date.
import lastmod from '@/lib/lastmod.json';

/**
 * Per-locale entries with full alternate-language maps, so each URL declares
 * its pair. Priorities follow the wedge order: Toll Bridge and the demo hub
 * carry the conversion load.
 */
const priorities: Partial<Record<keyof typeof routes, number>> = {
  home: 1,
  tollBridge: 0.9,
  demo: 0.9,
  pricing: 0.9,
  rideFleetManager: 0.8,
  // Valet carries a product's weight now, not the 0.7 the airport-pickup arc
  // had when it owned this path.
  valet: 0.8,
  security: 0.6
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const [key, path] of Object.entries(routes)) {
    // The thank-you page is a post-conversion destination, not an entry point.
    if (key === 'demoThankYou') continue;

    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[localeTags[locale]] =
        `${site.url}/${locale}${path === '/' ? '' : path}`;
    }

    const modified = (lastmod as Partial<Record<string, string>>)[key];

    for (const locale of routing.locales) {
      entries.push({
        url: `${site.url}/${locale}${path === '/' ? '' : path}`,
        changeFrequency: 'monthly',
        priority: priorities[key as keyof typeof routes] ?? 0.5,
        alternates: { languages },
        ...(modified ? { lastModified: modified } : {})
      });
    }
  }

  return entries;
}
