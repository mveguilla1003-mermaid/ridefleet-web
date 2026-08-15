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
 * Assistants that fetch a page live to answer a question about it.
 *
 * Blocking these has a REAL COST: it takes the site out of ChatGPT and
 * Perplexity answers, which is a growing discovery channel for a company
 * this size. It is blocked here because the owner asked for bots and AI
 * both. To trade that back for reach, delete this list from the rules
 * below — one line — and leave the training crawlers blocked.
 */
const AI_ASSISTANT_CRAWLERS = [
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'YouBot'
];

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
        userAgent: [...AI_TRAINING_CRAWLERS, ...AI_ASSISTANT_CRAWLERS],
        disallow: '/'
      }
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}
