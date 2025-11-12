-- Fix lesson access control: Add RLS policy based on subscription status
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;

-- Create subscription-based access policy
-- Free users can only view first 3 lessons (order_index <= 3)
-- Active subscribers can view all lessons
CREATE POLICY "Subscription-based lesson access"
ON lessons FOR SELECT
USING (
  order_index <= 3  -- Free access to first 3 lessons
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND subscription_status = 'active'
  )
);

-- Fix email subscribers read protection
-- Drop existing policies if any and create restrictive SELECT policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON email_subscribers;

-- Recreate INSERT policy (unchanged)
CREATE POLICY "Anyone can subscribe to newsletter"
ON email_subscribers FOR INSERT
WITH CHECK (true);

-- Add SELECT policy - only authenticated admin users can read
-- For now, prevent all public reads. Admin access can be added later via admin role
CREATE POLICY "No public reads on subscribers"
ON email_subscribers FOR SELECT
USING (false);

-- Note: If you need admin access to view subscribers, you'll need to:
-- 1. Create an admin role system
-- 2. Update this policy to: USING (auth.jwt() ->> 'role' = 'admin')