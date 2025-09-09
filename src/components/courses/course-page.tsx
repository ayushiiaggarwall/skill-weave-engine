import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/landing/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Target, Code, CheckCircle } from 'lucide-react'

interface Course {
  id: string
  title: string
  week_number: number
  objective: string
  content: string
  mini_project: string | null
  deliverables: string[] | null
}

interface CourseInfo {
  startDate: string | null
  endDate: string | null
  inductionDate: string | null
}

export function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Course | null>(null)
  const [courseTitle, setCourseTitle] = useState<string>('')
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({ 
    startDate: null, 
    endDate: null, 
    inductionDate: null 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Specifically get the Essential Track course
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, objective, start_date, end_date, induction_date')
        .eq('is_active', true)
        .ilike('title', '%Essential Track%')
        .limit(1)

      if (coursesError) throw coursesError

      let courseId: string
      
      if (!coursesData || coursesData.length === 0) {
        // Fallback to any active course if Essential Track not found
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('courses')
          .select('id, title, objective, start_date, end_date, induction_date')
          .eq('is_active', true)
          .limit(1)
        
        if (fallbackError) throw fallbackError
        if (!fallbackData || fallbackData.length === 0) {
          console.log('No active courses found')
          return
        }
        setCourseTitle(fallbackData[0].title)
        setCourseInfo({
          startDate: fallbackData[0].start_date,
          endDate: fallbackData[0].end_date,
          inductionDate: fallbackData[0].induction_date
        })
        courseId = fallbackData[0].id
      } else {
        courseId = coursesData[0].id
        setCourseTitle(coursesData[0].title)
        setCourseInfo({
          startDate: coursesData[0].start_date,
          endDate: coursesData[0].end_date,
          inductionDate: coursesData[0].induction_date
        })
      }

      // Now get the course weeks for the active course
      const { data, error } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', courseId)
        .eq('visible', true)
        .order('week_number')

      if (error) throw error

      setCourses(data || [])
      // Default to Week 1 on first load
      if (data && data.length > 0) {
        setSelectedWeek(data[0])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      const parts = paragraph.split(' -> ')
      return (
        <p key={index} className="mb-4 last:mb-0">
          {parts.map((part, partIndex) => (
            <span key={partIndex}>
              {partIndex > 0 && <><br />→ </>}
              {part}
            </span>
          ))}
        </p>
      )
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                  ))}
                </div>
                <div className="lg:col-span-2">
                  <div className="h-96 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Course Curriculum
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Master the art of turning ideas into real products in just 5 weeks with our step-by-step Builder's Program
            </p>
            
            {/* Course Timeline Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              {courseInfo.inductionDate && (
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border">
                  <span className="text-muted-foreground">Induction Date:</span>
                  <span className="font-semibold text-primary">
                    {new Date(courseInfo.inductionDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
              {courseInfo.startDate && courseInfo.endDate && (
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border">
                  <span className="text-muted-foreground">Course Timeline:</span>
                  <span className="font-semibold text-primary">
                    {new Date(courseInfo.startDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric' 
                    })} - {new Date(courseInfo.endDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Week List */}
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-2xl border border-white/10">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {courseTitle || 'Course Weeks'}
                </h2>
                
                <div className="space-y-3">
                  {courses.map((course) => (
                    <Card 
                      key={course.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
                        selectedWeek?.id === course.id 
                          ? 'ring-2 ring-primary shadow-lg shadow-primary/20 bg-gradient-to-r from-primary/5 to-primary/10' 
                          : 'hover:ring-1 hover:ring-primary/50 glass-card'
                      }`}
                      onClick={() => setSelectedWeek(course)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={selectedWeek?.id === course.id ? "default" : "secondary"}
                            className="text-xs"
                          >
                            Week {course.week_number}
                          </Badge>
                          {selectedWeek?.id === course.id && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <CardTitle className="text-sm leading-tight">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Panel - Week Details */}
            <div className="lg:col-span-2">
              {selectedWeek ? (
                <Card className="glass-card border border-white/10">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-sm bg-gradient-to-r from-primary to-primary/80">
                        Week {selectedWeek.week_number}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {selectedWeek.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Objective */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-primary" />
                        Objective
                      </h3>
                      <div className="glass-card bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                        <p className="text-primary font-medium text-lg leading-relaxed">
                          {selectedWeek.objective}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Content Overview
                      </h3>
                      <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
                          {formatContent(selectedWeek.content)}
                        </div>
                      </div>
                    </div>

                    {/* Mini Project */}
                    {selectedWeek.mini_project && (
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                          <Code className="h-5 w-5 text-primary" />
                          Mini Project
                        </h3>
                        <div className="glass-card bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6">
                          <p className="font-medium text-foreground text-lg">
                            {selectedWeek.mini_project}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Deliverables */}
                    {selectedWeek.deliverables && selectedWeek.deliverables.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          Deliverables
                        </h3>
                        <div className="glass-card bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-6">
                          <ul className="space-y-3">
                            {selectedWeek.deliverables.map((deliverable, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-green-800 dark:text-green-100 leading-relaxed">
                                  {deliverable}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card h-64 flex items-center justify-center border border-white/10">
                  <CardContent>
                    <p className="text-muted-foreground text-center text-lg">
                      Select a week to view course details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}