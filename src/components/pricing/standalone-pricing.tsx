import { useEffect, useRef } from "react"
import { animate, stagger } from "animejs"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Check, Zap, Sparkles, Clock } from "lucide-react"
import { usePricing } from "@/hooks/use-pricing"
import { useAuth } from "@/contexts/auth-context"

export function StandalonePricing() {
  const featuresRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement>(null)
  const { pricing, isEarlyBird, timeLeft, currentPrice, formatTime } = usePricing()
  const { user } = useAuth()

  // Animate features on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && featuresRef.current) {
            animate(featuresRef.current.querySelectorAll('.feature-item'), {
              opacity: [0, 1],
              translateX: [-20, 0],
              duration: 600,
              delay: stagger(100, { start: 600 }),
              ease: 'out(3)',
            })
          }
        })
      },
      { threshold: 0.3 }
    )

    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Floating sparkles animation
  useEffect(() => {
    if (sparklesRef.current) {
      const sparkles = sparklesRef.current.querySelectorAll('.sparkle')
      animate(sparkles, {
        translateY: [-10, 10],
        rotate: [0, 360],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 1, 0.3],
        duration: 3000,
        delay: stagger(500),
        ease: 'inOut(3)',
        loop: true,
      })
    }
  }, [])

  const features = [
    "5 Weeks of Live Classes (Saturdays & Sundays, 7:30-10 PM IST)",
    "Final Week Q&A + Project Demos",
    "Step-by-Step Curriculum — from basics to launch",
    "Hands-On Projects every week",
    "Personalized Feedback & Guidance",
    "Lifetime Access to Recordings & Materials",
    "Community Support Group (peer discussions + resources)"
  ]

  const handleEnrollNow = () => {
    if (user) {
      // User is signed in, redirect to enhanced payment page
      window.location.href = '/pay'
    } else {
      // User not signed in, redirect to signup with enrollment intent
      window.location.href = '/signup?enroll=true'
    }
  }

  return (
    <div className="min-h-screen bg-background py-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Floating background sparkles */}
      <div ref={sparklesRef} className="absolute inset-0 pointer-events-none">
        <Sparkles className="sparkle absolute top-20 left-20 w-6 h-6 text-primary/20" />
        <Sparkles className="sparkle absolute top-40 right-32 w-4 h-4 text-accent/20" />
        <Sparkles className="sparkle absolute bottom-32 left-1/4 w-5 h-5 text-yellow-400/20" />
        <Sparkles className="sparkle absolute bottom-20 right-20 w-3 h-3 text-primary/20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            From No-Code to Product
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A hands-on course where you'll master modern tools like Lovable, Supabase, Apify, n8n, and APIs — and walk away with a live project you can showcase.
          </p>
        </div>

        <div className="relative">
          {/* Early Bird Timer */}
          {isEarlyBird && (
            <div className="absolute -top-8 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10 px-4">
              <div className="bg-red-500 text-white px-3 sm:px-6 py-2 rounded-full shadow-lg animate-pulse flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="font-semibold whitespace-nowrap">Early Bird Ends: {formatTime(timeLeft)}</span>
              </div>
            </div>
          )}

          <AnimatedCard 
            delay={400}
            hoverScale={1.01}
            animationType="scale"
            className="glass-card-strong border-primary/50 shadow-2xl opacity-0"
          >
            <AnimatedCardHeader className="text-center pb-8 pt-8">
              <AnimatedCardTitle className="text-3xl font-bold mb-4">
                Complete Course Access
              </AnimatedCardTitle>
               <div className="space-y-2">
                 <div className="flex items-center justify-center space-x-2 mb-2">
                   <span className="text-2xl text-muted-foreground line-through">
                     {pricing.symbol}{pricing.mrp}
                   </span>
                 </div>
                 <div className="text-6xl font-bold text-gradient">
                   {pricing.symbol}{currentPrice}
                 </div>
                 <p className="text-muted-foreground">
                   {isEarlyBird ? "Early Bird Offer" : "Regular Price"} • One-time payment
                 </p>
               </div>
            </AnimatedCardHeader>
            
            <AnimatedCardContent className="space-y-8">
              {/* Features */}
              <div ref={featuresRef} className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="feature-item flex items-start opacity-0"
                  >
                    <Check className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Guarantee */}
              <AnimatedCard
                delay={800}
                animationType="fadeUp"
                className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors duration-300"
              >
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 mr-2 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    7 Days Money Back Guarantee
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Not satisfied? Get a full refund within 7 days, no questions asked.
                </p>
              </AnimatedCard>

              {/* CTA Button */}
              <div className="space-y-4">
                <AnimatedButton 
                  size="lg" 
                  animation="glow"
                  className="w-full py-6 text-lg font-semibold bg-yellow hover-glow"
                  onClick={handleEnrollNow}
                >
                  Enroll Now
                </AnimatedButton>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}