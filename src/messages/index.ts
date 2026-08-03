import type { AbstractIntlMessages } from 'next-intl';
import type { Locale } from '@/i18n/routing';

/**
 * Message catalogs are split ONE FILE PER NAMESPACE
 * (`src/messages/<locale>/<namespace>.json`) rather than one giant file per
 * locale. Two reasons:
 *   - a page's strings live next to nothing else, so two people editing two
 *     pages never touch the same file;
 *   - `scripts/check-i18n.mjs` can report which namespace a broken key is in.
 *
 * Imports are static so the bundler can tree-shake and so a missing file is a
 * build error rather than a runtime 404.
 */

import esCore from './es/_core.json';
import esHome from './es/home.json';
import esRideFleetManager from './es/rideFleetManager.json';
import esTollBridge from './es/tollBridge.json';
import esVozAi from './es/vozAi.json';
import esDemo from './es/demo.json';
import esSupporting from './es/supporting.json';

import enCore from './en/_core.json';
import enHome from './en/home.json';
import enRideFleetManager from './en/rideFleetManager.json';
import enTollBridge from './en/tollBridge.json';
import enVozAi from './en/vozAi.json';
import enDemo from './en/demo.json';
import enSupporting from './en/supporting.json';

/**
 * The cast is deliberate. Several namespaces key their lists as JSON arrays,
 * and `AbstractIntlMessages` is declared as a string-keyed record, so it does
 * not admit arrays — even though next-intl reads them correctly at runtime via
 * `useMessages()`. Widening here keeps the array-shaped catalogs legal without
 * forcing every list in the site into numeric-string keys.
 */
const catalogs = {
  es: {
    ...esCore,
    home: esHome,
    rideFleetManager: esRideFleetManager,
    tollBridge: esTollBridge,
    vozAi: esVozAi,
    demo: esDemo,
    ...esSupporting
  },
  en: {
    ...enCore,
    home: enHome,
    rideFleetManager: enRideFleetManager,
    tollBridge: enTollBridge,
    vozAi: enVozAi,
    demo: enDemo,
    ...enSupporting
  }
} as unknown as Record<Locale, AbstractIntlMessages>;

export function getCatalog(locale: Locale): AbstractIntlMessages {
  return catalogs[locale];
}
