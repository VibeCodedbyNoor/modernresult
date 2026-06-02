CREATE OR REPLACE FUNCTION public.deduct_credit(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Result checks are now free for all schools. Keep the legacy function
  -- as a safe no-op so older clients cannot deduct credits.
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_upload_credits(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Uploads are now free. Preserve upload_count for usage stats only.
  UPDATE public.schools
  SET upload_count = upload_count + 1,
      updated_at = now()
  WHERE id = p_school_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_template_change_credits(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Design changes are now free. Preserve template_changes_count for usage stats only.
  UPDATE public.schools
  SET template_changes_count = template_changes_count + 1,
      updated_at = now()
  WHERE id = p_school_id;

  RETURN true;
END;
$function$;