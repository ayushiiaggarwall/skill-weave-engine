import { useEffect, useRef } from "react"
import { animate, stagger } from "animejs"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { SectionBadge } from "@/components/ui/section-badge"
import { Sparkles, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usePricing } from "@/hooks/use-pricing"
import { useAuth } from "@/contexts/auth-context"

export function PricingSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const featuresRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement>(null)
  const { pricing, isEarlyBird, timeLeft, formatTime } = usePricing()

  // Calculate combo pricing based on region  
  const comboEarlyPrice = pricing.currency === 'INR' ? '₹9,999' : '$199'
  const comboRegularPrice = pricing.currency === 'INR' ? '₹14,999' : '$2,949'
  const comboMrpPrice = pricing.currency === 'INR' ? '₹24,998' : '$799'
  
  const regularEarlyPrice = `${pricing.symbol}${pricing.earlyBird.toLocaleString()}`
  const regularRegularPrice = `${pricing.symbol}${pricing.regular.toLocaleString()}`
  const regularMrpPrice = `${pricing.symbol}${pricing.mrp.toLocaleString()}`
  
  const currentRegularPrice = isEarlyBird ? regularEarlyPrice : regularRegularPrice

  const handleEnrollClick = (pricingType: 'regular' | 'combo') => {
    if (!user) {
      navigate("/signup")
    } else {
      navigate(`/pay?type=${pricingType}`)
    }
  }

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

  const courseFeatures = [
    "5 Weeks of Live Classes (Sat & Sun, 7:30–10 PM IST)",
    "Final Week Q&A + Project Demos", 
    "Step-by-Step Curriculum — from basics to launch",
    "Hands-On Projects every week",
    "Lifetime Access to Recordings & Materials",
    "Community Support Group (peer discussions + resources)",
    "7 Days Money Back Guarantee"
  ]

  const comboFeatures = [
    "Everything in Complete Course Access",
    "Direct Mentorship in Community — personal replies to queries, typically within 24 hours",
    "Quick 1:1 Calls (10–15 mins) — scheduled within 24 hours if your issue can't be solved on text",
    "Personal Feedback on Projects",
    "Personal Guidance on Your Own Projects/Ideas",
    "Extra Post-Course Support — one follow-up call within 30 days"
  ]

  const comparisonFeatures = [
    { feature: "5 Weeks Live Classes", course: true, combo: true },
    { feature: "Lifetime Recordings", course: true, combo: true },
    { feature: "Weekly Projects", course: true, combo: true },
    { feature: "Community Group", course: true, combo: true },
    { feature: "Replies to Queries", course: "Group only", combo: "Personal replies within 24 hrs" },
    { feature: "Quick 1:1 Calls", course: "—", combo: "Scheduled within 24 hrs" },
    { feature: "Priority Project Feedback", course: "—", combo: true },
    { feature: "Post-Course Follow-Up Call", course: "—", combo: true }
  ]

  return (
    <section id="pricing" className="py-24 px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      {/* Floating background sparkles */}
      <div ref={sparklesRef} className="absolute inset-0 pointer-events-none">
        <Sparkles className="sparkle absolute top-20 left-20 w-6 h-6 text-primary/20" />
        <Sparkles className="sparkle absolute top-40 right-32 w-4 h-4 text-accent/20" />
        <Sparkles className="sparkle absolute bottom-32 left-1/4 w-5 h-5 text-yellow-400/20" />
        <Sparkles className="sparkle absolute bottom-20 right-20 w-3 h-3 text-primary/20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionBadge>
            Pricing
          </SectionBadge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Both plans include 5 weeks of live classes, projects, and lifetime access to recordings.
          </p>
        </div>

        {/* Early Bird Timer */}
        {isEarlyBird && (
          <div className="flex justify-center mb-8">
            <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">Early Bird Ends: {formatTime(timeLeft)}</span>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Course Only Plan */}
          <AnimatedCard 
            delay={400}
            animationType="scale"
            className="glass-card-strong border-primary/30 shadow-xl hover-lift opacity-0 relative"
          >
            <AnimatedCardHeader className="text-center pb-6">
              <AnimatedCardTitle className="text-2xl font-bold mb-4">
                Complete Course Access
              </AnimatedCardTitle>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-xl text-muted-foreground line-through">
                    {regularMrpPrice}
                  </span>
                </div>
                <div className="text-5xl font-bold text-gradient">
                  {currentRegularPrice}
                </div>
                <p className="text-muted-foreground">
                  {isEarlyBird ? "Early Bird Offer" : "Regular Price"} • One-time payment
                </p>
              </div>
            </AnimatedCardHeader>
            
            <AnimatedCardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {courseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 flex-shrink-0 mt-0.5">✅</span>
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <AnimatedButton 
                size="lg" 
                animation="glow"
                className="w-full py-4 text-lg font-semibold hover-glow"
                onClick={() => handleEnrollClick('regular')}
              >
                Enroll Now — {currentRegularPrice}
              </AnimatedButton>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Combo Plan */}
          <AnimatedCard 
            delay={600}
            animationType="scale"
            className="glass-card-strong border-accent/50 shadow-xl hover-lift opacity-0 relative"
          >
            {/* Ribbon */}
            <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-lg transform rotate-12">
              Best Value • Limited Seats
            </div>

            <AnimatedCardHeader className="text-center pb-6">
              <AnimatedCardTitle className="text-2xl font-bold mb-4">
                Course + 1:1 Mentorship Combo
              </AnimatedCardTitle>
              
              <div className="space-y-2">
                <div className="text-lg font-medium text-muted-foreground text-center">
                  {comboEarlyPrice} + {comboRegularPrice} = {comboMrpPrice}
                </div>
                <div className="text-4xl font-bold text-gradient">
                  You Pay Only {comboEarlyPrice}
                </div>
                <p className="text-accent font-semibold">
                  Save {pricing.currency === 'INR' ? '₹15,000+' : '$600+'} on the bundle • For limited time period
                </p>
              </div>
            </AnimatedCardHeader>
            
            <AnimatedCardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {comboFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 flex-shrink-0 mt-0.5">✅</span>
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <AnimatedButton 
                size="lg" 
                animation="glow"
                className="w-full py-4 text-lg font-semibold hover-glow"
                onClick={() => handleEnrollClick('combo')}
              >
                Enroll with 1:1 Mentorship — {comboEarlyPrice}
              </AnimatedButton>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        {/* Comparison Table */}
        <div className="bg-card/50 rounded-2xl p-8 backdrop-blur-sm border">
          <h3 className="text-2xl font-bold text-center mb-8 text-gradient">
            Plan Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">Course Only</th>
                  <th className="text-center py-4 px-4 font-semibold">Course + Mentorship</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-4 px-4 text-sm">{item.feature}</td>
                    <td className="text-center py-4 px-4 text-sm">
                      {typeof item.course === 'boolean' ? (
                        item.course ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">{item.course}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-sm">
                      {typeof item.combo === 'boolean' ? (
                        item.combo ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-accent font-medium">{item.combo}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky CTA Bar - placeholder for now */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-card/80 backdrop-blur-sm rounded-full px-8 py-4 border shadow-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Next cohort starts:</span>
              <span className="font-semibold text-accent">Sep 21, 2025 - Induction</span>
              <AnimatedButton 
                size="sm"
                onClick={() => handleEnrollClick('regular')}
                className="ml-4"
              >
                Enroll Now
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}