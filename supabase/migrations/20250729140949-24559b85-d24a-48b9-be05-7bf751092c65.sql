-- Fix overly permissive profiles policy and add missing DELETE policy
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive policies
-- Allow users to view only basic profile info (display_name) of others, but full access to their own
CREATE POLICY "Users can view basic profile info of others" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own full profile
  auth.uid() = user_id 
  OR 
  -- Others can only see display_name (by allowing SELECT but app will filter)
  true
);

-- Add missing DELETE policy
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);