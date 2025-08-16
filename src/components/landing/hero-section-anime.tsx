import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Play, Trophy, Star, Sparkles, Zap, Target, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { courseData } from "@/lib/course-data"
import { useNavigate } from "react-router-dom"
import { animate, stagger } from 'animejs'

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

function FloatingElement({ children, delay = 0, className = "" }: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      animate(elementRef.current, {
        translateY: [-10, 10, -10],
        rotate: [-2, 2, -2],
        duration: 6000,
        delay: delay * 1000,
        ease: 'inOut(3)',
        loop: true,
      })
    }
  }, [delay])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

function InteractiveOrb({ className = "", size = "w-32 h-32" }: { className?: string; size?: string }) {
  const orbRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (orbRef.current) {
      animate(orbRef.current, {
        translateX: mousePosition.x * 0.02,
        translateY: mousePosition.y * 0.02,
        duration: 1000,
        ease: 'outElastic(1, .8)',
      })
    }
  }, [mousePosition])

  return (
    <div
      ref={orbRef}
      className={`${size} rounded-full opacity-30 blur-3xl ${className}`}
    />
  )
}

function AnimatedCard({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      // Initial entrance animation
      animate(cardRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        rotateY: [15, 0],
        translateY: [50, 0],
        duration: 1200,
        delay: delay * 200,
        ease: 'outElastic(1, .8)',
      })

      // Continuous floating animation
      animate(cardRef.current, {
        translateY: [-5, 5],
        duration: 3000,
        delay: delay * 500,
        ease: 'inOut(3)',
        loop: true,
        alternate: true,
      })

      // Hover effect
      const handleMouseEnter = () => {
        if (cardRef.current) {
          animate(cardRef.current, {
            scale: 1.05,
            rotateY: 5,
            rotateX: 5,
            duration: 300,
            ease: 'out(2)',
          })
        }
      }

      const handleMouseLeave = () => {
        if (cardRef.current) {
          animate(cardRef.current, {
            scale: 1,
            rotateY: 0,
            rotateX: 0,
            duration: 300,
            ease: 'out(2)',
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
  }, [delay])

  return (
    <div ref={cardRef} className={`transform-gpu ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}

function AnimatedText({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      // Split text into spans for character animation
      const text = textRef.current.textContent || ''
      textRef.current.innerHTML = text
        .split('')
        .map((char) => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('')

      animate(textRef.current.querySelectorAll('span'), {
        opacity: [0, 1],
        translateY: [30, 0],
        rotateX: [90, 0],
        duration: 800,
        delay: stagger(50, { start: delay }),
        ease: 'out(4)',
      })
    }
  }, [delay])

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  )
}

export function HeroSectionAnime() {
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Animate stats on mount
  useEffect(() => {
    if (statsRef.current) {
      animate(statsRef.current.querySelectorAll('.stat-number'), {
        innerHTML: (el: any) => [0, el.getAttribute('data-value')],
        duration: 2000,
        delay: 1000,
        ease: 'out(4)',
        round: 1,
      })
    }

    // Animate buttons with stagger
    if (buttonsRef.current) {
      animate(buttonsRef.current.querySelectorAll('.animated-button'), {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 600,
        delay: stagger(200, { start: 1500 }),
        ease: 'outElastic(1, .8)',
      })
    }
  }, [])

  // Feature icons animation
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])
  
  useEffect(() => {
    const validRefs = featureRefs.current.filter(ref => ref !== null)
    if (validRefs.length > 0) {
      animate(validRefs, {
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(200, { start: 2000 }),
        ease: 'out(4)',
      })
    }
  }, [])

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 overflow-hidden pt-32"
      style={{
        background: `
          radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            hsl(var(--primary) / 0.15) 0%, 
            hsl(var(--accent) / 0.1) 25%, 
            transparent 50%
          ),
          linear-gradient(135deg, 
            hsl(var(--background)) 0%, 
            hsl(var(--muted) / 0.5) 100%
          )
        `
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Interactive Orbs */}
        <InteractiveOrb className="absolute top-20 left-20 bg-gradient-to-r from-primary to-accent" />
        <InteractiveOrb 
          className="absolute bottom-32 right-32 bg-gradient-to-r from-accent to-purple-500" 
          size="w-48 h-48" 
        />
        <InteractiveOrb 
          className="absolute top-1/2 left-1/4 bg-gradient-to-r from-yellow-400 to-primary" 
          size="w-24 h-24" 
        />

        {/* Floating Shapes */}
        <FloatingElement delay={0} className="absolute top-32 right-1/4">
          <div className="w-4 h-4 bg-primary/20 rounded-full blur-sm animate-pulse-glow" />
        </FloatingElement>
        <FloatingElement delay={2} className="absolute bottom-1/4 left-1/3">
          <div className="w-6 h-6 bg-accent/20 rounded-full blur-sm animate-pulse-glow" />
        </FloatingElement>
        <FloatingElement delay={4} className="absolute top-1/3 right-1/3">
          <div className="w-3 h-3 bg-yellow-400/20 rounded-full blur-sm animate-pulse-glow" />
        </FloatingElement>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-10">
            {/* Main Heading with Character Animation */}
            <div className="space-y-6">
              <AnimatedText 
                delay={500} 
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                From No-Code to Product
              </AnimatedText>

              <AnimatedText 
                delay={1200} 
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                Master the art of building profitable products without writing code. Join 500+ successful entrepreneurs who launched their ideas in just 5 weeks.
              </AnimatedText>
            </div>

            {/* Value Propositions with Icons */}
            <div className="space-y-4">
              {[
                { text: "Build your MVP in 5 weeks", icon: Target },
                { text: "No coding experience required", icon: Zap },
                { text: "Get paying customers fast", icon: Rocket }
              ].map((item, index) => (
                <div 
                  key={index}
                  ref={(el: HTMLDivElement | null) => { featureRefs.current[index] = el }}
                  className="flex items-center gap-4 group cursor-pointer opacity-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground font-medium text-lg group-hover:text-primary transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6">
              <Button 
                size="lg" 
                className="animated-button px-10 py-4 text-lg button-3d hover-glow relative overflow-hidden group opacity-0"
                onClick={() => navigate("/signup")}
              >
                <span className="relative z-10 flex items-center">
                  Apply Now
                  <ArrowRight className="ml-3 h-5 w-5" />
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="animated-button px-10 py-4 text-lg glass-card border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300 opacity-0"
              >
                <Play className="mr-3 h-5 w-5" />
                See Syllabus
              </Button>
            </div>
          </div>

          {/* Right: Interactive Hero Card */}
          <div className="relative perspective-1000">
            <div className="relative">
              {/* Floating decorative elements */}
              <FloatingElement delay={1} className="absolute -top-8 -right-8 z-10">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white animate-pulse-glow" />
                </div>
              </FloatingElement>

              <FloatingElement delay={3} className="absolute -bottom-6 -left-6 z-10">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-xl">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
              </FloatingElement>

              {/* Main Card with Anime.js */}
              <AnimatedCard delay={2} className="glass-card-strong p-8 rounded-3xl hover-lift">
                <div className="space-y-8">
                  <div className="text-center">
                    <AnimatedCard delay={3} className="w-20 h-20 mx-auto mb-6 bg-primary rounded-3xl flex items-center justify-center shadow-2xl">
                      <Trophy className="w-10 h-10 text-white" />
                    </AnimatedCard>
                    
                    <AnimatedText delay={3500} className="text-2xl font-bold mb-3 text-gradient">
                      Success Guaranteed
                    </AnimatedText>
                    
                    <AnimatedText delay={4000} className="text-muted-foreground text-lg">
                      Join {courseData.stats.students}+ entrepreneurs who built profitable products
                    </AnimatedText>
                  </div>
                  
                  <div ref={statsRef} className="grid grid-cols-2 gap-6">
                    <AnimatedCard delay={4} className="glass-card p-6 rounded-2xl text-center hover-glow">
                      <div className="stat-number text-3xl font-bold text-primary mb-2" data-value={courseData.stats.successRate}>
                        0
                      </div>
                      <div className="text-sm text-muted-foreground">% Success Rate</div>
                    </AnimatedCard>
                    
                    <AnimatedCard delay={5} className="glass-card p-6 rounded-2xl text-center hover-glow">
                      <div className="stat-number text-3xl font-bold text-accent mb-2" data-value={(courseData.stats.revenue / 1000000).toFixed(1)}>
                        0
                      </div>
                      <div className="text-sm text-muted-foreground">M+ Revenue Generated</div>
                    </AnimatedCard>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
