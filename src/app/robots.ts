import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Post-conversion pages carry no search value and can leak lead state.
        disallow: ['/es/demo/thank-you', '/en/demo/thank-you', '/api/']
      }
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}
