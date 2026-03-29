
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_telegram_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payload jsonb;
  edge_function_url text;
  anon_key text;
BEGIN
  edge_function_url := 'https://jxuxfalbkirrghuyaoup.supabase.co/functions/v1/notify-telegram-signup';
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXhmYWxia2lycmdodXlhb3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDQ1NjgsImV4cCI6MjA4ODI4MDU2OH0.Wd8iuGWUFO9hweaWE7-H974j1SRcM2Yrz3KZpDVXaPA';

  payload := jsonb_build_object(
    'record', jsonb_build_object(
      'owner_name', NEW.owner_name,
      'school_name', NEW.school_name,
      'whatsapp_number', NEW.whatsapp_number,
      'created_at', NEW.created_at
    )
  );

  PERFORM extensions.http_post(
    edge_function_url,
    payload::text,
    'application/json',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || anon_key)
    ]
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_telegram_on_signup ON public.profiles;
CREATE TRIGGER trigger_notify_telegram_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_on_signup();
