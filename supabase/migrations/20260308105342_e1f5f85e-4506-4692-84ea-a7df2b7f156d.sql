-- Create trigger to auto-generate referral codes for new profiles
CREATE TRIGGER on_profile_created_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Generate referral codes for existing profiles that don't have one
UPDATE public.profiles
SET referral_code = upper(substr(md5(user_id::text || random()::text), 1, 8))
WHERE referral_code IS NULL;