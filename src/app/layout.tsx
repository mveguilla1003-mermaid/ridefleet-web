import type { ReactNode } from 'react';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/additions.css';

/**
 * Root layout. next-intl owns <html> in `[locale]/layout.tsx` so that `lang`
 * and `dir` are always correct for the rendered locale; this file only exists
 * to satisfy Next's required root and must not emit markup of its own.
 *
 * The global stylesheets are imported HERE and not in `[locale]/layout.tsx`
 * because the root not-found page renders outside `[locale]` — CSS imported
 * in `not-found.tsx` itself is silently dropped by Next 14.2, so the root
 * layout is the only place that styles every route AND the 404.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
