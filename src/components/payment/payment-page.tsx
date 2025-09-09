import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RazorpayButton } from "./razorpay-button"
import { supabase } from "@/lib/supabase"
import { courseData } from "@/lib/course-data"
import { Check, ArrowLeft, Shield, CreditCard, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
}

interface PriceData {
  region: 'in' | 'intl'
  currency: 'INR' | 'USD'
  amount: number
  display: string
  earlyBird: boolean
}

export function PaymentPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
        return
      }
      setUser(user as User)
      setIsLoading(false)
    }
    getUser()
  }, [navigate])

  useEffect(() => {
    if (user?.email) {
      fetchPricing()
    }
  }, [user])

  const fetchPricing = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase.functions.invoke('pay-price', {
        body: {
          email: user.email
        }
      })

      if (error) throw error
      setPriceData(data)
    } catch (error) {
      console.error('Error fetching pricing:', error)
    }
  }

  if (isLoading || !priceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Complete Your Enrollment
          </h1>
          <p className="text-xl text-muted-foreground">
            You're just one step away from starting your no-code journey!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">
                  {courseData.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {courseData.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">What's included:</h4>
                  {[
                    "5-week structured curriculum",
                    "Access to all no-code tools",
                    "Personal project mentorship",
                    "Lifetime community access",
                    "Certificate of completion",
                    "30-day money-back guarantee"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  {/* Region Detection */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <Badge variant={priceData.region === 'in' ? 'default' : 'secondary'}>
                      {priceData.region === 'in' ? 'India (INR)' : 'International (USD)'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Auto-detected
                    </span>
                  </div>

                  {/* Early Bird Badge */}
                  {priceData.earlyBird && (
                    <Badge variant="destructive" className="w-fit">
                      Early Bird Offer Active!
                    </Badge>
                  )}

                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-2xl text-gradient">
                      {priceData.display}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {priceData.earlyBird ? "Early Bird Price" : "Regular Price"} • One-time payment
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="text-xl">Payment Details</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure payment powered by Razorpay
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Student:</span>
                      <span className="text-muted-foreground">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Badge className="w-full justify-center py-2 bg-green-500/10 text-green-600 border-green-500/20">
                      ✅ 30-Day Money-Back Guarantee
                    </Badge>
                    
                    <RazorpayButton 
                      userId={user.id}
                      className="w-full py-6 text-lg font-semibold button-3d hover-glow"
                    />

                    <div className="text-center text-sm text-muted-foreground">
                      <p>By enrolling, you agree to our Terms of Service and Privacy Policy</p>
                    </div>
                  </div>
                </div>

                {/* Security badges */}
                <div className="pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <CreditCard className="w-6 h-6 text-primary mb-2" />
                      <span className="text-xs text-muted-foreground">SSL Secured</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Shield className="w-6 h-6 text-green-500 mb-2" />
                      <span className="text-xs text-muted-foreground">Safe & Secure</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
