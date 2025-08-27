import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Award, 
  Bell, 
  ExternalLink,
  Play,
  Users,
  Star,
  Bookmark
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export function ModernDashboard() {
  const { user, profile } = useAuth()
  const enrollmentStatus = useEnrollmentStatus()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    fetchAnnouncements()
    fetchCourses()
    
    // Set up real-time subscriptions
    const coursesChannel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses'
        },
        () => {
          fetchCourses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(coursesChannel)
    }
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('week_number', { ascending: true })
        .limit(5)

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

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
        
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-gradient mb-2">
                Hi {profile?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-lg text-muted-foreground">
                {enrollmentStatus.isEnrolled 
                  ? "Continue your learning journey" 
                  : "Ready to start your no-code journey?"
                }
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="glass-card-strong hover-lift pt-4">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Profile Summary</h3>
                          <p className="text-sm text-muted-foreground">
                            Welcome to your learning journey
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{user?.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{profile?.name || 'Not set'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={enrollmentStatus.isEnrolled ? "default" : "secondary"}>
                              {enrollmentStatus.isEnrolled ? "Enrolled Learner" : "Learner"}
                            </Badge>
                          </div>
                          {profile?.created_at && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enrolled Courses / Get Started */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {enrollmentStatus.isEnrolled ? (
                    <Card className="glass-card-strong hover-lift pt-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          My Courses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-gradient-primary/10 rounded-2xl">
                            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">5-Week Idea to Product Course</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Build real products without writing code
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-success/10 text-success border-success/20">
                                  Enrolled
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {enrollmentStatus.courseName && `Course: ${enrollmentStatus.courseName}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>0% Complete</span>
                            </div>
                            <Progress value={0} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Course will begin soon. You'll receive updates via email.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="glass-card-strong hover-lift pt-4">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold">Ready to Start Learning?</h3>
                          <p className="text-muted-foreground">
                            Join our comprehensive no-code course and build real products
                          </p>
                          <Button 
                            size="lg" 
                            className="button-3d hover-glow"
                            onClick={() => window.location.href = '/pricing'}
                          >
                            View Pricing & Enroll
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>

                {/* Quick Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="glass-card-strong pt-4">
                    <CardHeader>
                      <CardTitle>Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="justify-start h-12" 
                          disabled={!enrollmentStatus.isEnrolled}
                          onClick={() => enrollmentStatus.isEnrolled && navigate('/my-courses')}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          My Courses
                        </Button>
                        <Button variant="outline" className="justify-start h-12" disabled>
                          <Award className="w-4 h-4 mr-2" />
                          Certificates
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start h-12"
                          onClick={() => navigate('/contact')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Support
                        </Button>
                        <Button variant="outline" className="justify-start h-12" disabled>
                          <Users className="w-4 h-4 mr-2" />
                          Community
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Notifications */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="glass-card pt-4">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="w-5 h-5" />
                        Announcements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {announcements.length === 0 ? (
                        <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
                          <h4 className="font-medium text-sm">Welcome to the Platform!</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            No announcements yet. Check back later for updates!
                          </p>
                        </div>
                      ) : (
                        announcements.map((announcement, index) => (
                          <div key={announcement.id} className={`p-3 rounded-lg border ${
                            index === 0 
                              ? 'bg-primary/10 border-primary/20' 
                              : 'bg-accent/10 border-accent/20'
                          }`}>
                            <h4 className="font-medium text-sm">{announcement.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {announcement.body}
                            </p>
                            <span className={`text-xs ${index === 0 ? 'text-primary' : 'text-accent'}`}>
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Course Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="glass-card pt-4">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Star className="w-5 h-5" />
                        Popular Courses
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3">
                       {courses.length === 0 ? (
                         <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
                           <h4 className="font-medium text-sm">No courses available</h4>
                           <p className="text-xs text-muted-foreground mt-1">
                             Courses will appear here once they are published.
                           </p>
                         </div>
                       ) : (
                         <div className="space-y-2">
                           {courses.map((course) => (
                             <div key={course.id} className="flex items-center gap-2">
                               <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                                 <BookOpen className="w-4 h-4 text-white" />
                               </div>
                               <div className="flex-1">
                                 <h4 className="font-medium text-sm">{course.title}</h4>
                                 <p className="text-xs text-muted-foreground">
                                   Week {course.week_number}
                                 </p>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </CardContent>
                  </Card>
                </motion.div>

                {/* Study Streak */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="glass-card pt-4">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bookmark className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold">Study Streak</h3>
                      <p className="text-2xl font-bold text-gradient">0 days</p>
                      <p className="text-xs text-muted-foreground">
                        {enrollmentStatus.isEnrolled ? "Start your learning journey!" : "Enroll to begin tracking"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}