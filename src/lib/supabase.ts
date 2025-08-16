import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xujaxssbncobmiwxbaxh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1amF4c3NibmNvYm1pd3hiYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzYxODcsImV4cCI6MjA3MDgxMjE4N30.OIGcn1R0Nb8noYAS1I9Mmo-8jUdEndOHY7xfkgk3WfY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  name: string
  email: string
  role: 'admin' | 'student'
  created_at: string
  updated_at: string
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
