-- Add profile_picture_url column to personal_details table
ALTER TABLE public.personal_details 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;