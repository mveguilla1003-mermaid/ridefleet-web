import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * What this file can and cannot do, stated plainly so nobody mistakes it
 * for a wall:
 *
 * robots.txt is a REQUEST, honoured voluntarily. The operators below publish
 * these tokens and respect them, so listing them genuinely keeps this site
 * out of their crawls and training sets. A scraper that ignores robots.txt —
 * or simply presents itself as Chrome — is unaffected by anything in here.
 * The defences that bite against those are rate limiting and bot management
 * at the edge (Vercel), plus the copyright and acceptable-use terms in
 * /terms, which is what turns a copy into something actionable.
 *
 * Search engines are deliberately NOT blocked: this is a marketing site and
 * being findable is its whole job. Note that Google-Extended and
 * Applebot-Extended govern AI training only — neither affects Google Search
 * or Siri/Spotlight ranking.
 */

/** Crawlers whose stated purpose is collecting text to train models. */
const AI_TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'meta-externalagent',
  'FacebookBot',
  'Amazonbot',
  'Diffbot',
  'omgilibot',
  'omgili',
  'ImagesiftBot',
  'cohere-ai',
  'AI2Bot',
  'Timpibot',
  'Webzio-Extended',
  'PanguBot',
  'Scrapy'
];

/**
 * Assistants that fetch a page live to answer somebody's question about it
 * are deliberately NOT blocked, and the distinction is the whole point of
 * this file.
 *
 * Training crawlers take the text and give nothing back, so blocking them
 * is free. These ones bring a reader who asked about us — increasingly the
 * first place somebody looks for "fleet software in Puerto Rico" — so
 * blocking them costs real discovery and buys no protection: the copy is
 * visible to anyone with a browser either way. What is actually hard to
 * copy is the toll reconciliation, the per-partner franchise connections
 * and a curriculum proved against domain records, and none of that is on
 * this site.
 *
 * They were blocked briefly on 2026-08-15 and unblocked the same day on
 * that reasoning. If they are ever blocked again, know what is being
 * traded: ChatGPT-User, OAI-SearchBot, PerplexityBot, Perplexity-User and
 * YouBot are the tokens involved.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Post-conversion pages carry no search value and can leak lead state.
        disallow: ['/es/demo/thank-you', '/en/demo/thank-you', '/api/']
      },
      {
        userAgent: AI_TRAINING_CRAWLERS,
        disallow: '/'
      }
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}
