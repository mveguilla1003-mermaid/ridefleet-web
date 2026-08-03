import type { ReactNode } from 'react';

/**
 * Root layout. next-intl owns <html> in `[locale]/layout.tsx` so that `lang`
 * and `dir` are always correct for the rendered locale; this file only exists
 * to satisfy Next's required root and must not emit markup of its own.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
