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

const courseModules = [
  {
    week: 1,
    title: "No-Code Fundamentals",
    description: "Introduction to no-code tools and platforms",
    duration: "8 hours",
    status: "locked",
    progress: 0,
    topics: ["What is No-Code?", "Popular Platforms", "Basic Concepts", "First Project"]
  },
  {
    week: 2,
    title: "Database Design & Management",
    description: "Learn to design and manage databases without code",
    duration: "10 hours",
    status: "locked",
    progress: 0,
    topics: ["Database Basics", "Airtable", "Relations", "Data Validation"]
  },
  {
    week: 3,
    title: "Building Web Applications",
    description: "Create responsive web apps using no-code platforms",
    duration: "12 hours",
    status: "locked",
    progress: 0,
    topics: ["Webflow Basics", "Components", "Responsive Design", "Interactions"]
  },
  {
    week: 4,
    title: "Automation & Workflows",
    description: "Automate processes and create efficient workflows",
    duration: "10 hours",
    status: "locked",
    progress: 0,
    topics: ["Zapier", "Workflow Design", "API Integrations", "Testing"]
  },
  {
    week: 5,
    title: "Product Launch & Beyond",
    description: "Launch your product and scale it effectively",
    duration: "8 hours",
    status: "locked",
    progress: 0,
    topics: ["Product Launch", "User Feedback", "Analytics", "Scaling"]
  }
]

export function MyCourses() {
  const { toast } = useToast()
  const enrollmentStatus = useEnrollmentStatus()
  const [courseContent, setCourseContent] = useState<CourseContent[]>([])
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    if (enrollmentStatus.isEnrolled) {
      fetchCourseContent()
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

  const overallProgress = Math.round(courseModules.reduce((acc, module) => acc + module.progress, 0) / courseModules.length)

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
                    <p className="text-muted-foreground">5-Week No-Code to Product Course</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{overallProgress}%</div>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Started {new Date().toLocaleDateString()}</span>
                  <span>{courseModules.filter(m => m.status === 'completed').length}/{courseModules.length} modules completed</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Modules */}
          <div className="space-y-6">
            {courseModules.map((module, index) => (
              <motion.div
                key={module.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`transition-all duration-300 hover:shadow-lg pt-4 ${
                  module.status === 'current' ? 'ring-2 ring-primary' : 
                  module.status === 'locked' ? 'opacity-60' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          module.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                          module.status === 'current' ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {module.status === 'completed' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : module.status === 'current' ? (
                            <Play className="h-6 w-6 text-primary" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Week {module.week}</Badge>
                            <Badge variant={
                              module.status === 'completed' ? 'default' :
                              module.status === 'current' ? 'secondary' : 'outline'
                            }>
                              {module.status === 'completed' ? 'Completed' :
                               module.status === 'current' ? 'In Progress' : 'Locked'}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                          <p className="text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          {module.duration}
                        </div>
                        {module.status !== 'locked' && (
                          <Button size="sm" variant={module.status === 'current' ? 'default' : 'outline'}>
                            {module.status === 'completed' ? 'Review' : 'Continue'}
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar */}
                    {module.status !== 'locked' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    )}

                    {/* Topics */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Topics Covered
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map((topic, topicIndex) => (
                          <Badge 
                            key={topicIndex} 
                            variant="outline" 
                            className={module.status === 'locked' ? 'opacity-50' : ''}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info for Current Module */}
                    {module.status === 'current' && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">Next Live Session:</span>
                          <span>Tomorrow at 2:00 PM IST</span>
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
            ))}
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
                      {[1, 2, 3, 4, 5].map(week => {
                        const weekContent = courseContent.filter(item => item.week_number === week)
                        return (
                          <div key={week} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3 text-lg">Week {week}</h4>
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