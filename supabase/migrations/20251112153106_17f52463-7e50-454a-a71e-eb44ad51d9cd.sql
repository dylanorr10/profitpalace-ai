-- Fix search path for update_user_streak function
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
    
    EXIT WHEN NOT has_activity OR streak_count > 365;
    
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
$$;