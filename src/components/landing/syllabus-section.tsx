import { useEffect, useRef, useState } from "react"
import { animate, stagger } from "animejs"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { Badge } from "@/components/ui/badge"
import { SectionBadge } from "@/components/ui/section-badge"
import { courseData } from "@/lib/course-data"
import { Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface CourseWeek {
  id: string
  week_number: number
  title: string
  objective: string
  content: string
  mini_project: string | null
  visible: boolean
}


export function SyllabusSection() {
  const cardsRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch course weeks data with real-time updates
  useEffect(() => {
    const fetchCourseWeeks = async () => {
      try {
        setLoading(true)
        
        // First get the active course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('is_active', true)
          .limit(1)
          .single()

        if (courseError) {
          console.error('Error fetching course:', courseError)
          setLoading(false)
          return
        }

        // Then get the course weeks
        const { data: weeksData, error: weeksError } = await supabase
          .from('course_weeks')
          .select('*')
          .eq('course_id', courseData.id)
          .eq('visible', true)
          .order('week_number', { ascending: true })

        if (weeksError) {
          console.error('Error fetching course weeks:', weeksError)
          setLoading(false)
          return
        }

        setCourseWeeks(weeksData || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseWeeks()

    // Set up real-time subscription for course_weeks table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'course_weeks'
        },
        (payload) => {
          console.log('Course weeks changed:', payload)
          // Refetch data when changes occur
          fetchCourseWeeks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="week-card opacity-0">
                <AnimatedCard 
                  hoverScale={1.02}
                  animationType="rotate"
                  className="glass-card h-full group cursor-pointer"
                >
                  <AnimatedCardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-6 bg-muted-foreground/20 rounded animate-pulse" />
                      <div className="w-12 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                    </div>
                    <div className="w-3/4 h-6 bg-muted-foreground/20 rounded animate-pulse" />
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-muted-foreground/20 rounded animate-pulse" />
                      <div className="w-2/3 h-3 bg-muted-foreground/20 rounded animate-pulse" />
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </div>
            ))
          ) : courseWeeks.length > 0 ? (
            // Real-time course weeks data
            courseWeeks.map((week) => (
              <div key={week.id} className="week-card opacity-0">
                <AnimatedCard 
                  hoverScale={1.02}
                  animationType="rotate"
                  className="glass-card h-full group cursor-pointer"
                >
                  <AnimatedCardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 group-hover:bg-primary/20 transition-colors">
                        Week {week.week_number}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        5 hours
                      </div>
                    </div>
                    <AnimatedCardTitle className="text-xl text-gradient group-hover:text-primary transition-colors">
                      {week.title}
                    </AnimatedCardTitle>
                  </AnimatedCardHeader>
                  <AnimatedCardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {week.objective}
                    </p>
                    {week.mini_project && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-primary mb-1">Mini Project:</p>
                        <p className="text-xs text-muted-foreground">
                          {week.mini_project}
                        </p>
                      </div>
                    )}
                  </AnimatedCardContent>
                </AnimatedCard>
              </div>
            ))
          ) : (
            // Fallback to static data if no real-time data available
            courseData.syllabus.map((week, index) => (
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
            ))
          )}
        </div>

        {/* Tools Section */}
        <div className="mt-20 text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gradient">
              Master These Tools
            </h3>
          </div>
          
          <div ref={toolsRef} className="flex flex-wrap justify-center gap-4">
            {courseData.tools.map((tool, index) => (
              <div key={index} className="tool-badge opacity-0">
                <Badge 
                  variant="outline" 
                  className="px-6 py-3 text-lg bg-transparent border-black/20 dark:bg-white/5 dark:border-white/20 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300 cursor-pointer"
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
