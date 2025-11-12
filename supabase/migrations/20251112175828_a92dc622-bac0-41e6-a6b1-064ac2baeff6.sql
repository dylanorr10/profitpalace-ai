-- Add name fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name ON public.user_profiles(full_name);

COMMENT ON COLUMN public.user_profiles.first_name IS 'User''s first name for personalized greetings';
COMMENT ON COLUMN public.user_profiles.full_name IS 'User''s full name for display purposes';