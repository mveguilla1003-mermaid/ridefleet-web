import { routing } from '@/i18n/routing';
import { site } from './site';

/**
 * Lead delivery formats.
 *
 * Two destinations, both optional, checked in this order by /api/lead:
 *
 *  1. HubSpot Forms API — set HUBSPOT_PORTAL_ID and HUBSPOT_FORM_GUID.
 *     Chosen as the low-friction path: those two ids are public form
 *     identifiers, NOT secrets, so nothing sensitive lives in the deploy
 *     config, and the endpoint needs no API key at all. The lead lands as a
 *     real contact rather than a webhook payload somebody still has to wire
 *     up.
 *  2. A generic webhook — set CRM_WEBHOOK_URL (plus CRM_WEBHOOK_TOKEN for a
 *     Bearer header). Sends the lead as flat JSON, for any other CRM or an
 *     automation step in between.
 *
 * With neither set the route keeps logging, which is where things stand
 * today: a lead submitted right now reaches nobody.
 */

export type Lead = {
  receivedAt: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  fleetSize: string;
  businessModel: string;
  products: string[];
  demoLanguage: string;
  notes: string;
  consent: boolean;
  locale: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
  referrer: string;
  landingPath: string;
};

/**
 * Everything the qualifying form asks that HubSpot has no standard property
 * for, rendered as readable lines.
 *
 * This is deliberate rather than lazy: mapping fleet size, business model and
 * the UTM set onto custom properties means creating each one in HubSpot
 * first, and a mismatch there is rejected silently by the API — the lead
 * would look delivered and arrive empty. Folded into the note, everything
 * survives on day one with nothing configured. Promote individual lines to
 * real properties later if the sales team wants to filter on them.
 */
export function leadSummary(lead: Lead): string {
  const lines = [
    lead.notes && `${lead.notes}\n`,
    `Fleet size: ${lead.fleetSize || '—'}`,
    `Business model: ${lead.businessModel || '—'}`,
    `Products of interest: ${lead.products.length ? lead.products.join(', ') : '—'}`,
    `Preferred demo language: ${lead.demoLanguage || '—'}`,
    `Role: ${lead.role || '—'}`,
    `Site language: ${lead.locale || '—'}`,
    `Consent given: ${lead.consent ? 'yes' : 'no'}`,
    `Landed on: ${lead.landingPath || '—'}`,
    `Referrer: ${lead.referrer || 'direct'}`
  ];

  const utm = Object.entries(lead.utm).filter(([, v]) => v);
  if (utm.length) lines.push(`UTM: ${utm.map(([k, v]) => `${k}=${v}`).join(' ')}`);

  return lines.filter(Boolean).join('\n');
}

/** First token is the first name, the remainder is the surname. */
function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return { first: full.trim(), last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

/**
 * HubSpot Forms v3 submission. Only standard contact properties are used, so
 * this works against a brand-new portal with nothing configured.
 */
export function toHubspotSubmission(lead: Lead) {
  const { first, last } = splitName(lead.name);
  const fields = [
    { name: 'email', value: lead.email },
    { name: 'firstname', value: first },
    { name: 'lastname', value: last },
    { name: 'company', value: lead.company },
    { name: 'phone', value: lead.phone },
    { name: 'message', value: leadSummary(lead) }
  ].filter((f) => f.value);

  return {
    fields,
    context: {
      // The fallback follows the site's default locale rather than a literal:
      // HubSpot matches this pageUri against its registered domains, so it
      // must be a URL that actually exists.
      pageUri: `${site.url}/${lead.locale || routing.defaultLocale}/demo`,
      pageName: 'Ride Fleet — demo request'
    }
  };
}

export function hubspotEndpoint(): string | null {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  if (!portalId || !formGuid) return null;
  return `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
}
