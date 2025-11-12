-- Add seasonal and personalization columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS annual_turnover text,
ADD COLUMN IF NOT EXISTS business_start_date date,
ADD COLUMN IF NOT EXISTS accounting_year_end text DEFAULT 'april_5',
ADD COLUMN IF NOT EXISTS mtd_status text DEFAULT 'not_required',
ADD COLUMN IF NOT EXISTS next_vat_return_due date,
ADD COLUMN IF NOT EXISTS turnover_last_updated timestamp with time zone,
ADD COLUMN IF NOT EXISTS vat_registered boolean DEFAULT false;

-- Create user_milestones table to track triggered events
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  triggered_at timestamp with time zone DEFAULT now(),
  acknowledged boolean DEFAULT false,
  metadata jsonb,
  expires_at timestamp with time zone
);

ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
ON public.user_milestones FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
ON public.user_milestones FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert milestones"
ON public.user_milestones FOR INSERT
WITH CHECK (true);

-- Create seasonal_notifications table
CREATE TABLE IF NOT EXISTS public.seasonal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  action_url text,
  priority text DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL
);

ALTER TABLE public.seasonal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.seasonal_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.seasonal_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.seasonal_notifications FOR INSERT
WITH CHECK (true);

-- Add seasonal metadata to lessons table
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS seasonal_tags text[],
ADD COLUMN IF NOT EXISTS trigger_conditions jsonb,
ADD COLUMN IF NOT EXISTS priority_boost integer DEFAULT 0;

-- Create indexes for faster seasonal queries
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON public.user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_expires ON public.user_milestones(expires_at) WHERE acknowledged = false;
CREATE INDEX IF NOT EXISTS idx_seasonal_notifications_user_unread ON public.seasonal_notifications(user_id, sent_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_seasonal_tags ON public.lessons USING GIN(seasonal_tags);