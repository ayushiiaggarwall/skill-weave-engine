import { useEffect, useRef, useState } from "react"
import { animate, stagger } from "animejs"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { SectionBadge } from "@/components/ui/section-badge"
import { Sparkles, Clock, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"
import { useAdminRole } from "@/hooks/use-admin-role"
import { useCoursePricing } from "@/hooks/use-course-pricing"

interface CoursePricing {
  inr_regular: number
  inr_early_bird: number
  inr_mrp: number
  usd_regular: number
  usd_early_bird: number
  usd_mrp: number
  is_early_bird_active: boolean | null
  early_bird_end_date: string | null
}

interface CourseWithPricing {
  id: string
  title: string
  is_active: boolean
  course_pricing: CoursePricing[]
}

export function PricingSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isAdmin } = useAdminRole()
  const featuresRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement>(null)
  
  const [courses, setCourses] = useState<CourseWithPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [isEarlyBirdEnabled, setIsEarlyBirdEnabled] = useState(false)
  const [userRegion, setUserRegion] = useState<'INR' | 'USD'>('INR')
  
  // Get timer data from the first active course
  const { timeLeft, formatTime } = useCoursePricing()

  // Fetch courses and pricing data
  useEffect(() => {
    fetchCoursesData()
    detectUserRegion()
  }, [])

  const detectUserRegion = () => {
    // Detect user region based on timezone or other factors
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserRegion(timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta') ? 'INR' : 'USD')
  }

  const fetchCoursesData = async () => {
    try {
      // First fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, is_active')
        .eq('is_active', true)

      if (coursesError) throw coursesError

      // Then fetch pricing for each course
      const coursesWithPricing: CourseWithPricing[] = []
      
      for (const course of coursesData || []) {
        const { data: pricingData, error: pricingError } = await supabase
          .from('course_pricing')
          .select('*')
          .eq('course_id', course.id)

        if (!pricingError && pricingData && pricingData.length > 0) {
          coursesWithPricing.push({
            ...course,
            course_pricing: pricingData
          })
        }
      }

      setCourses(coursesWithPricing)
      setIsEarlyBirdEnabled(coursesWithPricing.some(c => 
        Boolean(c.course_pricing[0]?.is_early_bird_active)
      ))
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEarlyBird = async () => {
    if (!isAdmin) return
    
    const newStatus = !isEarlyBirdEnabled
    setIsEarlyBirdEnabled(newStatus)
    
    try {
      // Update all active courses' early bird status
      for (const course of courses) {
        await supabase
          .from('course_pricing')
          .update({ is_early_bird_active: newStatus })
          .eq('course_id', course.id)
      }
      
      await fetchCoursesData()
    } catch (error) {
      console.error('Error updating early bird status:', error)
      setIsEarlyBirdEnabled(!newStatus) // Revert on error
    }
  }

  const getPrice = (course: CourseWithPricing) => {
    const pricing = course.course_pricing[0]
    if (!pricing) return { current: 0, mrp: 0, symbol: '₹', isEarlyBird: false }
    
    const isRegionalINR = userRegion === 'INR'
    
    const regular = isRegionalINR ? pricing.inr_regular : pricing.usd_regular
    const earlyBird = isRegionalINR ? pricing.inr_early_bird : pricing.usd_early_bird
    const mrp = isRegionalINR ? pricing.inr_mrp : pricing.usd_mrp
    const symbol = isRegionalINR ? '₹' : '$'
    
    return {
      current: isEarlyBirdEnabled ? earlyBird : regular,
      mrp,
      symbol,
      isEarlyBird: isEarlyBirdEnabled
    }
  }

  const handleEnrollClick = (courseId: string) => {
    if (!user) {
      navigate("/signup")
    } else {
      navigate(`/pay?course=${courseId}`)
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

  const getCourseFeatures = (courseTitle: string) => {
    if (courseTitle.toLowerCase().includes('essential')) {
      return [
        "5 Weeks of Live Classes (Sat & Sun, 7:30–10 PM IST)",
        "Final Week Q&A + Project Demos",
        "Step-by-Step Curriculum — from basics to launch",
        "Hands-On Projects every week",
        "Lifetime Access to Recordings & Materials",
        "Community Support Group (peer discussions + resources)",
        "7 Days Money Back Guarantee"
      ]
    }
    
    if (courseTitle.toLowerCase().includes('pro') || courseTitle.toLowerCase().includes('mentorship')) {
      return [
        "Everything in Complete Course Access",
        "Direct Mentorship in Community — personal replies to queries, typically within 24 hours",
        "Quick 1:1 Calls (10–15 mins) — scheduled within 24 hours if your issue can't be solved on text",
        "Personal Feedback on Projects",
        "Personal Guidance on Your Own Projects/Ideas",
        "Extra Post-Course Support — one follow-up call within 30 days"
      ]
    }
    
    return [
      "5 Weeks of Live Classes (Sat & Sun, 7:30–10 PM IST)",
      "Final Week Q&A + Project Demos",
      "Step-by-Step Curriculum — from basics to launch",
      "Hands-On Projects every week",
      "Lifetime Access to Recordings & Materials",
      "Community Support Group (peer discussions + resources)",
      "7 Days Money Back Guarantee"
    ]
  }



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

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEarlyBirdEnabled}
                  onChange={toggleEarlyBird}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Enable Early Bird Pricing</span>
              </label>
            </div>
          </div>
        )}

        {/* Early Bird Timer */}
        {isEarlyBirdEnabled && (
          <div className="flex flex-col items-center mb-8 space-y-3">
            <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">Early Bird Pricing Active!</span>
            </div>
            {timeLeft > 0 && (
              <div className="bg-card/80 backdrop-blur-sm border rounded-lg px-6 py-3 shadow-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Time remaining for early bird offer:</p>
                  <div className="text-lg font-mono font-bold text-foreground">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Loading courses...</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {courses.map((course, index) => {
              const pricing = getPrice(course)
              return (
                <AnimatedCard 
                  key={course.id}
                  delay={400 + (index * 200)}
                  animationType="scale"
                  className="glass-card-strong border-primary/30 shadow-xl hover-lift opacity-0 relative flex flex-col h-full"
                >
                  {/* Best Value Badge for Mentorship Track Only */}
                  {course.title.toLowerCase().includes('mentorship') && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                      BEST VALUE • LIMITED SEATS
                    </div>
                  )}
                  
                  <AnimatedCardHeader className="text-center pb-6">
                    <AnimatedCardTitle className="text-2xl font-bold mb-4 leading-relaxed">
                      {course.title}
                    </AnimatedCardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-xl text-muted-foreground line-through">
                          {pricing.symbol}{pricing.mrp.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-5xl font-bold text-gradient">
                        {pricing.symbol}{pricing.current.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">
                        {course.title.toLowerCase().includes('essential') 
                          ? "Bring your Idea to Life • Limited Seats Only"
                          : course.title.toLowerCase().includes('mentorship')
                          ? "Save ₹15,000+ on the bundle • For limited time period"
                          : "Bring your Idea to Life • Limited Seats Only"
                        }
                      </p>
                    </div>
                  </AnimatedCardHeader>
                  
                  <AnimatedCardContent className="space-y-6 flex-grow flex flex-col">
                    {/* Features */}
                    <div className="space-y-3 flex-grow">
                      {getCourseFeatures(course.title).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <span className="text-green-500 mr-3 flex-shrink-0 mt-0.5">✅</span>
                          <span className="text-foreground text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto pt-4">
                      <AnimatedButton 
                        size="lg" 
                        animation="glow"
                        className="w-full py-4 text-lg font-semibold hover-glow"
                        onClick={() => handleEnrollClick(course.id)}
                      >
                        Enroll Now — {pricing.symbol}{pricing.current.toLocaleString()}
                      </AnimatedButton>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              )
            })}
          </div>
        )}

        {/* Plan Comparison Table */}
        <div className="mt-16 mb-12">
          <h3 className="text-3xl font-bold text-center mb-8 text-gradient">Plan Comparison</h3>
          <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm rounded-2xl border shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-6 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-6 font-semibold text-foreground">Course Only</th>
                    <th className="text-center p-6 font-semibold text-foreground">Course + Mentorship</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">5 Weeks Live Classes</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">Lifetime Recordings</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">Weekly Projects</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">Community Group</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">Replies to Queries</td>
                    <td className="p-4 text-center text-muted-foreground">Group only</td>
                    <td className="p-4 text-center text-green-500">Personal replies within 24 hrs</td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">Quick 1:1 Calls</td>
                    <td className="p-4 text-center text-muted-foreground">—</td>
                    <td className="p-4 text-center text-green-500">Scheduled within 24 hrs</td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="p-4 text-muted-foreground">Priority Project Feedback</td>
                    <td className="p-4 text-center text-muted-foreground">—</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-muted-foreground">Post-Course Follow-Up Call</td>
                    <td className="p-4 text-center text-muted-foreground">—</td>
                    <td className="p-4 text-center text-green-500">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Course Info Bar */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-card/80 backdrop-blur-sm rounded-2xl px-8 py-6 border shadow-lg max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">Next cohort starts:</span>
                <span className="font-semibold text-accent">Sep 21, 2025 (Induction)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Course timeline:</span>
                <span className="font-semibold text-accent">27th September to 26th October, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}