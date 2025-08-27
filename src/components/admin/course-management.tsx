import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"

interface Course {
  id: string
  title: string
  objective: string
  total_weeks: number
  plans: string[]
  deliverables: string[] | null
  mini_project: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CoursePricing {
  id: string
  course_id: string
  inr_mrp: number
  inr_regular: number
  inr_early_bird: number
  usd_mrp: number
  usd_regular: number
  usd_early_bird: number
  created_at: string
  updated_at: string
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursePricing, setCoursePricing] = useState<CoursePricing[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingPricing, setEditingPricing] = useState<CoursePricing | null>(null)
  const [showNewCourseForm, setShowNewCourseForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [newCourse, setNewCourse] = useState({
    title: '',
    objective: '',
    total_weeks: 5,
    plans: [] as string[],
    deliverables: [] as string[],
    mini_project: '',
    start_date: '',
    end_date: '',
    is_active: false
  })
  
  const [isNewPlanForExisting, setIsNewPlanForExisting] = useState(false)
  const [selectedExistingCourse, setSelectedExistingCourse] = useState<string>('')

  const [newPricing, setNewPricing] = useState({
    inr_mrp: 9999,
    inr_regular: 6499,
    inr_early_bird: 5499,
    usd_mrp: 199,
    usd_regular: 149,
    usd_early_bird: 129
  })

  useEffect(() => {
    fetchCourses()
    fetchCoursePricing()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses((data || []).map(course => ({
        ...course,
        plans: course.plans || [],
        deliverables: course.deliverables || [],
        total_weeks: course.total_weeks || 5
      })))
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

  const fetchCoursePricing = async () => {
    try {
      const { data, error } = await supabase
        .from('course_pricing')
        .select('*')

      if (error) throw error
      setCoursePricing(data || [])
    } catch (error) {
      console.error('Error fetching course pricing:', error)
    }
  }

  const copyFromExistingCourse = async () => {
    if (!selectedExistingCourse) return

    try {
      const { data: existingCourse, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', selectedExistingCourse)
        .single()

      if (error) throw error

      // Copy course data but keep the title and plans from current form
      setNewCourse(prev => ({
        ...prev,
        objective: existingCourse.objective,
        total_weeks: existingCourse.total_weeks || 5,
        deliverables: existingCourse.deliverables || [],
        mini_project: existingCourse.mini_project || ''
      }))

      toast({
        title: "Success",
        description: "Course data copied from existing course"
      })
    } catch (error) {
      console.error('Error copying course data:', error)
      toast({
        title: "Error",
        description: "Failed to copy course data",
        variant: "destructive"
      })
    }
  }

  const createCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.objective.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([{
          title: newCourse.title,
          objective: newCourse.objective,
          total_weeks: newCourse.total_weeks,
          plans: newCourse.plans,
          deliverables: newCourse.deliverables,
          mini_project: newCourse.mini_project || null,
          start_date: newCourse.start_date || null,
          end_date: newCourse.end_date || null,
          is_active: newCourse.is_active
        }])
        .select()
        .single()

      if (courseError) throw courseError

      // If this is a new plan for existing course, copy course weeks
      if (isNewPlanForExisting && selectedExistingCourse) {
        const { data: existingWeeks, error: weeksError } = await supabase
          .from('course_weeks')
          .select('*')
          .eq('course_id', selectedExistingCourse)

        if (!weeksError && existingWeeks) {
          const { error: copyWeeksError } = await supabase
            .from('course_weeks')
            .insert(
              existingWeeks.map(week => ({
                course_id: courseData.id,
                week_number: week.week_number,
                title: week.title,
                objective: week.objective,
                content: week.content,
                mini_project: week.mini_project,
                deliverables: week.deliverables,
                visible: week.visible
              }))
            )

          if (copyWeeksError) {
            console.error('Error copying course weeks:', copyWeeksError)
          }
        }
      }

      // Create pricing for the new course
      const { error: pricingError } = await supabase
        .from('course_pricing')
        .insert([{
          course_id: courseData.id,
          ...newPricing
        }])

      if (pricingError) throw pricingError

      setNewCourse({
        title: '',
        objective: '',
        total_weeks: 5,
        plans: [],
        deliverables: [],
        mini_project: '',
        start_date: '',
        end_date: '',
        is_active: false
      })
      setIsNewPlanForExisting(false)
      setSelectedExistingCourse('')
      setNewPricing({
        inr_mrp: 9999,
        inr_regular: 6499,
        inr_early_bird: 5499,
        usd_mrp: 199,
        usd_regular: 149,
        usd_early_bird: 129
      })
      setShowNewCourseForm(false)
      fetchCourses()
      fetchCoursePricing()
      toast({
        title: "Success",
        description: "Course created successfully"
      })
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateCourse = async () => {
    if (!editingCourse) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: editingCourse.title,
          objective: editingCourse.objective,
          total_weeks: editingCourse.total_weeks,
          plans: editingCourse.plans,
          deliverables: editingCourse.deliverables,
          mini_project: editingCourse.mini_project,
          start_date: editingCourse.start_date,
          end_date: editingCourse.end_date,
          is_active: editingCourse.is_active
        })
        .eq('id', editingCourse.id)

      if (error) throw error

      setEditingCourse(null)
      fetchCourses()
      toast({
        title: "Success",
        description: "Course updated successfully"
      })
    } catch (error) {
      console.error('Error updating course:', error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateCoursePricing = async () => {
    if (!editingPricing) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('course_pricing')
        .update({
          inr_mrp: editingPricing.inr_mrp,
          inr_regular: editingPricing.inr_regular,
          inr_early_bird: editingPricing.inr_early_bird,
          usd_mrp: editingPricing.usd_mrp,
          usd_regular: editingPricing.usd_regular,
          usd_early_bird: editingPricing.usd_early_bird
        })
        .eq('id', editingPricing.id)

      if (error) throw error

      setEditingPricing(null)
      fetchCoursePricing()
      toast({
        title: "Success",
        description: "Course pricing updated successfully"
      })
    } catch (error) {
      console.error('Error updating course pricing:', error)
      toast({
        title: "Error",
        description: "Failed to update course pricing",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete its pricing.')) return

    setSaving(true)
    try {
      // Delete pricing first
      await supabase
        .from('course_pricing')
        .delete()
        .eq('course_id', courseId)

      // Delete course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      fetchCourses()
      fetchCoursePricing()
      toast({
        title: "Success",
        description: "Course deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getCoursePrice = (courseId: string) => {
    return coursePricing.find(p => p.course_id === courseId)
  }

  if (loading) {
    return <div className="animate-pulse">Loading courses...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Button onClick={() => setShowNewCourseForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      {/* New Course Form */}
      {showNewCourseForm && (
        <AnimatedCard>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Create New Course</AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title</label>
                <Input
                  placeholder="Course title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Weeks</label>
                <Input
                  type="number"
                  min="1"
                  value={newCourse.total_weeks}
                  onChange={(e) => setNewCourse({...newCourse, total_weeks: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newCourse.start_date}
                  onChange={(e) => setNewCourse({...newCourse, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newCourse.end_date}
                  onChange={(e) => setNewCourse({...newCourse, end_date: e.target.value})}
                />
              </div>
            </div>
            
            
            {/* New Plan Option */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="isNewPlan"
                  checked={isNewPlanForExisting}
                  onChange={(e) => setIsNewPlanForExisting(e.target.checked)}
                />
                <label htmlFor="isNewPlan" className="text-sm font-medium">
                  Create new plan for existing course
                </label>
              </div>
              
              {isNewPlanForExisting && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Existing Course</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedExistingCourse}
                      onChange={(e) => setSelectedExistingCourse(e.target.value)}
                    >
                      <option value="">Select a course...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedExistingCourse && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={copyFromExistingCourse}
                      className="w-full"
                    >
                      Copy Course Data
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Objective</label>
              <Textarea
                placeholder="What will students learn?"
                value={newCourse.objective}
                onChange={(e) => setNewCourse({...newCourse, objective: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plans (comma-separated)</label>
              <Input
                placeholder="e.g., basic, premium, enterprise"
                value={newCourse.plans.join(', ')}
                onChange={(e) => setNewCourse({...newCourse, plans: e.target.value.split(',').map(p => p.trim()).filter(p => p)})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mini Project (Optional)</label>
              <Textarea
                placeholder="Mini project description"
                value={newCourse.mini_project}
                onChange={(e) => setNewCourse({...newCourse, mini_project: e.target.value})}
              />
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Course Pricing</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">USD Early Bird ($)</label>
                  <Input
                    type="number"
                    value={newPricing.usd_early_bird}
                    onChange={(e) => setNewPricing({...newPricing, usd_early_bird: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">USD Regular ($)</label>
                  <Input
                    type="number"
                    value={newPricing.usd_regular}
                    onChange={(e) => setNewPricing({...newPricing, usd_regular: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">USD MRP ($)</label>
                  <Input
                    type="number"
                    value={newPricing.usd_mrp}
                    onChange={(e) => setNewPricing({...newPricing, usd_mrp: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">INR Early Bird (₹)</label>
                  <Input
                    type="number"
                    value={newPricing.inr_early_bird}
                    onChange={(e) => setNewPricing({...newPricing, inr_early_bird: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">INR Regular (₹)</label>
                  <Input
                    type="number"
                    value={newPricing.inr_regular}
                    onChange={(e) => setNewPricing({...newPricing, inr_regular: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">INR MRP (₹)</label>
                  <Input
                    type="number"
                    value={newPricing.inr_mrp}
                    onChange={(e) => setNewPricing({...newPricing, inr_mrp: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={newCourse.is_active}
                onChange={(e) => setNewCourse({...newCourse, is_active: e.target.checked})}
              />
              <label htmlFor="is_active" className="text-sm font-medium">Make course active</label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createCourse} disabled={saving}>
                {saving ? 'Creating...' : 'Create Course'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewCourseForm(false)}>
                Cancel
              </Button>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      )}

      {/* Courses List */}
      <div className="grid gap-6">
        {courses.map((course) => {
          const pricing = getCoursePrice(course.id)
          const isEditing = editingCourse?.id === course.id
          const isPricingEditing = editingPricing?.course_id === course.id

          return (
            <AnimatedCard key={course.id}>
              <AnimatedCardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <AnimatedCardTitle className="flex items-center space-x-2">
                      {isEditing ? (
                        <Input
                          value={editingCourse.title}
                          onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <span>{course.title}</span>
                      )}
                    </AnimatedCardTitle>
                    <div className="flex items-center space-x-2">
                      {course.is_active ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {course.total_weeks} weeks
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCourse(isEditing ? null : course)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCourse(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </AnimatedCardHeader>
              <AnimatedCardContent className="space-y-4">
                {course.start_date && course.end_date && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Start: {new Date(course.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>End: {new Date(course.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Objective</label>
                      <Textarea
                        value={editingCourse.objective}
                        onChange={(e) => setEditingCourse({...editingCourse, objective: e.target.value})}
                      />
                    </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Total Weeks</label>
                       <Input
                         type="number"
                         min="1"
                         value={editingCourse.total_weeks}
                         onChange={(e) => setEditingCourse({...editingCourse, total_weeks: parseInt(e.target.value)})}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Plans (comma-separated)</label>
                       <Input
                         placeholder="e.g., basic, premium, enterprise"
                         value={editingCourse.plans.join(', ')}
                         onChange={(e) => setEditingCourse({...editingCourse, plans: e.target.value.split(',').map(p => p.trim()).filter(p => p)})}
                       />
                     </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingCourse.is_active}
                        onChange={(e) => setEditingCourse({...editingCourse, is_active: e.target.checked})}
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={updateCourse} disabled={saving} size="sm">
                        {saving ? 'Saving...' : 'Save Course'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCourse(null)} size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Objective:</strong> {course.objective}</p>
                    <p><strong>Duration:</strong> {course.total_weeks} weeks</p>
                    {course.plans.length > 0 && (
                      <p><strong>Plans:</strong> {course.plans.join(', ')}</p>
                    )}
                  </div>
                )}

                {/* Pricing Section */}
                {pricing && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Pricing</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPricing(isPricingEditing ? null : pricing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {isPricingEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Input
                          type="number"
                          placeholder="USD Early Bird"
                          value={editingPricing.usd_early_bird}
                          onChange={(e) => setEditingPricing({...editingPricing, usd_early_bird: parseInt(e.target.value)})}
                        />
                        <Input
                          type="number"
                          placeholder="USD Regular"
                          value={editingPricing.usd_regular}
                          onChange={(e) => setEditingPricing({...editingPricing, usd_regular: parseInt(e.target.value)})}
                        />
                        <Input
                          type="number"
                          placeholder="USD MRP"
                          value={editingPricing.usd_mrp}
                          onChange={(e) => setEditingPricing({...editingPricing, usd_mrp: parseInt(e.target.value)})}
                        />
                        <Input
                          type="number"
                          placeholder="INR Early Bird"
                          value={editingPricing.inr_early_bird}
                          onChange={(e) => setEditingPricing({...editingPricing, inr_early_bird: parseInt(e.target.value)})}
                        />
                        <Input
                          type="number"
                          placeholder="INR Regular"
                          value={editingPricing.inr_regular}
                          onChange={(e) => setEditingPricing({...editingPricing, inr_regular: parseInt(e.target.value)})}
                        />
                        <Input
                          type="number"
                          placeholder="INR MRP"
                          value={editingPricing.inr_mrp}
                          onChange={(e) => setEditingPricing({...editingPricing, inr_mrp: parseInt(e.target.value)})}
                        />
                        <div className="col-span-full flex space-x-2">
                          <Button onClick={updateCoursePricing} disabled={saving} size="sm">
                            {saving ? 'Saving...' : 'Save Pricing'}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingPricing(null)} size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>USD: ${pricing.usd_early_bird} / ${pricing.usd_regular} / ${pricing.usd_mrp}</div>
                        <div>INR: ₹{pricing.inr_early_bird} / ₹{pricing.inr_regular} / ₹{pricing.inr_mrp}</div>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedCardContent>
            </AnimatedCard>
          )
        })}
      </div>
    </div>
  )
}