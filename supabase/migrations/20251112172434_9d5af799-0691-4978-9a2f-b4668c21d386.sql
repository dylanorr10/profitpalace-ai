-- Add rate limiting for email_subscribers to prevent spam attacks
CREATE OR REPLACE FUNCTION check_email_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count insertions in the last hour (global rate limit)
  SELECT COUNT(*) INTO recent_count
  FROM email_subscribers
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  -- Check for duplicate email attempts in last 5 minutes
  SELECT COUNT(*) INTO recent_count
  FROM email_subscribers
  WHERE email = NEW.email
  AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF recent_count > 0 THEN
    RAISE EXCEPTION 'Please wait before resubmitting.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER email_rate_limit_trigger
  BEFORE INSERT ON email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION check_email_rate_limit();