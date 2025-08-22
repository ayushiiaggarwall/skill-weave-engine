import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, MapPin, Tag, Clock, Shield, CreditCard, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { loadStripe } from '@stripe/stripe-js'

interface PriceData {
  region: 'in' | 'intl'
  currency: 'INR' | 'USD'
  amount: number
  display: string
  earlyBird: boolean
  couponApplied?: {
    code: string
    type: string
    value: number
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function EnhancedPaymentPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [regionOverride, setRegionOverride] = useState<'in' | 'intl' | null>(null)

  useEffect(() => {
    if (user?.email) {
      fetchPricing()
    }
  }, [user, regionOverride])

  const fetchPricing = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase.functions.invoke('pay-price', {
        body: {
          email: user.email,
          regionOverride,
          coupon: couponCode || undefined
        }
      })

      if (error) throw error
      setPriceData(data)
    } catch (error) {
      console.error('Error fetching pricing:', error)
      toast({
        title: "Error",
        description: "Failed to load pricing information",
        variant: "destructive"
      })
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim() || !user?.email) return

    setIsApplyingCoupon(true)
    try {
      const { data, error } = await supabase.functions.invoke('pay-price', {
        body: {
          email: user.email,
          regionOverride: priceData?.region,
          coupon: couponCode.trim()
        }
      })

      if (error) throw error
      setPriceData(data)
      
      if (data.couponApplied) {
        toast({
          title: "Coupon Applied!",
          description: `${data.couponApplied.code} - ${data.couponApplied.type === 'percent' ? `${data.couponApplied.value}% off` : `${data.currency === 'INR' ? '₹' : '$'}${data.couponApplied.value / 100} off`}`,
        })
      } else {
        toast({
          title: "Invalid Coupon",
          description: "The coupon code is not valid or has expired",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive"
      })
    }
    setIsApplyingCoupon(false)
  }

  const switchRegion = () => {
    const newRegion = priceData?.region === 'in' ? 'intl' : 'in'
    setRegionOverride(newRegion)
    setCouponCode("") // Clear coupon when switching regions
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    if (!user?.email || !priceData) return

    setIsLoading(true)
    try {
      // Load Razorpay script
      const res = await loadRazorpayScript()
      if (!res) {
        throw new Error("Razorpay SDK failed to load")
      }

      // Create order
      const { data: orderData, error } = await supabase.functions.invoke('pay-create-order', {
        body: {
          email: user.email,
          coupon: priceData.couponApplied?.code
        }
      })

      if (error) throw error

      const options = {
        key: orderData.keyId,
        amount: priceData.amount,
        currency: 'INR',
        name: "Tech With Ayushi Aggarwal",
        description: "5-Week No-Code to Product Course",
        order_id: orderData.orderId,
        handler: async function (_response: any) {
          toast({
            title: "Payment Successful!",
            description: "Welcome to the course! Redirecting to dashboard...",
          })
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 2000)
        },
        prefill: {
          name: user.user_metadata?.full_name || "",
          email: user.email,
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

    } catch (error) {
      console.error('Razorpay payment error:', error)
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const handleStripePayment = async () => {
    if (!user?.email || !priceData) return

    setIsLoading(true)
    try {
      // Create checkout session
      const { data: sessionData, error } = await supabase.functions.invoke('pay-create-session', {
        body: {
          email: user.email,
          coupon: priceData.couponApplied?.code
        }
      })

      if (error) throw error

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')
      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: sessionData.sessionId
      })

      if (redirectError) throw redirectError

    } catch (error) {
      console.error('Stripe payment error:', error)
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to access the payment page.</p>
            <Button 
              onClick={() => window.location.href = '/login'} 
              className="mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!priceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Enrollment</h1>
          <p className="text-muted-foreground">
            Secure your spot in the 5-Week No-Code to Product Course
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">5-Week No-Code to Product Course</h3>
                <p className="text-muted-foreground">
                  Master Lovable, Supabase, Apify, n8n, and APIs to build and launch your product
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">5 weeks of live classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Lifetime access to recordings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">7-day money back guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Region Selection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <Badge variant={priceData.region === 'in' ? 'default' : 'secondary'}>
                    {priceData.region === 'in' ? 'India (INR)' : 'International (USD)'}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={switchRegion}
                  className="text-xs"
                >
                  Switch Region
                </Button>
              </div>

              {/* Early Bird Badge */}
              {priceData.earlyBird && (
                <Badge variant="destructive" className="w-fit">
                  Early Bird Offer Active!
                </Badge>
              )}

              {/* Coupon Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Coupon Code (Optional)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1"
                  />
                  <Button 
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    variant="outline"
                  >
                    {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                {priceData.couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span>Discount ({priceData.couponApplied.code}):</span>
                    <span className="text-green-600">
                      -{priceData.couponApplied.type === 'percent' ? `${priceData.couponApplied.value}%` : priceData.display}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>{priceData.display}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {priceData.earlyBird ? "Early Bird Price" : "Regular Price"} • One-time payment
                </p>
              </div>

              {/* Payment Button */}
              <Button
                onClick={priceData.region === 'in' ? handleRazorpayPayment : handleStripePayment}
                disabled={isLoading}
                className="w-full"
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
                    Pay {priceData.display} - Enroll Now
                  </>
                )}
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>
                    Secured by {priceData.region === 'in' ? 'Razorpay' : 'Stripe'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}