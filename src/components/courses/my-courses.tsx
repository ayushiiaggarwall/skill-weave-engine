import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  Award, 
  Clock,
  Play,
  CheckCircle,
  Star,
  Calendar,
  Users,
  ExternalLink
} from "lucide-react"

const courseModules = [
  {
    week: 1,
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of HTML, CSS, and JavaScript",
    duration: "4 hours",
    status: "completed",
    progress: 100,
    topics: ["HTML Basics", "CSS Fundamentals", "JavaScript Introduction"]
  },
  {
    week: 2,
    title: "React Fundamentals",
    description: "Master React components, props, and state management",
    duration: "6 hours",
    status: "current",
    progress: 75,
    topics: ["Components", "Props & State", "Event Handling", "Hooks"]
  },
  {
    week: 3,
    title: "Advanced React Patterns",
    description: "Context API, custom hooks, and performance optimization",
    duration: "5 hours",
    status: "locked",
    progress: 0,
    topics: ["Context API", "Custom Hooks", "Performance", "Testing"]
  },
  {
    week: 4,
    title: "Backend Integration",
    description: "APIs, databases, and full-stack development",
    duration: "8 hours",
    status: "locked",
    progress: 0,
    topics: ["REST APIs", "Database Design", "Authentication", "Deployment"]
  }
]

export function MyCourses() {
  const enrollmentStatus = useEnrollmentStatus()

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
                {enrollmentStatus.cohortName || "Active Learner"}
              </Badge>
            </div>

            {/* Overall Progress */}
            <Card className="mb-8 pt-4">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Progress</h3>
                    <p className="text-muted-foreground">Complete Web Development Course</p>
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

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="pt-4">
              <CardContent className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1</div>
                <p className="text-sm text-muted-foreground">Certificates Earned</p>
              </CardContent>
            </Card>
            <Card className="pt-4">
              <CardContent className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">23h</div>
                <p className="text-sm text-muted-foreground">Time Studied</p>
              </CardContent>
            </Card>
            <Card className="pt-4">
              <CardContent className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">5</div>
                <p className="text-sm text-muted-foreground">Projects Completed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}