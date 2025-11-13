-- Create table for AI-generated personalized content
CREATE TABLE IF NOT EXISTS public.user_personalized_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  generated_content JSONB NOT NULL,
  context_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

-- Enable RLS
ALTER TABLE public.user_personalized_content ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own personalized content"
  ON public.user_personalized_content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personalized content"
  ON public.user_personalized_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personalized content"
  ON public.user_personalized_content
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personalized content"
  ON public.user_personalized_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add personalization fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS common_expenses TEXT[],
ADD COLUMN IF NOT EXISTS business_tools TEXT[],
ADD COLUMN IF NOT EXISTS specific_challenges TEXT[];

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_personalized_content_user_lesson 
  ON public.user_personalized_content(user_id, lesson_id);

-- Create index for expired content cleanup
CREATE INDEX IF NOT EXISTS idx_personalized_content_expires 
  ON public.user_personalized_content(expires_at);