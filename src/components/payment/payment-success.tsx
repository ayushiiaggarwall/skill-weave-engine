import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Loader2, XCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if this is a PayPal return
    const token = searchParams.get('token')
    const payerId = searchParams.get('PayerID')
    
    if (token && payerId) {
      // This is a PayPal return, capture the payment
      setIsProcessing(true)
      capturePayPalPayment(token)
    } else {
      // This is likely a Razorpay success (which handles capture automatically)
      setIsSuccess(true)
      // Redirect to dashboard after 3 seconds
      const timer = setTimeout(() => {
        window.location.href = "/dashboard"
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const capturePayPalPayment = async (orderId: string) => {
    try {
      const { error } = await supabase.functions.invoke('paypal-capture-order', {
        body: { orderId }
      })

      if (error) throw error

      setIsSuccess(true)
      toast({
        title: "Payment Successful!",
        description: "Welcome to the course! You'll be redirected to your dashboard.",
      })

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 3000)
    } catch (error) {
      console.error('Payment capture error:', error)
      setError(error instanceof Error ? error.message : "Payment processing failed")
      toast({
        title: "Payment Error",
        description: "There was an issue processing your payment. Please contact support.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            {isProcessing && (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold text-blue-700 mb-2">
                  Processing Payment...
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we process your PayPal payment
                </p>
              </>
            )}
            
            {isSuccess && !error && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-700 mb-2">
                  Payment Successful! 🎉
                </h1>
                <p className="text-muted-foreground">
                  Welcome to the 5-Week No-Code to Product Course!
                </p>
              </>
            )}
            
            {error && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-700 mb-2">
                  Payment Error
                </h1>
                <p className="text-muted-foreground">
                  {error}
                </p>
              </>
            )}
          </div>

          <div className="space-y-4">
            {isSuccess && !error && (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm">
                    You'll receive a confirmation email shortly with course details and access instructions.
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard in 3 seconds...
                </p>

                <Button 
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            )}
            
            {error && (
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = "/contact"}
                  className="w-full"
                  size="lg"
                >
                  Contact Support
                </Button>
                <Button 
                  onClick={() => window.location.href = "/pricing"}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}