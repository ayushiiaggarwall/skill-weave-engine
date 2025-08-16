-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  objective TEXT NOT NULL,
  content TEXT NOT NULL,
  mini_project TEXT,
  deliverables TEXT[], -- Array of strings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (courses are public content)
CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

-- Create policy for admins to manage courses
CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the courses table with the 5 weeks of data
INSERT INTO public.courses (title, week_number, objective, content, mini_project, deliverables) VALUES
(
  'Kickoff & Tool Mastery (Laying the foundation)',
  1,
  'Understand the full toolchain and set up a working environment.',
  'Course introduction — mindset for a 48-hour build, hackathon story.

Tool overview & installation: Lovable, Supabase, Apify, n8n, OpenAI & Gemini APIs.

Setting up accounts & connecting services.

Quick demo: Deploying a basic Lovable site with Supabase login.',
  'Deploy a starter Lovable site with authentication.',
  NULL
),
(
  'Rapid Frontend Design with Lovable (Get visible results fast)',
  2,
  'Build the UI and user flows without spending weeks on design.',
  'Navigating Lovable''s editor & components.

Building responsive layouts.

Creating navigation & linking pages.

Adding forms (login, search, booking).

Customizing branding, colors, and typography.',
  'Complete the homepage + search page in under 2 hours.',
  NULL
),
(
  'Backend & Live Data Integrations (Make it functional)',
  3,
  'Connect your UI to real-time, actionable data.',
  'Introduction to APIs & Supabase Edge Functions.

Using Apify Actors (Skyscanner for flights, TripAdvisor for hotels).

Writing Edge Functions to fetch and format data.

Displaying dynamic search results in Lovable.

Error handling & loading states.',
  'Live flight search integrated with frontend.',
  NULL
),
(
  'AI Features & Automation (Adding superpowers)',
  4,
  'Enhance the platform with automation and AI.',
  'Why we switched from Gemini API calls to n8n workflows.

Building an n8n flow for AI itinerary planning.

Webhook triggers, passing user data, returning JSON.

Integrating AI outputs into Lovable pages.

Sending custom emails via Supabase Edge Functions.

Adding "Parallel Universe" persona with OpenAI image generation.',
  'AI trip planner with saved results.',
  NULL
),
(
  'Launch & Scaling (From project to product)',
  5,
  'Deploy and showcase your project.',
  'Deploying Lovable projects live.

Connecting custom domains.

Basic SEO & performance optimization.

Showcasing projects & demo day tips.

Scaling beyond MVP — monetization paths.

Final Q&A + feedback session.',
  NULL,
  ARRAY[
    'Fully functional AI-powered travel booking platform',
    'Hands-on experience with Lovable, Supabase, Apify, n8n, AI APIs',
    'A repeatable process to build in 48 hours',
    'A live portfolio project for GitHub/LinkedIn'
  ]
);