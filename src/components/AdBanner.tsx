import { useEffect, useRef } from 'react';
import type { Plan } from '@/hooks/usePlan';

interface Props {
  plan: Plan | null;
  /** Unique slot id — keeps multiple placements isolated. */
  slot: 'top' | 'bottom';
}

const NATIVE_SRC = 'https://pl29573320.effectivecpmnetwork.com/877a0f4c8a70209aba84116e7622c5cc/invoke.js';
const NATIVE_BASE_ID = 'container-877a0f4c8a70209aba84116e7622c5cc';
const SOCIAL_BAR_SRC = 'https://pl29573321.effectivecpmnetwork.com/af/e0/fd/afe0fd0567e2a0c0bcd913da73e79901.js';

/**
 * Renders an ad banner only when the school plan is 'free'.
 * Pro plan schools never see ads.
 */
export default function AdBanner({ plan, slot }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.querySelectorAll(`script[src="${SOCIAL_BAR_SRC}"]`).forEach((script) => script.remove());
    if (plan !== 'free') return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile && slot === 'top') return;

    const containerId = slot === 'top' || isMobile ? NATIVE_BASE_ID : `${NATIVE_BASE_ID}-2`;
    const timer = window.setTimeout(() => {
      if (!ref.current) return;
      // Build placement container
      ref.current.innerHTML = `<div id="${containerId}"></div>`;
      // Inject the native ad invoke script after the container exists
      const s = document.createElement('script');
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      s.src = NATIVE_SRC;
      ref.current.appendChild(s);
    }, 300);

    return () => {
      window.clearTimeout(timer);
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [plan, slot]);

  if (plan !== 'free') return null;
  return (
    <div
      ref={ref}
      className={slot === 'bottom'
        ? 'fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-20 min-h-14 w-full items-center justify-center overflow-hidden border-t border-border bg-background/95 px-2 py-2 shadow-lg backdrop-blur md:static md:my-4 md:min-h-[90px] md:max-h-none md:max-w-3xl md:border-0 md:bg-transparent md:px-3 md:shadow-none md:backdrop-blur-0 [&_iframe]:max-h-16 [&_iframe]:w-full [&_iframe]:max-w-[360px] [&_iframe]:overflow-hidden [&_img]:max-h-16 [&_img]:w-auto'
        : 'hidden w-full max-w-3xl mx-auto my-4 px-3 md:block'
      }
      aria-label="Advertisement"
      style={{ minHeight: slot === 'bottom' ? undefined : 90 }}
    />
  );
}
