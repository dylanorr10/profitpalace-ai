-- Fix search path for update_question_answer_count function
CREATE OR REPLACE FUNCTION public.update_question_answer_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;