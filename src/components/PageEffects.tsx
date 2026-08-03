'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/routing';

/**
 * The two behaviours every static v2 page carried in its own `<script>`.
 * Mounted ONCE by the locale layout, so no route ships its own copy.
 * Both are progressive enhancement of markup the server already rendered,
 * which is why this component renders nothing.
 *
 *  1. **Scroll reveal.** `base.css` ships `.reveal` at `opacity:0` and only
 *     `.reveal.is-in` is visible, so the class MUST be added by script or the
 *     content never appears. Geometry-based like the original — any element
 *     that has ever been near the viewport is marked — plus a 2 s safety net,
 *     so a missed scroll tick (smooth scrolling, print, headless capture) can
 *     never leave content invisible. Reduced motion short-circuits to "show
 *     everything immediately".
 *  2. **Table edge fade.** The `.tbl-scroll` mask is opt-in (`.is-scrollable`,
 *     cleared by `.at-end`) so a table that fits is not clipped at its right
 *     edge, and the "swipe the table" hint never lies on a wide viewport.
 *
 * It re-runs on navigation because App Router keeps the layout mounted across
 * route changes — without the pathname dependency the next page would render
 * with every `.reveal` still at opacity 0.
 */
export function PageEffects() {
  const pathname = usePathname();

  useEffect(() => {
    /* ------------------------------------------------------ scroll reveal -- */
    let items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const show = (el: HTMLElement) => el.classList.add('is-in');
    let ticking = false;
    let safety: number | undefined;

    function pass() {
      ticking = false;
      const vh = window.innerHeight || 800;
      items = items.filter((el) => {
        // `top < vh * 0.92` ONLY — deliberately no lower bound. An element the
        // user has already scrolled past must stay revealed, and a fast scroll
        // (or a rAF the browser skipped) can put it above the viewport between
        // two ticks. Testing `bottom > -40` as well would let those fall
        // through and stay at opacity 0 until the safety net fired.
        if (el.getBoundingClientRect().top < vh * 0.92) {
          show(el);
          return false;
        }
        return true;
      });
      if (!items.length) stopReveal();
    }

    function onRevealTick() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(pass);
      }
    }

    function stopReveal() {
      window.removeEventListener('scroll', onRevealTick);
      window.removeEventListener('resize', onRevealTick);
    }

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      items.forEach(show);
      items = [];
    } else {
      window.addEventListener('scroll', onRevealTick, { passive: true });
      window.addEventListener('resize', onRevealTick);
      pass();
      safety = window.setTimeout(() => {
        items.forEach((el) => {
          el.style.transition = 'none';
          show(el);
        });
        items = [];
        stopReveal();
      }, 2000);
    }

    /* --------------------------------------------------- table edge fade -- */
    const scrollers = Array.from(
      document.querySelectorAll<HTMLElement>('.tbl-scroll')
    );

    const sync = (el: HTMLElement) => {
      const over = el.scrollWidth - el.clientWidth > 4;
      el.classList.toggle('is-scrollable', over);
      el.classList.toggle(
        'at-end',
        over && el.scrollLeft >= el.scrollWidth - el.clientWidth - 2
      );
    };
    const onTableScroll = (e: Event) => sync(e.currentTarget as HTMLElement);
    const onResize = () => scrollers.forEach(sync);

    scrollers.forEach((el) => {
      sync(el);
      el.addEventListener('scroll', onTableScroll, { passive: true });
    });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      stopReveal();
      if (safety !== undefined) window.clearTimeout(safety);
      scrollers.forEach((el) =>
        el.removeEventListener('scroll', onTableScroll)
      );
      window.removeEventListener('resize', onResize);
    };
  }, [pathname]);

  return null;
}
