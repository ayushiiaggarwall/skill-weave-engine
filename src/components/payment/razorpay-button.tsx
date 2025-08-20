import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { courseData } from "@/lib/course-data"
import { Loader2, CreditCard, Shield } from "lucide-react"
import { usePricing } from "@/hooks/use-pricing"

interface RazorpayButtonProps {
  userId: string
  className?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayButton({ userId, className }: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { currentPrice, pricing } = usePricing()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Load Razorpay script
      const res = await loadRazorpayScript()

      if (!res) {
        setError("Razorpay SDK failed to load. Please check your internet connection.")
        setIsLoading(false)
        return
      }

      // Get user data
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setError("Please login to continue with payment")
        setIsLoading(false)
        return
      }

      // Convert price to paise (Razorpay uses paise for INR)
      const amountInPaise = Math.round(currentPrice * 100)

      const options = {
        key: "rzp_test_9999999999", // Replace with your Razorpay key
        amount: amountInPaise,
        currency: pricing.currency === 'USD' ? 'USD' : 'INR',
        name: "Tech With Ayushi Aggarwal",
        description: courseData.title,
        image: "/lovable-uploads/3adc5900-46cf-4e08-bc38-cee33b919768.png",
        order_id: "", // You can generate order_id from backend
        handler: async function (response: any) {
          try {
            // Save enrollment to database
            const { error: enrollmentError } = await supabase
              .from('enrollments')
              .insert({
                user_id: userId,
                course_id: courseData.id,
                payment_id: response.razorpay_payment_id,
                payment_status: 'completed',
                amount: currentPrice,
                currency: pricing.currency,
                created_at: new Date().toISOString()
              })

            if (enrollmentError) {
              console.warn("Could not save enrollment:", enrollmentError)
            }

            // Show success message
            alert("🎉 Payment successful! Welcome to the course!")
            window.location.href = "/dashboard"
          } catch (err) {
            console.error("Error saving enrollment:", err)
            alert("Payment successful but there was an issue saving your enrollment. Please contact support.")
          }
        },
        prefill: {
          name: user.user.user_metadata?.full_name || "",
          email: user.user.email,
          contact: ""
        },
        notes: {
          address: "Course Enrollment",
          course_id: courseData.id
        },
        theme: {
          color: "#7C3AED"
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false)
          }
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()

    } catch (err) {
      setError("Payment failed. Please try again.")
      console.error("Payment error:", err)
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
        className={`w-full ${className}`}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {pricing.symbol}{currentPrice} - Enroll Now
          </>
        )}
      </Button>
      
      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground mt-2">
        <Shield className="w-3 h-3" />
        <span>Secured by Razorpay</span>
      </div>
    </div>
  )
}