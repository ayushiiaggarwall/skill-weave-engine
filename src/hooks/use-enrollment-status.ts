import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export interface EnrollmentStatus {
  isEnrolled: boolean
  hasActiveCohort: boolean
  paymentStatus: 'pending' | 'completed' | 'failed' | 'paid' | null
  cohortName?: string
  loading: boolean
}

export function useEnrollmentStatus(): EnrollmentStatus {
  const { user } = useAuth()
  const [status, setStatus] = useState<EnrollmentStatus>({
    isEnrolled: false,
    hasActiveCohort: false,
    paymentStatus: null,
    loading: true
  })

  useEffect(() => {
    if (!user) {
      setStatus({
        isEnrolled: false,
        hasActiveCohort: false,
        paymentStatus: null,
        loading: false
      })
      return
    }

    const checkEnrollmentStatus = async () => {
      try {
        // Check for completed enrollments
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            payment_status,
            cohort_id,
            cohorts (
              name,
              is_active
            )
          `)
          .eq('user_id', user.id)

        if (enrollmentError) {
          console.error('Error fetching enrollments:', enrollmentError)
          return
        }

        // Check for completed order enrollments
        const { data: orderEnrollments, error: orderError } = await supabase
          .from('order_enrollments')
          .select('status, user_email, user_id')
          .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)

        if (orderError) {
          console.error('Error fetching order enrollments:', orderError)
          return
        }

        const hasCompletedPayment = orderEnrollments?.some(order => order.status === 'paid') || false
        const hasActiveCohortEnrollment = enrollments?.some(
          enrollment => enrollment.payment_status === 'paid' && enrollment.cohorts?.is_active
        ) || false

        const activeCohort = enrollments?.find(
          enrollment => enrollment.payment_status === 'paid' && enrollment.cohorts?.is_active
        )?.cohorts

        setStatus({
          isEnrolled: hasCompletedPayment || hasActiveCohortEnrollment,
          hasActiveCohort: hasActiveCohortEnrollment,
          paymentStatus: hasCompletedPayment ? 'completed' : enrollments?.[0]?.payment_status || null,
          cohortName: activeCohort?.name,
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