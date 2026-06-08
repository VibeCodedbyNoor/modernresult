import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'pro';

/** Fetch the plan for a given school slug (public). Used by ResultPortal. */
export function usePlanBySlug(slug: string | undefined): Plan | null {
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    if (!slug) return;
    let active = true;
    
    supabase.rpc('get_school_portal_data', { p_slug: slug })
      .then(({ data }) => {
        if (!active) return;
        const school = data?.[0];
        const p = (school as any)?.plan === 'pro' ? 'pro' : 'free';
        setPlan(p);
      })
      .catch((err) => {
        console.error('Error fetching plan:', err);
      });
      
    return () => {
      active = false;
    };
  }, [slug]);
  return plan;
}