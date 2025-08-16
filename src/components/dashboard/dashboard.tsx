import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { courseData } from "@/lib/course-data"
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Trophy, 
  User, 
  LogOut,
  CheckCircle,
  PlayCircle,
  Download
} from "lucide-react"

interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress] = useState(25) // Mock progress

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user as User)
      setIsLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    window.location.href = "/login"
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gradient">
              LearnLaunch
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Continue your journey to building profitable products
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gradient">
                    {courseData.title}
                  </CardTitle>
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    In Progress
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {courseData.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">Course Progress</span>
                    <span className="text-muted-foreground">{progress}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Syllabus */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Course Syllabus</h4>
                  <div className="space-y-3">
                    {courseData.syllabus.map((week, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          {index === 0 ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : index === 1 ? (
                            <PlayCircle className="w-5 h-5 text-primary" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{week}</p>
                            <p className="text-sm text-muted-foreground">
                              {index === 0 ? "Completed" : index === 1 ? "Current" : "Coming soon"}
                            </p>
                          </div>
                        </div>
                        {index <= 1 && (
                          <Button 
                            size="sm" 
                            variant={index === 0 ? "outline" : "default"}
                            className={index === 0 ? "opacity-50" : ""}
                          >
                            {index === 0 ? "Review" : "Continue"}
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Lessons Completed</span>
                  </div>
                  <span className="font-semibold">5 / 20</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Achievements</span>
                  </div>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Days Active</span>
                  </div>
                  <span className="font-semibold">7</span>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Course Materials
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Live Sessions
                </Button>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">No-Code Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {courseData.tools.slice(0, 6).map((tool, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-white/5 border-white/20"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
