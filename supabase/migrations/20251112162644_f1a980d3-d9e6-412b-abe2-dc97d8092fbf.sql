-- Fix security warning: Set search_path for calculate_next_review_date function
CREATE OR REPLACE FUNCTION calculate_next_review_date(
  completion_date DATE,
  current_mastery INTEGER,
  quiz_score INTEGER,
  lesson_category TEXT
)
RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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