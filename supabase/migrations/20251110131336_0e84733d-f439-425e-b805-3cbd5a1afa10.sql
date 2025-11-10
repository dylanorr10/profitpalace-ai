-- Add time commitment fields to user_profiles
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS time_commitment text,
  ADD COLUMN IF NOT EXISTS preferred_study_time text,
  ADD COLUMN IF NOT EXISTS study_days text[];

-- Add quiz and notes fields to user_progress
ALTER TABLE user_progress 
  ADD COLUMN IF NOT EXISTS quiz_score integer,
  ADD COLUMN IF NOT EXISTS quiz_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quiz_completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS notes text;

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date date NOT NULL,
  target_lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

-- Enable RLS on daily_goals
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_goals
CREATE POLICY "Users can view their own daily goals"
  ON daily_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goals"
  ON daily_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals"
  ON daily_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  earned_at timestamp with time zone DEFAULT now(),
  metadata jsonb
);

-- Enable RLS on achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements
CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);