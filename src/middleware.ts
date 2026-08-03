import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Everything except Next internals, the API routes and static files.
  matcher: ['/((?!api|_next|_vercel|fonts|.*\\..*).*)']
};
