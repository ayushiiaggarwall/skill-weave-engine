import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Tags, Clock, Percent } from "lucide-react"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"

interface Course {
  id: string
  title: string
  is_active: boolean
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
  early_bird_end_date: string | null
  is_early_bird_active: boolean
  created_at: string
  updated_at: string
}

interface Coupon {
  code: string
  type: 'percent' | 'flat'
  value: number
  active: boolean | null
  created_at: string
}

export default function PricingCouponManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursePricing, setCoursePricing] = useState<CoursePricing[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [editingPricing, setEditingPricing] = useState<CoursePricing | null>(null)
  const [showNewCouponForm, setShowNewCouponForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percent' as 'percent' | 'flat',
    value: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, pricingRes, couponsRes] = await Promise.all([
        supabase.from('courses').select('id, title, is_active').eq('is_active', true),
        supabase.from('course_pricing').select('*'),
        supabase.from('coupons').select('*').order('created_at', { ascending: false })
      ])

      if (coursesRes.error) throw coursesRes.error
      if (pricingRes.error) throw pricingRes.error
      if (couponsRes.error) throw couponsRes.error

      setCourses(coursesRes.data || [])
      setCoursePricing((pricingRes.data || []).map(pricing => ({
        ...pricing,
        early_bird_end_date: pricing.early_bird_end_date || null,
        is_early_bird_active: pricing.is_early_bird_active || false
      })))
      setCoupons((couponsRes.data || []).map(coupon => ({
        ...coupon,
        active: coupon.active ?? true
      })))
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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
          usd_early_bird: editingPricing.usd_early_bird,
          early_bird_end_date: editingPricing.early_bird_end_date,
          is_early_bird_active: editingPricing.is_early_bird_active
        })
        .eq('id', editingPricing.id)

      if (error) throw error

      setEditingPricing(null)
      fetchData()
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

  const createCoupon = async () => {
    if (!newCoupon.code.trim() || newCoupon.value <= 0) {
      toast({
        title: "Error",
        description: "Please provide a valid coupon code and value",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          code: newCoupon.code.toUpperCase(),
          type: newCoupon.type,
          value: newCoupon.value,
          active: true
        }])

      if (error) throw error

      setNewCoupon({ code: '', type: 'percent', value: 0 })
      setShowNewCouponForm(false)
      fetchData()
      toast({
        title: "Success",
        description: "Coupon created successfully"
      })
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast({
        title: "Error",
        description: "Failed to create coupon. Code might already exist.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleCouponStatus = async (code: string, active: boolean | null) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !active })
        .eq('code', code)

      if (error) throw error

      fetchData()
      toast({
        title: "Success",
        description: `Coupon ${!active ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error) {
      console.error('Error updating coupon:', error)
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive"
      })
    }
  }

  const deleteCoupon = async (code: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('code', code)

      if (error) throw error

      fetchData()
      toast({
        title: "Success",
        description: "Coupon deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      })
    }
  }

  const getPricingByCourse = (courseId: string) => {
    return coursePricing.find(p => p.course_id === courseId)
  }

  if (loading) {
    return <div className="animate-pulse">Loading pricing and coupons...</div>
  }

  return (
    <div className="space-y-8">
      {/* Course Pricing Management */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Course Pricing Management</h2>
        </div>

        <div className="grid gap-6">
          {courses.map((course) => {
            const pricing = getPricingByCourse(course.id)
            const isEditing = editingPricing?.course_id === course.id

            if (!pricing) return null

            return (
              <AnimatedCard key={course.id}>
                <AnimatedCardHeader>
                  <div className="flex justify-between items-start">
                    <AnimatedCardTitle className="flex items-center space-x-2">
                      <span>{course.title}</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </AnimatedCardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPricing(isEditing ? null : pricing)}
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? 'Cancel' : 'Edit Pricing'}
                    </Button>
                  </div>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  {isEditing ? (
                    <div className="space-y-6">
                      {/* Early Bird Settings */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Early Bird Settings
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Early Bird End Date</label>
                            <Input
                              type="datetime-local"
                              value={editingPricing.early_bird_end_date || ''}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                early_bird_end_date: e.target.value
                              })}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <input
                              type="checkbox"
                              id={`early_bird_${course.id}`}
                              checked={editingPricing.is_early_bird_active}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                is_early_bird_active: e.target.checked
                              })}
                            />
                            <label htmlFor={`early_bird_${course.id}`} className="text-sm font-medium">
                              Enable Early Bird Pricing
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* USD Pricing */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-4">USD Pricing ($)</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Early Bird</label>
                            <Input
                              type="number"
                              value={editingPricing.usd_early_bird}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                usd_early_bird: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Regular</label>
                            <Input
                              type="number"
                              value={editingPricing.usd_regular}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                usd_regular: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">MRP</label>
                            <Input
                              type="number"
                              value={editingPricing.usd_mrp}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                usd_mrp: parseInt(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* INR Pricing */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-4">INR Pricing (₹)</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Early Bird</label>
                            <Input
                              type="number"
                              value={editingPricing.inr_early_bird}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                inr_early_bird: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Regular</label>
                            <Input
                              type="number"
                              value={editingPricing.inr_regular}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                inr_regular: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">MRP</label>
                            <Input
                              type="number"
                              value={editingPricing.inr_mrp}
                              onChange={(e) => setEditingPricing({
                                ...editingPricing,
                                inr_mrp: parseInt(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <Button onClick={updateCoursePricing} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Pricing'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Early Bird Status */}
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Early Bird Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            pricing.is_early_bird_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {pricing.is_early_bird_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {pricing.early_bird_end_date && (
                          <span className="text-sm text-muted-foreground">
                            Ends: {new Date(pricing.early_bird_end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Pricing Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">USD Pricing</h4>
                          <div className="text-sm space-y-1">
                            <div>Early Bird: <span className="font-medium">${pricing.usd_early_bird}</span></div>
                            <div>Regular: <span className="font-medium">${pricing.usd_regular}</span></div>
                            <div>MRP: <span className="font-medium line-through text-muted-foreground">${pricing.usd_mrp}</span></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold">INR Pricing</h4>
                          <div className="text-sm space-y-1">
                            <div>Early Bird: <span className="font-medium">₹{pricing.inr_early_bird}</span></div>
                            <div>Regular: <span className="font-medium">₹{pricing.inr_regular}</span></div>
                            <div>MRP: <span className="font-medium line-through text-muted-foreground">₹{pricing.inr_mrp}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatedCardContent>
              </AnimatedCard>
            )
          })}
        </div>
      </div>

      {/* Coupon Management */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="w-6 h-6" />
            Coupon Management
          </h2>
          <Button onClick={() => setShowNewCouponForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Coupon
          </Button>
        </div>

        {/* New Coupon Form */}
        {showNewCouponForm && (
          <AnimatedCard>
            <AnimatedCardHeader>
              <AnimatedCardTitle>Create New Coupon</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coupon Code</label>
                  <Input
                    placeholder="SAVE20"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type</label>
                  <Select
                    value={newCoupon.type}
                    onValueChange={(value: 'percent' | 'flat') => setNewCoupon({...newCoupon, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Value {newCoupon.type === 'percent' ? '(%)' : '(Amount)'}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={newCoupon.type === 'percent' ? "100" : undefined}
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={createCoupon} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Coupon'}
                </Button>
                <Button variant="outline" onClick={() => setShowNewCouponForm(false)}>
                  Cancel
                </Button>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        )}

        {/* Existing Coupons */}
        <AnimatedCard>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Existing Coupons ({coupons.length})</AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            {coupons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No coupons created yet</p>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Percent className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono font-bold">{coupon.code}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        coupon.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCouponStatus(coupon.code, coupon.active)}
                      >
                        {coupon.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCoupon(coupon.code)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCardContent>
        </AnimatedCard>
      </div>
    </div>
  )
}
