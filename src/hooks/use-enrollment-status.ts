import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export interface EnrollmentStatus {
  isEnrolled: boolean
  hasActiveCourse: boolean
  paymentStatus: 'pending' | 'completed' | 'failed' | 'paid' | null
  courseName?: string
  loading: boolean
}

export function useEnrollmentStatus(): EnrollmentStatus {
  const { user } = useAuth()
  const [status, setStatus] = useState<EnrollmentStatus>({
    isEnrolled: false,
    hasActiveCourse: false,
    paymentStatus: null,
    loading: true
  })

  useEffect(() => {
    if (!user) {
      setStatus({
        isEnrolled: false,
        hasActiveCourse: false,
        paymentStatus: null,
        loading: false
      })
      return
    }

    const checkEnrollmentStatus = async () => {
      try {
        // Check for completed order enrollments (primary method now)
        const { data: orderEnrollments, error: orderError } = await supabase
          .from('order_enrollments')
          .select('status, user_email, user_id, courses(title)')
          .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)

        if (orderError) {
          console.error('Error fetching order enrollments:', orderError)
          return
        }

        const hasCompletedPayment = orderEnrollments?.some(order => 
          order.status === 'paid'
        ) || false

        const paidOrder = orderEnrollments?.find(order => order.status === 'paid')

        setStatus({
          isEnrolled: hasCompletedPayment,
          hasActiveCourse: hasCompletedPayment,
          paymentStatus: hasCompletedPayment ? 'completed' : null,
          courseName: paidOrder?.courses?.title || 'Course',
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