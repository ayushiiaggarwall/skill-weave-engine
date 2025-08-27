-- Add referral source tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_source text DEFAULT NULL;

-- Add referral source tracking to leads table  
ALTER TABLE public.leads 
ADD COLUMN referral_source text DEFAULT NULL;

-- Create an enum for valid referral sources (optional, for data consistency)
CREATE TYPE public.referral_source_type AS ENUM (
  'linkedin_post', 
  'linkedin_profile', 
  'instagram', 
  'facebook', 
  'snapchat', 
  'whatsapp',
  'direct',
  'other'
);

-- Add index for better performance on source queries
CREATE INDEX idx_profiles_referral_source ON public.profiles(referral_source);
CREATE INDEX idx_leads_referral_source ON public.leads(referral_source);