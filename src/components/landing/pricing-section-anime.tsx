import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { courseData } from "@/lib/course-data"
import { Check, Star, Zap, Crown, Sparkles, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { animate as anime } from 'animejs'

function AnimatedPricingCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (cardRef.current) {
      // Main card entrance
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        scale: [0.8, 1],
        rotateY: [25, 0],
        translateY: [80, 0],
        duration: 1200,
        delay: 500,
        easing: 'easeOutElastic(1, .6)',
      })

      // Price animation
      if (priceRef.current) {
        anime({
          targets: priceRef.current.querySelector('.price-amount'),
          innerHTML: [0, courseData.pricing.price],
          duration: 2000,
          delay: 1000,
          easing: 'easeOutExpo',
          round: 1,
        })

        // Price highlight effect
        anime({
          targets: priceRef.current,
          backgroundColor: [
            { value: 'hsla(var(--primary), 0.1)' },
            { value: 'hsla(var(--accent), 0.1)' },
            { value: 'hsla(var(--primary), 0.1)' }
          ],
          duration: 3000,
          delay: 1500,
          easing: 'easeInOutSine',
          loop: true,
        })
      }

      // Features stagger animation
      if (featuresRef.current) {
        const features = featuresRef.current.querySelectorAll('.feature-item')
        anime({
          targets: features,
          opacity: [0, 1],
          translateX: [-50, 0],
          duration: 600,
          delay: anime.stagger(100, { start: 1200 }),
          easing: 'easeOutExpo',
        })

        // Check marks animation
        anime({
          targets: featuresRef.current.querySelectorAll('.check-icon'),
          scale: [0, 1],
          rotate: [180, 0],
          duration: 400,
          delay: anime.stagger(150, { start: 1400 }),
          easing: 'easeOutElastic(1, .8)',
        })
      }

      // Button animation
      if (buttonRef.current) {
        anime({
          targets: buttonRef.current,
          opacity: [0, 1],
          scale: [0.9, 1],
          translateY: [30, 0],
          duration: 800,
          delay: 2000,
          easing: 'easeOutElastic(1, .8)',
        })
      }

      // Floating animation
      anime({
        targets: cardRef.current,
        translateY: [-5, 5],
        duration: 4000,
        delay: 2500,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      })

      // Hover effects
      const handleMouseEnter = () => {
        anime({
          targets: cardRef.current,
          scale: 1.05,
          rotateX: 5,
          rotateY: 5,
          duration: 400,
          easing: 'easeOutQuart',
        })

        // Animate sparkles
        const sparkles = cardRef.current?.querySelectorAll('.sparkle-icon')
        if (sparkles) {
          anime({
            targets: sparkles,
            scale: [1, 1.5, 1],
            rotate: [0, 360],
            opacity: [0.5, 1, 0.5],
            duration: 800,
            easing: 'easeOutElastic(1, .8)',
          })
        }

        // Button glow effect
        if (buttonRef.current) {
          anime({
            targets: buttonRef.current,
            boxShadow: [
              { value: '0 0 20px hsla(var(--primary), 0.3)' },
              { value: '0 0 40px hsla(var(--primary), 0.6)' }
            ],
            duration: 300,
            easing: 'easeOutQuad',
          })
        }
      }

      const handleMouseLeave = () => {
        anime({
          targets: cardRef.current,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          duration: 300,
          easing: 'easeOutQuad',
        })

        if (buttonRef.current) {
          anime({
            targets: buttonRef.current,
            boxShadow: '0 0 0px hsla(var(--primary), 0)',
            duration: 200,
            easing: 'easeOutQuad',
          })
        }
      }

      cardRef.current.addEventListener('mouseenter', handleMouseEnter)
      cardRef.current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        if (cardRef.current) {
          cardRef.current.removeEventListener('mouseenter', handleMouseEnter)
          cardRef.current.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    }
  }, [])

  return (
    <div className="max-w-lg mx-auto">
      <Card 
        ref={cardRef}
        className="glass-card-strong border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 relative overflow-hidden opacity-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Sparkle decorations */}
        <div className="absolute top-4 right-4">
          <Sparkles className="sparkle-icon w-6 h-6 text-primary opacity-50" />
        </div>
        <div className="absolute top-8 left-4">
          <Star className="sparkle-icon w-4 h-4 text-accent opacity-50" />
        </div>

        <CardHeader className="text-center pb-2">
          <Badge className="w-fit mx-auto mb-4 bg-gradient-primary text-white px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            Most Popular
          </Badge>
          
          <h3 className="text-2xl font-bold mb-2">Complete Program</h3>
          <p className="text-muted-foreground">
            Everything you need to build and launch your product
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Price */}
          <div ref={priceRef} className="text-center mb-8 p-6 rounded-2xl">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl text-muted-foreground mr-1">$</span>
              <span className="price-amount text-6xl font-bold text-primary">0</span>
            </div>
            <p className="text-muted-foreground">One-time payment • No subscription</p>
            <div className="flex items-center justify-center mt-2 text-sm text-accent">
              <Zap className="w-4 h-4 mr-1" />
              Limited time offer
            </div>
          </div>

          {/* Features */}
          <div ref={featuresRef} className="space-y-4 mb-8">
            {courseData.pricing.features.map((feature, index) => (
              <div key={index} className="feature-item flex items-center space-x-3 opacity-0">
                <div className="check-icon w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            ref={buttonRef}
            size="lg"
            className="w-full button-3d bg-gradient-primary hover:bg-gradient-primary/90 text-white font-bold py-4 text-lg relative overflow-hidden group opacity-0"
            onClick={() => navigate("/payment")}
          >
            <span className="relative z-10 flex items-center justify-center">
              Enroll Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          {/* Guarantee */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              30-day money-back guarantee
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnimatedTestimonials() {
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (testimonialsRef.current) {
      const testimonials = testimonialsRef.current.querySelectorAll('.testimonial-card')
      
      anime({
        targets: testimonials,
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [40, 0],
        duration: 800,
        delay: anime.stagger(200, { start: 2500 }),
        easing: 'easeOutElastic(1, .8)',
      })

      // Continuous floating
      anime({
        targets: testimonials,
        translateY: [-3, 3],
        duration: 3000,
        delay: anime.stagger(500),
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      })
    }
  }, [])

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Launched FoodieApp",
      content: "Built my food delivery app in 4 weeks and got my first 100 customers!",
      revenue: "$12K MRR"
    },
    {
      name: "Mike Rodriguez",
      role: "Created TaskFlow",
      content: "No-code approach helped me validate and launch quickly. Game changer!",
      revenue: "$8K MRR"
    },
    {
      name: "Emma Williams",
      role: "Founded PetCare+",
      content: "From idea to profitable business in just 5 weeks. Incredible program!",
      revenue: "$15K MRR"
    }
  ]

  return (
    <div ref={testimonialsRef} className="grid md:grid-cols-3 gap-6 mt-16">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="testimonial-card glass-card p-6 rounded-2xl hover-glow opacity-0">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold mr-3">
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{testimonial.name}</h4>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">"{testimonial.content}"</p>
          <div className="text-primary font-bold text-sm">{testimonial.revenue}</div>
        </div>
      ))}
    </div>
  )
}

function AnimatedHeading({ delay = 0 }: { delay?: number }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (headingRef.current) {
      const text = headingRef.current.textContent || ''
      headingRef.current.innerHTML = text
        .split(' ')
        .map(word => `<span style="display: inline-block; opacity: 0; transform: translateY(50px);">${word}</span>`)
        .join(' ')

      anime({
        targets: headingRef.current.querySelectorAll('span'),
        opacity: [0, 1],
        translateY: [50, 0],
        rotateX: [90, 0],
        duration: 800,
        delay: (_el: any, i: number) => delay + i * 100,
        easing: 'easeOutExpo',
      })
    }
  }, [delay])

  return (
    <h2 ref={headingRef} className="text-4xl md:text-5xl font-bold text-center mb-4">
      Simple <span className="text-gradient">Pricing</span>
    </h2>
  )
}

export function PricingSectionAnime() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="py-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedHeading delay={200} />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
            One payment, lifetime access. Start building your profitable product today.
          </p>
        </div>

        {/* Pricing Card */}
        <AnimatedPricingCard />

        {/* Testimonials */}
        <AnimatedTestimonials />
      </div>
    </section>
  )
}
