-- Add bookmarking and tags to user_progress table
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS bookmarked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_noted_at timestamp with time zone;

-- Create index for faster bookmark queries
CREATE INDEX IF NOT EXISTS idx_user_progress_bookmarked 
ON user_progress(user_id, bookmarked) 
WHERE bookmarked = true;

-- Create index for notes search
CREATE INDEX IF NOT EXISTS idx_user_progress_notes 
ON user_progress USING gin(to_tsvector('english', notes)) 
WHERE notes IS NOT NULL;