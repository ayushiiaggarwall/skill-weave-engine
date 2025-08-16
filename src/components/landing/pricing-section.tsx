import { useEffect, useRef } from "react"
import { animate, stagger } from "animejs"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { SectionBadge } from "@/components/ui/section-badge"
import { Badge } from "@/components/ui/badge"
import { courseData } from "@/lib/course-data"
import { Check, Star, Zap, Sparkles } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export function PricingSection() {
  const navigate = useNavigate()
  const featuresRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement>(null)
  
  const features = [
    "5-week structured curriculum",
    "Access to all no-code tools",
    "Personal project mentorship", 
    "Lifetime community access",
    "Certificate of completion",
    "Money-back guarantee"
  ]

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

  return (
    <section id="pricing" className="py-24 px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      {/* Floating background sparkles */}
      <div ref={sparklesRef} className="absolute inset-0 pointer-events-none">
        <Sparkles className="sparkle absolute top-20 left-20 w-6 h-6 text-primary/20" />
        <Sparkles className="sparkle absolute top-40 right-32 w-4 h-4 text-accent/20" />
        <Sparkles className="sparkle absolute bottom-32 left-1/4 w-5 h-5 text-yellow-400/20" />
        <Sparkles className="sparkle absolute bottom-20 right-20 w-3 h-3 text-primary/20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionBadge>
            💰 Simple Pricing
          </SectionBadge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            One Price, Everything Included
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no monthly subscriptions. Pay once and get lifetime access 
            to everything you need to build your product empire.
          </p>
        </div>

        <div className="relative">
          {/* Popular badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="px-6 py-2 bg-primary text-primary-foreground border-primary shadow-lg animate-pulse-glow">
              <Star className="w-4 h-4 mr-1 fill-current" />
              Most Popular
            </Badge>
          </div>

          <AnimatedCard 
            delay={400}
            hoverScale={1.01}
            animationType="scale"
            className="glass-card-strong border-primary/50 shadow-2xl opacity-0"
          >
            <AnimatedCardHeader className="text-center pb-8">
              <AnimatedCardTitle className="text-3xl font-bold mb-4">
                Complete Course Access
              </AnimatedCardTitle>
              <div className="space-y-2">
                <div className="text-6xl font-bold text-gradient">
                  {formatCurrency(courseData.price)}
                </div>
                <p className="text-muted-foreground">
                  One-time payment • Lifetime access
                </p>
              </div>
            </AnimatedCardHeader>
            
            <AnimatedCardContent className="space-y-8">
              {/* Features */}
              <div ref={featuresRef} className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="feature-item flex items-center opacity-0"
                  >
                    <Check className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
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
                    30-Day Money-Back Guarantee
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </AnimatedCard>

              {/* CTA Button */}
              <div className="space-y-4">
                <AnimatedButton 
                  size="lg" 
                  animation="glow"
                  className="w-full py-6 text-lg font-semibold button-3d hover-glow"
                  onClick={() => navigate("/signup")}
                >
                  Enroll Now - {formatCurrency(courseData.price)}
                </AnimatedButton>
              </div>

              {/* Trust indicators */}
              <AnimatedCard
                delay={1000}
                animationType="fadeUp"
                className="text-center text-sm text-muted-foreground bg-transparent border-0 shadow-none"
              >
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-2">4.9/5 from {courseData.stats.students}+ students</span>
                  </div>
                </div>
                <p>Secure payment • SSL encrypted • Cancel anytime</p>
              </AnimatedCard>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>
      </div>
    </section>
  )
}
