import type { Metadata } from 'next';
import esCore from '@/messages/es/_core.json';
import enCore from '@/messages/en/_core.json';
import { localeTags, routes } from '@/lib/site';

/**
 * Global 404 — lives at the ROOT, outside `[locale]`, on purpose.
 *
 * A nested `[locale]/not-found.tsx` never renders for unknown URLs in
 * Next 14.2: unmatched routes resolve to the root not-found boundary, and
 * with a pass-through root layout that meant Next's unbranded English-only
 * default 404 with no `<html>`/`<body>` at all. So this file owns the full
 * document (the root layout deliberately emits no markup) and serves BOTH
 * languages in one statically rendered page — there is no locale context out
 * here, and a server-rendered bilingual page beats a client-side locale guess
 * that breaks without JavaScript.
 *
 * Strings come straight from the `notFound` namespace of both catalogs; no
 * next-intl runtime is involved because there is no request locale to give it.
 */

const es = esCore.notFound;
const en = enCore.notFound;

export const metadata: Metadata = {
  // Both catalog titles end in " · Ride Fleet"; strip the Spanish one so the
  // brand appears once in the combined bilingual title.
  title: `${es.meta.title.replace(/\s·\sRide Fleet$/, '')} · ${en.meta.title}`,
  description: `${es.meta.description} ${en.meta.description}`,
  robots: { index: false, follow: false }
  // icons + manifest are inherited from the root layout's metadata.
};

function LangBlock({
  tag,
  copy,
  navHome,
  heading
}: {
  tag: string;
  copy: typeof es;
  navHome: string;
  heading: 'h1' | 'h2';
}) {
  const Heading = heading;
  const prefix = `/${tag.split('-')[0]}`;
  return (
    <div lang={tag}>
      <p className="eyebrow">
        <span className="dot" aria-hidden="true" />
        {copy.eyebrow}
      </p>
      <Heading>{copy.title}</Heading>
      <p className="lede">{copy.lede}</p>
      <div className="btn-row" style={{ marginTop: 'var(--sp-6)' }}>
        <a className="btn btn--primary" href={`${prefix}${routes.demo}`}>
          {copy.cta}
        </a>
        <a className="btn btn--secondary" href={prefix}>
          {navHome}
        </a>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <html lang={localeTags.es}>
      <body>
        <main id="main">
          <section className="sec">
            <div
              className="container"
              style={{ maxWidth: 'var(--container-narrow)' }}
            >
              <LangBlock
                tag={localeTags.es}
                copy={es}
                navHome={esCore.nav.home}
                heading="h1"
              />
              <hr className="rule" style={{ margin: 'var(--sp-10) 0' }} />
              <LangBlock
                tag={localeTags.en}
                copy={en}
                navHome={enCore.nav.home}
                heading="h2"
              />
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
