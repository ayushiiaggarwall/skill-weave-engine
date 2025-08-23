-- Add date_of_birth and about columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN date_of_birth DATE,
ADD COLUMN about TEXT;