import { useEffect, useRef } from "react"
import { animate, stagger } from "animejs"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { Badge } from "@/components/ui/badge"
import { SectionBadge } from "@/components/ui/section-badge"
import { courseData } from "@/lib/course-data"
import { Clock } from "lucide-react"


export function SyllabusSection() {
  const cardsRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)

  // Animate cards in a staggered pattern
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && cardsRef.current) {
            animate(cardsRef.current.querySelectorAll('.week-card'), {
              opacity: [0, 1],
              translateY: [50, 0],
              rotateY: [15, 0],
              duration: 800,
              delay: stagger(150, { start: 400 }),
              ease: 'outElastic(1, .8)',
            })
          }
        })
      },
      { threshold: 0.2 }
    )

    if (cardsRef.current) {
      observer.observe(cardsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Animate tools with morphing effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && toolsRef.current) {
            animate(toolsRef.current.querySelectorAll('.tool-badge'), {
              opacity: [0, 1],
              scale: [0.8, 1.05, 1],
              duration: 600,
              delay: stagger(80, { start: 600 }),
              ease: 'outElastic(1, .8)',
            })
          }
        })
      },
      { threshold: 0.3 }
    )

    if (toolsRef.current) {
      observer.observe(toolsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="syllabus" className="py-24 px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionBadge>
            Course Curriculum
          </SectionBadge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            5-Week Journey to Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our structured curriculum takes you from idea to launch in just 5 weeks. 
            Each week builds on the previous, ensuring you have everything you need to succeed.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseData.syllabus.map((week, index) => (
            <div key={index} className="week-card opacity-0">
              <AnimatedCard 
                hoverScale={1.02}
                animationType="rotate"
                className="glass-card h-full group cursor-pointer"
              >
                <AnimatedCardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 group-hover:bg-primary/20 transition-colors">
                      Week {index + 1}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      5 hours
                    </div>
                  </div>
                  <AnimatedCardTitle className="text-xl text-gradient group-hover:text-primary transition-colors">
                    {typeof week === 'string' ? week : week.title}
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                    {typeof week === 'string' ? week : week.description}
                  </p>
                </AnimatedCardContent>
              </AnimatedCard>
            </div>
          ))}
        </div>

        {/* Tools Section */}
        <div className="mt-20 text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gradient">
              Master These No-Code Tools
            </h3>
          </div>
          
          <div ref={toolsRef} className="flex flex-wrap justify-center gap-4">
            {courseData.tools.map((tool, index) => (
              <div key={index} className="tool-badge opacity-0">
                <Badge 
                  variant="outline" 
                  className="px-6 py-3 text-lg bg-white/5 border-white/20 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {tool}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
