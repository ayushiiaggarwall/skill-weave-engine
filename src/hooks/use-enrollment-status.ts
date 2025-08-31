import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export interface EnrollmentStatus {
  isEnrolled: boolean
  hasActiveCourse: boolean
  paymentStatus: 'pending' | 'completed' | 'failed' | 'paid' | null
  courseName?: string
  courseData?: {
    id: string
    title: string
    objective: string
    start_date: string | null
    end_date: string | null
    total_weeks: number | null
    plans: string[]
  }
  loading: boolean
}

export function useEnrollmentStatus(): EnrollmentStatus {
  const { user } = useAuth()
  const [status, setStatus] = useState<EnrollmentStatus>({
    isEnrolled: false,
    hasActiveCourse: false,
    paymentStatus: null,
    courseData: undefined,
    loading: true
  })

  useEffect(() => {
    if (!user) {
      setStatus({
        isEnrolled: false,
        hasActiveCourse: false,
        paymentStatus: null,
        courseData: undefined,
        loading: false
      })
      return
    }

    const checkEnrollmentStatus = async () => {
      try {
        console.log('Checking enrollment for user:', user.id, user.email)
        
        // Check for completed order enrollments (primary method now)
        const { data: orderEnrollments, error: orderError } = await supabase
          .from('order_enrollments')
          .select(`
            status, 
            user_email, 
            user_id, 
            course_id,
            courses(
              id,
              title,
              objective,
              start_date,
              end_date,
              total_weeks,
              plans
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'paid')

        console.log('Order enrollments data:', orderEnrollments)
        console.log('Order enrollments error:', orderError)

        if (orderError) {
          console.error('Error fetching order enrollments:', orderError)
          return
        }

        const hasCompletedPayment = orderEnrollments?.some(order => 
          order.status === 'paid'
        ) || false

        const paidOrder = orderEnrollments?.find(order => order.status === 'paid')
        const courseData = paidOrder?.courses

        console.log('Has completed payment:', hasCompletedPayment)
        console.log('Paid order:', paidOrder)
        console.log('Course data:', courseData)

        setStatus({
          isEnrolled: hasCompletedPayment,
          hasActiveCourse: hasCompletedPayment,
          paymentStatus: hasCompletedPayment ? 'completed' : null,
          courseName: courseData?.title || 'Course',
          courseData: courseData ? {
            id: courseData.id,
            title: courseData.title,
            objective: courseData.objective,
            start_date: courseData.start_date,
            end_date: courseData.end_date,
            total_weeks: courseData.total_weeks,
            plans: courseData.plans || []
          } : undefined,
          loading: false
        })
      } catch (error) {
        console.error('Error checking enrollment status:', error)
        setStatus(prev => ({ ...prev, loading: false }))
      }
    }

    checkEnrollmentStatus()
  }, [user])

  return status
}