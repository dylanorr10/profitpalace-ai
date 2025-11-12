-- Add spaced repetition columns to user_progress
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS next_review_date DATE,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mastery_level INTEGER DEFAULT 0;

-- Create function to calculate next review date based on mastery level
CREATE OR REPLACE FUNCTION calculate_next_review_date(
  completion_date DATE,
  current_mastery INTEGER,
  quiz_score INTEGER,
  lesson_category TEXT
)
RETURNS DATE
LANGUAGE plpgsql
AS $$
DECLARE
  base_interval INTEGER;
  seasonal_boost BOOLEAN := false;
  current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  result_date DATE;
BEGIN
  -- Determine base interval based on mastery level
  CASE 
    WHEN current_mastery = 0 THEN base_interval := 1;  -- 1 day
    WHEN current_mastery = 1 THEN base_interval := 7;  -- 7 days
    WHEN current_mastery = 2 THEN base_interval := 30; -- 30 days
    ELSE base_interval := 90; -- 90 days for mastered
  END CASE;
  
  -- Reduce interval if quiz score was low (< 80%)
  IF quiz_score < 80 THEN
    base_interval := GREATEST(1, base_interval / 2);
  END IF;
  
  -- Check for seasonal boost (January-March for tax lessons)
  IF current_month BETWEEN 1 AND 3 AND (
    lesson_category LIKE '%tax%' OR 
    lesson_category LIKE '%vat%' OR 
    lesson_category LIKE '%filing%'
  ) THEN
    seasonal_boost := true;
    base_interval := GREATEST(1, base_interval / 2);
  END IF;
  
  -- Check for year-end planning boost (October-December)
  IF current_month BETWEEN 10 AND 12 AND (
    lesson_category LIKE '%planning%' OR 
    lesson_category LIKE '%year-end%'
  ) THEN
    seasonal_boost := true;
    base_interval := GREATEST(1, base_interval / 2);
  END IF;
  
  result_date := completion_date + (base_interval || ' days')::INTERVAL;
  
  RETURN result_date;
END;
$$;

-- Create trigger function to update next review date on lesson completion
CREATE OR REPLACE FUNCTION update_review_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  lesson_category TEXT;
  new_mastery INTEGER;
BEGIN
  -- Only calculate review date when lesson is completed with a quiz
  IF NEW.completed_at IS NOT NULL AND NEW.quiz_score IS NOT NULL THEN
    -- Get lesson category
    SELECT category INTO lesson_category
    FROM lessons
    WHERE id = NEW.lesson_id;
    
    -- Calculate new mastery level
    IF NEW.quiz_score >= 90 THEN
      new_mastery := LEAST(3, COALESCE(OLD.mastery_level, 0) + 1);
    ELSIF NEW.quiz_score >= 80 THEN
      new_mastery := COALESCE(OLD.mastery_level, 0);
    ELSE
      new_mastery := GREATEST(0, COALESCE(OLD.mastery_level, 0) - 1);
    END IF;
    
    NEW.mastery_level := new_mastery;
    NEW.review_count := COALESCE(OLD.review_count, 0) + 1;
    NEW.next_review_date := calculate_next_review_date(
      NEW.completed_at::DATE,
      new_mastery,
      NEW.quiz_score,
      lesson_category
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS update_review_schedule_trigger ON user_progress;
CREATE TRIGGER update_review_schedule_trigger
BEFORE INSERT OR UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION update_review_schedule();