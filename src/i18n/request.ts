import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';
import { getCatalog } from '@/messages';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: getCatalog(locale),
    timeZone: 'America/Puerto_Rico'
  };
});
