import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'pro';

/** Fetch the plan for a given school slug (public). Used by ResultPortal. */
export function usePlanBySlug(slug: string | undefined): Plan | null {
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    if (!slug) return;
    let active = true;
    supabase
      .from('schools')
      .select('plan')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const p = (data as any)?.plan === 'pro' ? 'pro' : 'free';
        setPlan(p);
      });
    return () => {
      active = false;
    };
  }, [slug]);
  return plan;
}
