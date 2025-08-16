import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Using mock client.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  price: number
  currency: string
  image_url?: string
  syllabus: string[]
  tools: string[]
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  payment_status: 'pending' | 'completed' | 'failed'
  stripe_session_id?: string
  created_at: string
}
