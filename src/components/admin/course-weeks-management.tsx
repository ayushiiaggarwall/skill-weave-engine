import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Calendar, Eye, EyeOff, BookOpen } from "lucide-react"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"

interface Course {
  id: string
  title: string
  is_active: boolean
}

interface CourseWeek {
  id: string
  course_id: string
  week_number: number
  title: string
  objective: string
  content: string
  mini_project: string | null
  deliverables: string[] | null
  visible: boolean
  created_at: string
  updated_at: string
}

export default function CourseWeeksManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [editingWeek, setEditingWeek] = useState<CourseWeek | null>(null)
  const [showNewWeekForm, setShowNewWeekForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [newWeek, setNewWeek] = useState({
    week_number: 1,
    title: '',
    objective: '',
    content: '',
    mini_project: '',
    deliverables: [] as string[],
    visible: true
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseWeeks()
    }
  }, [selectedCourseId])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, is_active')
        .eq('is_active', true)
        .order('title')

      if (error) throw error
      setCourses(data || [])
      
      if (data && data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseWeeks = async () => {
    if (!selectedCourseId) return

    try {
      const { data, error } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', selectedCourseId)
        .order('week_number')

      if (error) throw error
      setCourseWeeks((data || []).map(week => ({
        ...week,
        deliverables: week.deliverables || []
      })))
    } catch (error) {
      console.error('Error fetching course weeks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch course weeks",
        variant: "destructive"
      })
    }
  }

  const createWeek = async () => {
    if (!selectedCourseId || !newWeek.title.trim() || !newWeek.content.trim() || !newWeek.objective.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('course_weeks')
        .insert([{
          course_id: selectedCourseId,
          week_number: newWeek.week_number,
          title: newWeek.title,
          objective: newWeek.objective,
          content: newWeek.content,
          mini_project: newWeek.mini_project || null,
          deliverables: newWeek.deliverables,
          visible: newWeek.visible
        }])

      if (error) throw error

      setNewWeek({
        week_number: 1,
        title: '',
        objective: '',
        content: '',
        mini_project: '',
        deliverables: [],
        visible: true
      })
      setShowNewWeekForm(false)
      fetchCourseWeeks()
      toast({
        title: "Success",
        description: "Course week created successfully"
      })
    } catch (error) {
      console.error('Error creating course week:', error)
      toast({
        title: "Error",
        description: "Failed to create course week. Week number might already exist.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateWeek = async () => {
    if (!editingWeek) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('course_weeks')
        .update({
          week_number: editingWeek.week_number,
          title: editingWeek.title,
          objective: editingWeek.objective,
          content: editingWeek.content,
          mini_project: editingWeek.mini_project,
          deliverables: editingWeek.deliverables,
          visible: editingWeek.visible
        })
        .eq('id', editingWeek.id)

      if (error) throw error

      setEditingWeek(null)
      fetchCourseWeeks()
      toast({
        title: "Success",
        description: "Course week updated successfully"
      })
    } catch (error) {
      console.error('Error updating course week:', error)
      toast({
        title: "Error",
        description: "Failed to update course week",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteWeek = async (weekId: string) => {
    if (!confirm('Are you sure you want to delete this week? This will also remove any associated content.')) return

    try {
      const { error } = await supabase
        .from('course_weeks')
        .delete()
        .eq('id', weekId)

      if (error) throw error

      fetchCourseWeeks()
      toast({
        title: "Success",
        description: "Course week deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting course week:', error)
      toast({
        title: "Error",
        description: "Failed to delete course week",
        variant: "destructive"
      })
    }
  }

  const toggleWeekVisibility = async (weekId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('course_weeks')
        .update({ visible: !currentVisibility })
        .eq('id', weekId)

      if (error) throw error

      fetchCourseWeeks()
      toast({
        title: "Success",
        description: `Week ${!currentVisibility ? 'shown' : 'hidden'} successfully`
      })
    } catch (error) {
      console.error('Error updating visibility:', error)
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive"
      })
    }
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  if (loading) {
    return <div className="animate-pulse">Loading course weeks management...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Weeks Management</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setShowNewWeekForm(true)} 
            className="flex items-center gap-2"
            disabled={!selectedCourseId}
          >
            <Plus className="w-4 h-4" />
            Add Week
          </Button>
        </div>
      </div>

      {selectedCourse && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {selectedCourse.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Managing weekly content and structure for this course
          </p>
        </div>
      )}

      {/* New Week Form */}
      {showNewWeekForm && (
        <AnimatedCard>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Add New Week</AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Week Number</label>
                <Input
                  type="number"
                  min="1"
                  value={newWeek.week_number}
                  onChange={(e) => setNewWeek({...newWeek, week_number: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Week Title</label>
                <Input
                  placeholder="e.g., Introduction to React"
                  value={newWeek.title}
                  onChange={(e) => setNewWeek({...newWeek, title: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Week Objective</label>
              <Textarea
                placeholder="What will students achieve this week?"
                value={newWeek.objective}
                onChange={(e) => setNewWeek({...newWeek, objective: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Week Content</label>
              <Textarea
                placeholder="Detailed weekly content description"
                value={newWeek.content}
                onChange={(e) => setNewWeek({...newWeek, content: e.target.value})}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mini Project (Optional)</label>
              <Textarea
                placeholder="Mini project description for this week"
                value={newWeek.mini_project}
                onChange={(e) => setNewWeek({...newWeek, mini_project: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visible"
                checked={newWeek.visible}
                onChange={(e) => setNewWeek({...newWeek, visible: e.target.checked})}
              />
              <label htmlFor="visible" className="text-sm font-medium">Make week visible to students</label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createWeek} disabled={saving}>
                {saving ? 'Creating...' : 'Create Week'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewWeekForm(false)}>
                Cancel
              </Button>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      )}

      {/* Course Weeks List */}
      <div className="grid gap-4">
        {courseWeeks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No weeks created for this course yet</p>
            <p className="text-sm">Click "Add Week" to get started</p>
          </div>
        ) : (
          courseWeeks.map((week) => {
            const isEditing = editingWeek?.id === week.id

            return (
              <AnimatedCard key={week.id} className={`${!week.visible ? 'opacity-60' : ''}`}>
                <AnimatedCardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        week.visible ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {week.week_number}
                      </div>
                      <div>
                        {isEditing ? (
                          <Input
                            value={editingWeek.title}
                            onChange={(e) => setEditingWeek({...editingWeek, title: e.target.value})}
                            className="text-lg font-semibold"
                          />
                        ) : (
                          <AnimatedCardTitle>{week.title}</AnimatedCardTitle>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Week {week.week_number} • {week.visible ? 'Visible' : 'Hidden'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWeekVisibility(week.id, week.visible)}
                      >
                        {week.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWeek(isEditing ? null : week)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteWeek(week.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </AnimatedCardHeader>
                
                <AnimatedCardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Week Number</label>
                        <Input
                          type="number"
                          min="1"
                          value={editingWeek.week_number}
                          onChange={(e) => setEditingWeek({...editingWeek, week_number: parseInt(e.target.value) || 1})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Objective</label>
                        <Textarea
                          value={editingWeek.objective}
                          onChange={(e) => setEditingWeek({...editingWeek, objective: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                          value={editingWeek.content}
                          onChange={(e) => setEditingWeek({...editingWeek, content: e.target.value})}
                          rows={6}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mini Project</label>
                        <Textarea
                          value={editingWeek.mini_project || ''}
                          onChange={(e) => setEditingWeek({...editingWeek, mini_project: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={updateWeek} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingWeek(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Objective</h4>
                        <p className="text-sm text-muted-foreground">{week.objective}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Content</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">{week.content}</p>
                      </div>

                      {week.mini_project && (
                        <div>
                          <h4 className="font-medium mb-2">Mini Project</h4>
                          <p className="text-sm text-muted-foreground">{week.mini_project}</p>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatedCardContent>
              </AnimatedCard>
            )
          })
        )}
      </div>
    </div>
  )
}