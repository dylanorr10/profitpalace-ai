-- Add subscription and ultra-personalization fields to user_profiles
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS subscription_type text CHECK (subscription_type IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trial', 'inactive')),
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS annual_turnover text,
  ADD COLUMN IF NOT EXISTS vat_registered boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vat_threshold_approaching boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS employees_count text,
  ADD COLUMN IF NOT EXISTS business_goals text[];

-- Add lesson restructuring fields for micro-lessons
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS parent_lesson_id uuid REFERENCES lessons(id),
  ADD COLUMN IF NOT EXISTS lesson_type text DEFAULT 'micro' CHECK (lesson_type IN ('micro', 'main')),
  ADD COLUMN IF NOT EXISTS quiz_required boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS next_lesson_id uuid REFERENCES lessons(id);

-- Create index for faster lesson queries
CREATE INDEX IF NOT EXISTS idx_lessons_parent ON lessons(parent_lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_next ON lessons(next_lesson_id);

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);