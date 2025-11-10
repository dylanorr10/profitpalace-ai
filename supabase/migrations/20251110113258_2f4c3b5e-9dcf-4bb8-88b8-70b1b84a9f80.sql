-- Update user_profiles table with purchase and engagement tracking
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS has_purchased boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS purchased_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS newsletter_subscribed boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS waitlist_joined boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS waitlist_joined_at timestamp with time zone;

-- Create email_subscribers table for pre-purchase email capture
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamp with time zone DEFAULT now(),
  source text,
  tags text[],
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on email_subscribers
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for email capture
CREATE POLICY "Anyone can subscribe to newsletter"
  ON email_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Create ai_usage table to track AI questions
CREATE TABLE IF NOT EXISTS ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages_count integer DEFAULT 0,
  last_question_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on ai_usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own AI usage
CREATE POLICY "Users can view their own AI usage"
  ON ai_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage"
  ON ai_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI usage"
  ON ai_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create chat_messages table for AI conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  lesson_context uuid REFERENCES lessons(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can manage their own messages
CREATE POLICY "Users can view their own messages"
  ON chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);