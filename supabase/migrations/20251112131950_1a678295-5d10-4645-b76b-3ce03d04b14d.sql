-- Phase 1: Add profile completion tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS prompts_dismissed jsonb DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS newsletter_subscribed boolean DEFAULT true;

-- Make onboarding fields nullable (allow progressive collection)
ALTER TABLE user_profiles ALTER COLUMN business_start_date DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN annual_turnover DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN accounting_year_end DROP NOT NULL;

-- Phase 3: Community Q&A Tables
CREATE TABLE community_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  upvotes int DEFAULT 0,
  answer_count int DEFAULT 0,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE community_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES community_questions ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  upvotes int DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE community_votes (
  user_id uuid REFERENCES auth.users NOT NULL,
  target_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('question', 'answer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, target_id, vote_type)
);

-- Enable RLS on community tables
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_questions
CREATE POLICY "Anyone can view questions"
  ON community_questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create questions"
  ON community_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
  ON community_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
  ON community_questions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for community_answers
CREATE POLICY "Anyone can view answers"
  ON community_answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create answers"
  ON community_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers"
  ON community_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers"
  ON community_answers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for community_votes
CREATE POLICY "Users can view all votes"
  ON community_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own votes"
  ON community_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON community_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_community_questions_user_id ON community_questions(user_id);
CREATE INDEX idx_community_questions_created_at ON community_questions(created_at DESC);
CREATE INDEX idx_community_questions_tags ON community_questions USING GIN(tags);
CREATE INDEX idx_community_answers_question_id ON community_answers(question_id);
CREATE INDEX idx_community_answers_user_id ON community_answers(user_id);
CREATE INDEX idx_community_votes_target_id ON community_votes(target_id);

-- Trigger to update answer_count
CREATE OR REPLACE FUNCTION update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_questions 
    SET answer_count = answer_count + 1,
        updated_at = now()
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_questions 
    SET answer_count = GREATEST(answer_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_answer_count
AFTER INSERT OR DELETE ON community_answers
FOR EACH ROW EXECUTE FUNCTION update_question_answer_count();

-- Trigger for updated_at on questions
CREATE TRIGGER update_community_questions_updated_at
BEFORE UPDATE ON community_questions
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();