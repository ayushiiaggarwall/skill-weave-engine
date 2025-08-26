import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface CoursePricing {
  id: string
  course_id: string
  inr_mrp: number
  inr_regular: number
  inr_early_bird: number
  usd_mrp: number
  usd_regular: number
  usd_early_bird: number
  created_at: string
  updated_at: string
}

interface Course {
  id: string
  title: string
  is_active: boolean
  start_date: string | null
  end_date: string | null
}

interface LocationPricing {
  currency: string
  earlyBird: number
  regular: number
  mrp: number
  symbol: string
}

export function useCoursePricing(courseId?: string) {
  const [coursePricing, setCoursePricing] = useState<CoursePricing | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [pricing, setPricing] = useState<LocationPricing>({
    currency: "USD",
    earlyBird: 129,
    regular: 149,
    mrp: 199,
    symbol: "$"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      fetchCoursePricing(courseId)
      fetchCourse(courseId)
    } else {
      // If no courseId provided, fetch the first active course
      fetchActiveCourse()
    }
    detectLocation()
  }, [courseId])

  const fetchCoursePricing = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('course_pricing')
        .select('*')
        .eq('course_id', id)
        .single()

      if (error) throw error
      setCoursePricing(data)
    } catch (error) {
      console.error('Error fetching course pricing:', error)
      // Fallback to default pricing if none found
      setCoursePricing({
        id: '',
        course_id: id,
        inr_mrp: 9999,
        inr_regular: 6499,
        inr_early_bird: 5499,
        usd_mrp: 199,
        usd_regular: 149,
        usd_early_bird: 129,
        created_at: '',
        updated_at: ''
      })
    }
  }

  const fetchCourse = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, is_active, start_date, end_date')
        .eq('id', id)
        .single()

      if (error) throw error
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, is_active, start_date, end_date')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setCourse(data)
      await fetchCoursePricing(data.id)
    } catch (error) {
      console.error('Error fetching active course:', error)
      setLoading(false)
    }
  }

  const detectLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_code === 'IN') {
        setPricing(prev => ({
          ...prev,
          currency: "INR",
          symbol: "₹"
        }))
      }
    } catch (error) {
      console.log('Could not detect location, using default USD pricing')
    }
  }

  // Update pricing when course pricing changes
  useEffect(() => {
    if (coursePricing && pricing.currency) {
      if (pricing.currency === "INR") {
        setPricing(prev => ({
          ...prev,
          earlyBird: coursePricing.inr_early_bird,
          regular: coursePricing.inr_regular,
          mrp: coursePricing.inr_mrp
        }))
      } else {
        setPricing(prev => ({
          ...prev,
          earlyBird: coursePricing.usd_early_bird,
          regular: coursePricing.usd_regular,
          mrp: coursePricing.usd_mrp
        }))
      }
    }
  }, [coursePricing, pricing.currency])

  // For now, we'll use regular pricing until early bird functionality is re-implemented per course
  const currentPrice = pricing.regular

  return {
    pricing,
    coursePricing,
    course,
    currentPrice,
    loading,
    isEarlyBird: false, // Will be implemented later per course
    timeLeft: 0, // Will be implemented later per course
    formatTime: () => '' // Will be implemented later per course
  }
}