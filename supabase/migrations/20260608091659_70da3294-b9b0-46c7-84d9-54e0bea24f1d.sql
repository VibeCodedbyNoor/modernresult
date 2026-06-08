UPDATE public.schools 
SET dmc_settings = (dmc_settings - 'controller_signature_url' - 'principal_signature_url'), 
    updated_at = now()
WHERE dmc_settings ? 'controller_signature_url' OR dmc_settings ? 'principal_signature_url';