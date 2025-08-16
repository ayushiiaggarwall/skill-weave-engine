import { useEffect, useRef } from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { courseData } from "@/lib/course-data"
import { Clock, Users, BookOpen, Award, Zap, Target, Lightbulb, Rocket } from "lucide-react"
import { animate as anime } from 'animejs'

const moduleIcons = [
  Target, Lightbulb, Zap, BookOpen, Rocket, Award
]

function AnimatedCard({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      // Initial entrance animation
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        rotateY: [20, 0],
        translateY: [60, 0],
        duration: 1000,
        delay,
        easing: 'easeOutElastic(1, .6)',
      })

      // Floating animation
      anime({
        targets: cardRef.current,
        translateY: [-3, 3],
        duration: 4000,
        delay: delay + 500,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      })

      // Advanced hover animations
      const handleMouseEnter = () => {
        anime({
          targets: cardRef.current,
          scale: 1.05,
          rotateX: 5,
          rotateY: 5,
          boxShadow: [
            { value: '0 25px 50px rgba(0, 0, 0, 0.15)' },
            { value: '0 35px 70px rgba(0, 0, 0, 0.25)' }
          ],
          duration: 400,
          easing: 'easeOutQuart',
        })

        // Animate icon inside card
        const icon = cardRef.current?.querySelector('.module-icon')
        if (icon) {
          anime({
            targets: icon,
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            duration: 600,
            easing: 'easeOutElastic(1, .8)',
          })
        }

        // Animate badge
        const badge = cardRef.current?.querySelector('.week-badge')
        if (badge) {
          anime({
            targets: badge,
            scale: [1, 1.1, 1],
            backgroundColor: [
              { value: 'hsl(var(--accent))' },
              { value: 'hsl(var(--primary))' },
              { value: 'hsl(var(--accent))' }
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
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          duration: 300,
          easing: 'easeOutQuad',
        })
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
    <div ref={cardRef} className={`transform-gpu opacity-0 ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}

function AnimatedHeading({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (headingRef.current) {
      // Split text into words for word-by-word animation
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
      {children}
    </h2>
  )
}

function AnimatedSubheading({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const subheadingRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (subheadingRef.current) {
      anime({
        targets: subheadingRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay,
        easing: 'easeOutExpo',
      })
    }
  }, [delay])

  return (
    <p ref={subheadingRef} className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16 opacity-0">
      {children}
    </p>
  )
}

function StaggeredStatsGrid() {
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll('.stat-item')
      
      // Entrance animation with stagger
      anime({
        targets: statItems,
        opacity: [0, 1],
        scale: [0.8, 1],
        translateY: [40, 0],
        duration: 800,
        delay: anime.stagger(150, { start: 1000 }),
        easing: 'easeOutElastic(1, .8)',
      })

      // Number counting animation
      anime({
        targets: statsRef.current.querySelectorAll('.stat-number'),
        innerHTML: (el: any) => [0, el.getAttribute('data-value')],
        duration: 2000,
        delay: 1500,
        easing: 'easeOutExpo',
        round: 1,
      })

      // Continuous floating for stats
      anime({
        targets: statItems,
        translateY: [-2, 2],
        duration: 3000,
        delay: anime.stagger(200),
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      })
    }
  }, [])

  const stats = [
    { icon: Users, label: "Students", value: courseData.stats.students, suffix: "+" },
    { icon: Clock, label: "Duration", value: courseData.duration.weeks, suffix: " weeks" },
    { icon: BookOpen, label: "Modules", value: courseData.syllabus.length, suffix: " modules" },
    { icon: Award, label: "Success Rate", value: courseData.stats.successRate, suffix: "%" }
  ]

  return (
    <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item glass-card p-6 rounded-2xl text-center hover-glow opacity-0">
          <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
          <div className="stat-number text-3xl font-bold text-foreground mb-1" data-value={stat.value}>
            0
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export function SyllabusSectionAnime() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animations when section comes into view
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <AnimatedHeading delay={200}>
            Complete <span className="text-gradient">Curriculum</span>
          </AnimatedHeading>
          
          <AnimatedSubheading delay={800}>
            A comprehensive 5-week program designed to take you from idea to profitable product
          </AnimatedSubheading>
        </div>

        {/* Stats Grid */}
        <StaggeredStatsGrid />

        {/* Course Modules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseData.syllabus.map((week, index) => {
            const IconComponent = moduleIcons[index % moduleIcons.length]
            return (
              <AnimatedCard 
                key={index} 
                delay={1200 + index * 200}
                className="group"
              >
                <Card className="glass-card border-none h-full hover-lift cursor-pointer">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className="week-badge bg-accent text-accent-foreground">
                        Week {week.week}
                      </Badge>
                      <div className="module-icon w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {week.title}
                    </h3>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {week.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-primary">
                        Key Topics
                      </h4>
                      <ul className="space-y-2">
                        {week.topics.slice(0, 3).map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-center text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                            {topic}
                          </li>
                        ))}
                        {week.topics.length > 3 && (
                          <li className="text-sm text-primary font-medium">
                            +{week.topics.length - 3} more topics
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
