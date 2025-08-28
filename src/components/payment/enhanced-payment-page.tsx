import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, MapPin, Tag, Clock, Shield, CreditCard, Globe, Heart } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

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
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('course') // Get course ID from URL
  const pricingType = searchParams.get('type') || 'regular' // Fallback for old links
  const [isLoading, setIsLoading] = useState(false)
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [courseData, setCourseData] = useState<any>(null)
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [invalidCouponError, setInvalidCouponError] = useState(false)
  const [interestName, setInterestName] = useState("")
  const [interestMessage, setInterestMessage] = useState("")
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false)
  const [interestSubmitted, setInterestSubmitted] = useState(false)
  useEffect(() => {
    if (user?.email && (courseId || pricingType)) {
      fetchPricing()
      if (courseId) {
        fetchCourseData()
      }
    }
  }, [user, courseId, pricingType])

  const fetchCourseData = async () => {
    if (!courseId) return

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (error) throw error
      setCourseData(data)
    } catch (error) {
      console.error('Error fetching course:', error)
    }
  }

  const fetchPricing = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase.functions.invoke('pay-price', {
        body: {
          email: user.email,
          courseId: courseId, // Pass the course ID
          coupon: couponCode || undefined,
          pricingType: pricingType // Fallback for old links
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
    setInvalidCouponError(false) // Reset error state
    try {
      const { data, error } = await supabase.functions.invoke('pay-price', {
        body: {
          email: user.email,
          courseId: courseId,
          coupon: couponCode.trim(),
          pricingType: pricingType
        }
      })

      if (error) {
        console.error('Error applying coupon:', error)
        toast({
          title: "Error",
          description: "Failed to apply coupon",
          variant: "destructive"
        })
        setIsApplyingCoupon(false)
        return
      }
      
      setPriceData(data)
      
      // Check if coupon was invalid
      if (data.invalidCoupon) {
        setInvalidCouponError(true)
      } else if (data.couponApplied) {
        setInvalidCouponError(false)
        toast({
          title: "Coupon Applied!",
          description: `${data.couponApplied.code} - ${data.couponApplied.type === 'percent' ? `${data.couponApplied.value}% off` : `${data.currency === 'INR' ? '₹' : '$'}${data.couponApplied.value / 100} off`}`,
        })
      }
    } catch (error: any) {
      console.error('Error applying coupon:', error)
      // Handle FunctionsHttpError for invalid coupons
      if (error?.name === 'FunctionsHttpError' || (error?.message && error.message.includes('non-2xx status code'))) {
        setInvalidCouponError(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to apply coupon",
          variant: "destructive"
        })
      }
    }
    setIsApplyingCoupon(false)
  }

  const handleInterestSubmission = async () => {
    if (!user?.email || !interestName.trim()) return

    setIsSubmittingInterest(true)
    try {
      const { error } = await supabase
        .from('international_interest')
        .insert({
          user_id: user.id,
          email: user.email,
          name: interestName.trim(),
          course_id: courseId,
          course_type: pricingType,
          message: interestMessage.trim() || undefined
        })

      if (error) throw error

      setInterestSubmitted(true)
      toast({
        title: "Interest Registered!",
        description: "We'll notify you when international payments are available.",
      })
    } catch (error) {
      console.error('Error submitting interest:', error)
      toast({
        title: "Error",
        description: "Failed to register interest. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingInterest(false)
    }
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
          courseId: courseId,
          coupon: priceData.couponApplied?.code,
          pricingType: pricingType
        }
      })

      if (error) throw error

      const options = {
        key: orderData.keyId,
        amount: priceData.amount,
        currency: 'INR',
        name: "Tech With Ayushi Aggarwal",
        description: "5-Week Idea to Product Course",
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
            Secure your spot in the 5-Week Idea to Product Course
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
                <h3 className="font-semibold text-lg">
                  {courseData?.title || (pricingType === 'combo' ? '5-Week Course + 1:1 Mentorship Combo' : '5-Week Idea to Product Course')}
                </h3>
                <p className="text-muted-foreground">
                  {courseData?.title?.toLowerCase().includes('mentorship') || pricingType === 'combo'
                    ? 'Complete course access with personal mentorship and 1:1 calls'
                    : 'Master Lovable, Supabase, Apify, n8n, and APIs to build and launch your product'
                  }
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
                {(courseData?.title?.toLowerCase().includes('mentorship') || pricingType === 'combo') && (
                  <>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Personal 1:1 mentorship calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Priority project feedback</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Region Detection */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <Badge variant={priceData.region === 'in' ? 'default' : 'secondary'}>
                  {priceData.region === 'in' ? 'India (INR)' : 'International (USD)'}
                </Badge>
                <span className="text-xs text-muted-foreground">Auto-detected</span>
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
                {invalidCouponError && (
                  <div className="text-red-500 text-sm font-medium">
                    Invalid coupon code
                  </div>
                )}
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

              {/* Payment Button - India */}
              {priceData.region === 'in' ? (
                <>
                  <Button
                    onClick={handleRazorpayPayment}
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
                        Pay {priceData.display} - Enroll Now via Razorpay
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>Secured by Razorpay</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* International Payment Coming Soon */}
                  <div className="space-y-4">
                    <Button
                      disabled
                      className="w-full"
                      size="lg"
                      variant="secondary"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      International Payments - Coming Soon
                    </Button>

                    {!interestSubmitted ? (
                      <>
                        <div className="text-center text-sm text-muted-foreground">
                          Want to be notified when available?
                        </div>
                        
                        <div className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">I'm interested!</span>
                          </div>
                          
                          <Input
                            value={interestName}
                            onChange={(e) => setInterestName(e.target.value)}
                            placeholder="Your name"
                            className="w-full"
                          />
                          
                          <Textarea
                            value={interestMessage}
                            onChange={(e) => setInterestMessage(e.target.value)}
                            placeholder="Tell us about your interest (optional)"
                            className="w-full resize-none"
                            rows={3}
                          />
                          
                          <Button
                            onClick={handleInterestSubmission}
                            disabled={isSubmittingInterest || !interestName.trim()}
                            className="w-full"
                            size="sm"
                          >
                            {isSubmittingInterest ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Heart className="mr-2 h-4 w-4" />
                                Register Interest
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 border rounded-lg bg-muted/50">
                        <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-primary">Thank you for your interest!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          We'll notify you as soon as international payments are available.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}