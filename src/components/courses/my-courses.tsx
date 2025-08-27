import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  Clock,
  Play,
  CheckCircle,
  Star,
  Calendar,
  Users,
  ExternalLink,
  FileText,
  Video,
  Link,
  Clipboard
} from "lucide-react"

interface CourseContent {
  id: string
  title: string
  description: string | null
  content_type: 'video' | 'document' | 'link' | 'assignment'
  content_url: string | null
  file_name?: string | null
  week_number: number
  is_visible: boolean
  created_at: string
}

interface CourseWeek {
  id: string
  title: string
  week_number: number
  objective: string
  content: string
  mini_project: string | null
  deliverables: string[]
  visible: boolean
}

interface Course {
  id: string
  title: string
  objective: string
  plans: string[]
  total_weeks: number | null
}


export function MyCourses() {
  const { toast } = useToast()
  const enrollmentStatus = useEnrollmentStatus()
  const [courseContent, setCourseContent] = useState<CourseContent[]>([])
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [courseStartDate, setCourseStartDate] = useState<string | null>(null)

  useEffect(() => {
    if (enrollmentStatus.isEnrolled) {
      fetchCourseContent()
      fetchCourseDetails()
      fetchCourseWeeks()
      setupRealtimeSubscription()
    }
  }, [enrollmentStatus.isEnrolled])

  const fetchCourseContent = async () => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('is_visible', true)
        .order('week_number', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      setCourseContent((data || []) as CourseContent[])
    } catch (error) {
      console.error('Error fetching course content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch course content",
        variant: "destructive",
      })
    } finally {
      setContentLoading(false)
    }
  }

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, objective, plans, total_weeks, start_date')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setCourse(data)
        setCourseStartDate(data.start_date || null)
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
    }
  }

  const fetchCourseWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('visible', true)
        .order('week_number', { ascending: true })

      if (error) throw error
      setCourseWeeks((data || []) as CourseWeek[])
    } catch (error) {
      console.error('Error fetching course weeks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch course weeks",
        variant: "destructive",
      })
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('course-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_content'
        },
        () => {
          fetchCourseContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'link':
        return <Link className="h-4 w-4" />
      case 'assignment':
        return <Clipboard className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleContentClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const overallProgress = courseWeeks.length > 0 ? Math.round((courseWeeks.filter(w => w.week_number <= 1).length / courseWeeks.length) * 100) : 0

  if (enrollmentStatus.loading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!enrollmentStatus.isEnrolled) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Active Enrollment</h2>
              <p className="text-muted-foreground mb-4">
                You need to enroll in a course to access this section.
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Header />
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="h-1 bg-primary/20">
          <div 
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      <div className="min-h-screen bg-background pt-20">
        {/* Background Effects */}
        <div 
          className="fixed inset-0 opacity-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.2) 0%, transparent 50%)
            `
          }}
        />

        <div className="container mx-auto px-6 py-8 relative z-10">
          {/* Header Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">My Courses</h1>
                <p className="text-muted-foreground text-lg">
                  Track your learning progress and continue your journey
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                {enrollmentStatus.courseName || "Active Learner"}
              </Badge>
            </div>

            {/* Overall Progress */}
            <Card className="mb-8 pt-4">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Progress</h3>
                    <p className="text-muted-foreground">{course?.title || "Loading course..."}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{overallProgress}%</div>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>
                    {courseStartDate ? (
                      (() => {
                        const startDate = new Date(courseStartDate)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        startDate.setHours(0, 0, 0, 0)
                        
                        if (startDate <= today) {
                          return `Started ${startDate.toLocaleDateString()}`
                        } else {
                          return `Starts ${startDate.toLocaleDateString()}`
                        }
                      })()
                    ) : (
                      `Started ${new Date().toLocaleDateString()}`
                    )}
                  </span>
                  <span>{courseWeeks.filter(w => w.week_number <= 1).length}/{courseWeeks.length} weeks completed</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Modules */}
          <div className="space-y-6">
            {courseWeeks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading course content...</p>
              </div>
            ) : (
              courseWeeks.map((week, index) => {
                // Determine week status - for now, just mark week 1 as current and others as locked
                const status: 'completed' | 'current' | 'locked' = 
                  week.week_number === 1 ? 'current' : 
                  week.week_number < 1 ? 'completed' : 'locked'
                const progress = week.week_number === 1 ? 25 : 0
                
                // Parse content into topics
                const topics = week.content.split('\n')
                  .filter(line => line.trim().startsWith('-') || line.trim().startsWith('->'))
                  .map(line => line.replace(/^[->\s]+/, '').trim())
                  .filter(topic => topic.length > 0)
                
                return (
                  <motion.div
                    key={week.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`transition-all duration-300 hover:shadow-lg pt-4 ${
                      status === 'current' ? 'ring-2 ring-primary' : 
                      status === 'locked' ? 'opacity-60' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                              status === 'current' ? 'bg-primary/10' : 'bg-muted'
                            }`}>
                              {status === 'completed' ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : status === 'current' ? (
                                <Play className="h-6 w-6 text-primary" />
                              ) : (
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Week {week.week_number}</Badge>
                                <Badge variant={
                                  status === 'completed' ? 'default' :
                                  status === 'current' ? 'secondary' : 'outline'
                                }>
                                  {status === 'completed' ? 'Completed' :
                                   status === 'current' ? 'In Progress' : 'Locked'}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl mb-2">{week.title}</CardTitle>
                              <p className="text-muted-foreground">{week.objective}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Clock className="h-4 w-4" />
                              {week.week_number === 1 ? '10 hours' : `${8 + week.week_number}+ hours`}
                            </div>
                            {status !== 'locked' && (
                              <Button size="sm" variant={status === 'current' ? 'default' : 'outline'}>
                                {status === 'completed' ? 'Review' : 'Continue'}
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Progress Bar */}
                        {status !== 'locked' && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {/* Topics */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            What You'll Learn
                          </h4>
                          <div className="space-y-2">
                            {topics.slice(0, 4).map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span className={`text-sm ${status === 'locked' ? 'opacity-50' : ''}`}>
                                  {topic}
                                </span>
                              </div>
                            ))}
                            {topics.length > 4 && (
                              <p className="text-xs text-muted-foreground">
                                +{topics.length - 4} more topics
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mini Project */}
                        {week.mini_project && (
                          <div className="mt-4 p-3 bg-accent/10 rounded-lg border">
                            <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                              <Clipboard className="h-4 w-4" />
                              Week Project
                            </h5>
                            <p className="text-sm text-muted-foreground">{week.mini_project}</p>
                          </div>
                        )}

                        {/* Additional Info for Current Module */}
                        {status === 'current' && (
                          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium">Next Live Session:</span>
                              <span>Sat/Sun at 7:30 PM IST</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm mt-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium">Study Group:</span>
                              <span>Join your cohort discussion</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Dynamic Course Content */}
          {enrollmentStatus.isEnrolled && (
            <motion.div 
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Course Materials
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Access your course materials and assignments - updated in real-time
                  </p>
                </CardHeader>
                <CardContent>
                  {contentLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">Loading course materials...</div>
                    </div>
                  ) : courseContent.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No course materials available yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your instructor will upload materials here as the course progresses.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {courseWeeks.map(week => {
                        const weekContent = courseContent.filter(item => item.week_number === week.week_number)
                        return (
                          <div key={week.id} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3 text-lg">Week {week.week_number} - {week.title}</h4>
                            {weekContent.length === 0 ? (
                              <p className="text-muted-foreground text-sm">No materials available for this week yet.</p>
                            ) : (
                              <div className="grid gap-3">
                                {weekContent.map(item => (
                                  <div 
                                    key={item.id} 
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                                    onClick={() => handleContentClick(item.content_url)}
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="text-primary">
                                        {getContentIcon(item.content_type)}
                                      </div>
                                      <div>
                                        <h5 className="font-medium">{item.title}</h5>
                                        {item.description && (
                                          <p className="text-sm text-muted-foreground">{item.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                            {item.content_type}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}