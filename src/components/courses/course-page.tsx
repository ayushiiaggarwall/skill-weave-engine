import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
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

export function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
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
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="container mx-auto max-w-7xl">
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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Course Curriculum
          </h1>
          <p className="text-muted-foreground mt-2">
            48-Hour Product Development Mastery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Week List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Weeks
            </h2>
            
            {courses.map((course) => (
              <Card 
                key={course.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedWeek?.id === course.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:ring-1 hover:ring-primary/50'
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

          {/* Right Panel - Week Details */}
          <div className="lg:col-span-2">
            {selectedWeek ? (
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-sm">
                      Week {selectedWeek.week_number}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">
                    {selectedWeek.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Objective */}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-primary" />
                      Objective
                    </h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-primary font-medium">
                        {selectedWeek.objective}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Content Overview
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      {formatContent(selectedWeek.content)}
                    </div>
                  </div>

                  {/* Mini Project */}
                  {selectedWeek.mini_project && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <Code className="h-5 w-5 text-primary" />
                        Mini Project
                      </h3>
                      <div className="bg-muted/50 border rounded-lg p-4">
                        <p className="font-medium text-foreground">
                          {selectedWeek.mini_project}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Deliverables */}
                  {selectedWeek.deliverables && selectedWeek.deliverables.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Deliverables
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <ul className="space-y-2">
                          {selectedWeek.deliverables.map((deliverable, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-green-800 dark:text-green-100">
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
              <Card className="h-64 flex items-center justify-center">
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Select a week to view course details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}