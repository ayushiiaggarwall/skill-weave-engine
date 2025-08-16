import { useState } from "react"
import { Button } from "@/components/ui/button"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"
import { courseData } from "@/lib/course-data"
import { Loader2, CreditCard } from "lucide-react"

interface PaymentButtonProps {
  userId: string
  className?: string
}

export function PaymentButton({ userId, className }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePayment = async () => {
    if (!stripe) {
      setError("Payment system not available")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create a simple checkout session (mock implementation)
      // In a real app, this would call your backend API
      const sessionData = {
        user_id: userId,
        course_id: courseData.id,
        amount: courseData.price * 100, // Stripe expects amount in cents
        currency: courseData.currency.toLowerCase(),
        success_url: `${window.location.origin}/dashboard?payment=success`,
        cancel_url: `${window.location.origin}/dashboard?payment=cancelled`,
      }

      // For demo purposes, simulate a successful payment
      // In production, you would:
      // 1. Call your backend to create a Stripe checkout session
      // 2. Get the session ID from the response
      // 3. Redirect to Stripe checkout
      
      console.log("Creating payment session:", sessionData)
      
      // Simulate enrollment in the database
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseData.id,
          payment_status: 'completed',
          created_at: new Date().toISOString()
        })

      if (enrollmentError) {
        console.warn("Could not save enrollment (demo mode):", enrollmentError)
      }

      // Simulate successful payment
      setTimeout(() => {
        alert("🎉 Payment successful! Welcome to the course!")
        window.location.href = "/dashboard"
      }, 1500)

    } catch (err) {
      setError("Payment failed. Please try again.")
      console.error("Payment error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${courseData.price} - Enroll Now
          </>
        )}
      </Button>
    </div>
  )
}
