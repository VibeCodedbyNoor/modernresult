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
    if (plan !== 'free') return;
    const containerId = slot === 'top' ? NATIVE_BASE_ID : `${NATIVE_BASE_ID}-2`;
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

      // Load the social bar script once per page on free plan (top slot only)
      if (slot === 'top' && !document.querySelector(`script[src="${SOCIAL_BAR_SRC}"]`)) {
        const sb = document.createElement('script');
        sb.src = SOCIAL_BAR_SRC;
        sb.async = true;
        document.body.appendChild(sb);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [plan, slot]);

  if (plan !== 'free') return null;
  return (
    <div
      ref={ref}
      className="w-full max-w-3xl mx-auto my-4 px-3"
      aria-label="Advertisement"
      style={{ minHeight: 90 }}
    />
  );
}
