import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Award, 
  Download,
  ExternalLink,
  FileText,
  Video,
  Link as LinkIcon,
  Code,
  Users,
  MessageCircle,
  Calendar,
  HelpCircle,
  Image,
  File
} from "lucide-react"

interface CourseContent {
  id: string
  title: string
  description: string | null
  content_type: string
  content_url: string | null
  file_name: string | null
  file_size: number | null
  week_number: number
  created_at: string
}

const getContentIcon = (contentType: string) => {
  switch (contentType.toLowerCase()) {
    case 'video':
      return Video
    case 'pdf':
      return FileText
    case 'link':
      return LinkIcon
    case 'image':
      return Image
    case 'code':
      return Code
    default:
      return File
  }
}

const certificates = [
  {
    name: "Web Development Fundamentals",
    issueDate: "2024-01-15",
    status: "earned",
    credentialId: "WDF-2024-001",
    description: "Certificate for completing HTML, CSS, and JavaScript fundamentals"
  },
  {
    name: "React Development",
    issueDate: null,
    status: "in_progress",
    credentialId: null,
    description: "Certificate for mastering React development (75% complete)"
  },
  {
    name: "Full-Stack Developer",
    issueDate: null,
    status: "locked",
    credentialId: null,
    description: "Certificate for completing the entire course"
  }
]

const communityFeatures = [
  { name: "Study Groups", icon: Users, description: "Join cohort study sessions" },
  { name: "Q&A Forum", icon: MessageCircle, description: "Ask questions and get help" },
  { name: "Live Sessions", icon: Calendar, description: "Attend weekly live classes" },
  { name: "Mentorship", icon: HelpCircle, description: "Get guidance from experts" }
]

export function LearnerDashboard() {
  const enrollmentStatus = useEnrollmentStatus()
  const [courseContent, setCourseContent] = useState<CourseContent[]>([])
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const { data, error } = await supabase
          .from('course_content')
          .select('*')
          .eq('is_visible', true)
          .order('week_number', { ascending: true })
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching course content:', error)
          return
        }

        setCourseContent(data || [])
      } catch (error) {
        console.error('Error fetching course content:', error)
      } finally {
        setContentLoading(false)
      }
    }

    if (enrollmentStatus.isEnrolled) {
      fetchCourseContent()
    }
  }, [enrollmentStatus.isEnrolled])

  useEffect(() => {
    if (!enrollmentStatus.isEnrolled) return

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
          // Refetch content when changes occur
          const fetchCourseContent = async () => {
            const { data, error } = await supabase
              .from('course_content')
              .select('*')
              .eq('is_visible', true)
              .order('week_number', { ascending: true })
              .order('created_at', { ascending: true })

            if (!error && data) {
              setCourseContent(data)
            }
          }
          fetchCourseContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enrollmentStatus.isEnrolled])

  // Group content by week
  const contentByWeek = courseContent.reduce((acc, content) => {
    const week = `Week ${content.week_number}`
    if (!acc[week]) {
      acc[week] = []
    }
    acc[week].push(content)
    return acc
  }, {} as Record<string, CourseContent[]>)

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
                You need to enroll in a course to access learner resources.
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
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">Learner Hub</h1>
            <p className="text-muted-foreground text-lg">
              Access your resources, certificates, and community features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Content Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Course Content
              </h2>
              
              {contentLoading ? (
                <Card className="pt-4">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </CardContent>
                </Card>
              ) : Object.keys(contentByWeek).length === 0 ? (
                <Card className="pt-4">
                  <CardContent className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No course content available yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Content will appear here as your instructor adds it.</p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(contentByWeek).map(([week, contents], weekIndex) => (
                  <motion.div
                    key={week}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: weekIndex * 0.1 }}
                  >
                    <Card className="pt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">{week}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {contents.map((content) => {
                            const ContentIcon = getContentIcon(content.content_type)
                            return (
                              <div key={content.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3">
                                  <ContentIcon className="h-5 w-5 text-primary" />
                                  <div>
                                    <div className="font-medium">{content.title}</div>
                                    {content.description && (
                                      <div className="text-sm text-muted-foreground">{content.description}</div>
                                    )}
                                    {content.file_size && (
                                      <div className="text-xs text-muted-foreground">
                                        Size: {(content.file_size / 1024 / 1024).toFixed(2)} MB
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {content.content_type.toUpperCase()}
                                  </Badge>
                                  {content.content_url && (
                                    <Button size="sm" variant="ghost" asChild>
                                      <a 
                                        href={content.content_url} 
                                        target={content.content_type === 'link' ? '_blank' : '_self'}
                                        rel={content.content_type === 'link' ? 'noopener noreferrer' : undefined}
                                      >
                                        {content.content_type === 'link' ? (
                                          <ExternalLink className="h-4 w-4" />
                                        ) : (
                                          <Download className="h-4 w-4" />
                                        )}
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Certificates & Community */}
            <div className="space-y-6">
              {/* Certificates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                  <Award className="h-6 w-6" />
                  Certificates
                </h2>
                
                <Card className="pt-4">
                  <CardContent>
                    <div className="space-y-4">
                      {certificates.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              cert.status === 'earned' ? 'bg-green-100 dark:bg-green-900' :
                              cert.status === 'in_progress' ? 'bg-yellow-100 dark:bg-yellow-900' :
                              'bg-muted'
                            }`}>
                              <Award className={`h-5 w-5 ${
                                cert.status === 'earned' ? 'text-green-600' :
                                cert.status === 'in_progress' ? 'text-yellow-600' :
                                'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium">{cert.name}</div>
                              <div className="text-sm text-muted-foreground">{cert.description}</div>
                              {cert.credentialId && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  ID: {cert.credentialId}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={
                              cert.status === 'earned' ? 'default' :
                              cert.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {cert.status === 'earned' ? 'Earned' :
                               cert.status === 'in_progress' ? 'In Progress' : 'Locked'}
                            </Badge>
                            {cert.status === 'earned' && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Community Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                  <Users className="h-6 w-6" />
                  Community
                </h2>
                
                <Card className="pt-4">
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {communityFeatures.map((feature, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
                        >
                          <feature.icon className="h-6 w-6 text-primary" />
                          <div className="text-center">
                            <div className="font-medium">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="pt-4">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule 1-on-1 Mentoring
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Join Study Group Chat
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access Course Portal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}