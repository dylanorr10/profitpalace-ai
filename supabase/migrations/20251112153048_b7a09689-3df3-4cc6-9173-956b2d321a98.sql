-- Add streak tracking fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS total_study_days INTEGER DEFAULT 0;

-- Create daily_activity table to track user activity
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS on daily_activity
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_activity
CREATE POLICY "Users can view their own activity"
  ON public.daily_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.daily_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
  ON public.daily_activity
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster streak calculations
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date 
  ON public.daily_activity(user_id, activity_date DESC);

-- Function to update streak when activity is logged
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE;
  has_activity BOOLEAN;
BEGIN
  -- Start from today and count backwards
  check_date := NEW.activity_date;
  
  LOOP
    -- Check if there's activity on check_date
    SELECT EXISTS(
      SELECT 1 FROM daily_activity 
      WHERE user_id = NEW.user_id 
      AND activity_date = check_date
    ) INTO has_activity;
    
    EXIT WHEN NOT has_activity OR streak_count > 365; -- Max 365 days
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  -- Update user profile with new streak
  UPDATE user_profiles 
  SET 
    current_streak = streak_count,
    longest_streak = GREATEST(longest_streak, streak_count),
    last_activity_date = NEW.activity_date,
    total_study_days = (
      SELECT COUNT(DISTINCT activity_date) 
      FROM daily_activity 
      WHERE user_id = NEW.user_id
    )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak automatically
DROP TRIGGER IF EXISTS trigger_update_streak ON daily_activity;
CREATE TRIGGER trigger_update_streak
  AFTER INSERT OR UPDATE ON daily_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();