import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, Bell, Trash2, Upload, Award, BookOpen } from "lucide-react"
import { Header } from "@/components/landing/header"
import ContentManagement from './content-management'
import CertificatesManagement from './certificates-management'
import CourseManagement from './course-management'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  enrollments?: {
    payment_status: string
    course_id?: string
    courses?: {
      title: string
      is_active: boolean
    }
  }[]
  order_enrollments?: {
    status: string
    amount: number
    currency: string
    course_type: string | null
    course_id?: string | null
    courses?: {
      title: string
    } | null
  }[]
}

interface Announcement {
  id: string
  title: string
  body: string
  created_at: string
  course_id?: string | null
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchAnnouncements()
  }, [])

  const fetchUsers = async () => {
    try {
      // First get profiles with enrollments
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          enrollments (
            payment_status,
            course_id,
            courses (
              title,
              is_active
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Then get order enrollments separately with course info
      const { data: orderEnrollments, error: orderError } = await supabase
        .from('order_enrollments')
        .select(`
          user_id, 
          user_email, 
          status, 
          amount, 
          currency, 
          course_type,
          course_id,
          courses (
            title
          )
        `)

      if (orderError) throw orderError

      // Combine the data
      const usersWithEnrollments = profilesData?.map(profile => {
        const userOrderEnrollments = orderEnrollments?.filter(order => 
          order.user_id === profile.id || order.user_email === profile.email
        ) || []
        
        return {
          ...profile,
          order_enrollments: userOrderEnrollments
        }
      }) || []

      setUsers(usersWithEnrollments)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive"
      })
    }
  }

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and body",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          title: newAnnouncement.title,
          body: newAnnouncement.body
        }])

      if (error) throw error

      setNewAnnouncement({ title: '', body: '' })
      fetchAnnouncements()
      toast({
        title: "Success",
        description: "Announcement created successfully"
      })
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      })
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchAnnouncements()
      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">Loading admin dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage course pricing, content, and view users</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={activeTab === 'courses' ? 'default' : 'outline'}
              onClick={() => setActiveTab('courses')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Button>
            <Button
              variant={activeTab === 'content' ? 'default' : 'outline'}
              onClick={() => setActiveTab('content')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Course Content
            </Button>
            <Button
              variant={activeTab === 'certificates' ? 'default' : 'outline'}
              onClick={() => setActiveTab('certificates')}
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Certificates
            </Button>
            <Button
              variant={activeTab === 'announcements' ? 'default' : 'outline'}
              onClick={() => setActiveTab('announcements')}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Announcements
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
          </div>

          {activeTab === 'courses' && (
            <CourseManagement />
          )}
          {activeTab === 'content' && (
            <ContentManagement />
          )}
          {activeTab === 'certificates' && (
            <CertificatesManagement />
          )}

          {activeTab === 'announcements' && (
            <AnimatedCard>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Announcements Management</span>
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent className="space-y-6">
                {/* Create New Announcement */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold">Create New Announcement</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    />
                    <textarea
                      placeholder="Announcement body"
                      value={newAnnouncement.body}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                    <Button onClick={createAnnouncement}>
                      Create Announcement
                    </Button>
                  </div>
                </div>

                {/* Existing Announcements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Existing Announcements ({announcements.length})</h3>
                  {announcements.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No announcements yet</p>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{announcement.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{announcement.body}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(announcement.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAnnouncement(announcement.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          )}

          {activeTab === 'users' && (
            <AnimatedCard>
              <AnimatedCardHeader>
                <AnimatedCardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Registered Users ({users.length})</span>
                </AnimatedCardTitle>
              </AnimatedCardHeader>
              <AnimatedCardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Enrollment Status</th>
                        <th className="text-left p-2">Course Type</th>
                        <th className="text-left p-2">Amount Paid</th>
                        <th className="text-left p-2">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        // Check enrollment status
                        const hasCompletedEnrollment = user.enrollments?.some(e => 
                          ['paid', 'completed'].includes(e.payment_status)
                        ) || false
                        
                        const hasOrderEnrollment = user.order_enrollments?.some(e => 
                          e.status === 'paid'
                        ) || false
                        
                        const isEnrolled = hasCompletedEnrollment || hasOrderEnrollment
                        
                        const activeCourse = user.enrollments?.find(e => 
                          ['paid', 'completed'].includes(e.payment_status) && e.courses?.is_active
                        )?.courses
                        
                        const paidOrder = user.order_enrollments?.find(e => e.status === 'paid')
                        const courseType = paidOrder?.course_type || 'N/A'
                        const courseTitle = paidOrder?.courses?.title || courseType
                        const amountPaid = paidOrder ? `${paidOrder.currency === 'USD' ? '$' : '₹'}${paidOrder.amount}` : 'N/A'
                        
                        return (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                isEnrolled
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                              </span>
                            </td>
                            <td className="p-2">
                              {paidOrder ? (
                                <span className="text-sm font-medium">
                                  {courseTitle}
                                  {activeCourse && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({activeCourse.title})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <span className={`text-sm font-medium ${
                                paidOrder ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                              }`}>
                                {amountPaid}
                              </span>
                            </td>
                            <td className="p-2">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  )
}
