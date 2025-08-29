import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, Bell, Trash2, Upload, Award, BookOpen, DollarSign, Calendar, BarChart3, Heart } from "lucide-react"
import { Header } from "@/components/landing/header"
import ContentManagement from './content-management'
import CertificatesManagement from './certificates-management'
import CourseManagement from './course-management'
import PricingCouponManagement from './pricing-coupon-management'
import CourseWeeksManagement from './course-weeks-management'
import { InternationalInterestManagement } from './international-interest-management'
import { formatCurrency } from "@/lib/utils"
interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  referral_source?: string | null
  email_verified?: boolean
  enrollments?: {
    payment_status: string
    course_id: string | null
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

interface ReferralStats {
  source: string
  count: number
}

interface LeadStats {
  source: string
  count: number
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
  const [referralStats, setReferralStats] = useState<ReferralStats[]>([])
  const [leadStats, setLeadStats] = useState<LeadStats[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchAnnouncements()
    if (activeTab === 'analytics') {
      fetchReferralStats()
    }
  }, [activeTab])

  const fetchReferralStats = async () => {
    try {
      // Fetch user referral sources
      const { data: profileStats, error: profileError } = await supabase
        .from('profiles')
        .select('referral_source')
        .not('referral_source', 'is', null)

      if (profileError) throw profileError

      // Fetch lead referral sources
      const { data: leadStats, error: leadError } = await supabase
        .from('leads')
        .select('referral_source')
        .not('referral_source', 'is', null)

      if (leadError) throw leadError

      // Aggregate profile stats
      const profileCounts: { [key: string]: number } = {}
      profileStats?.forEach(profile => {
        if (profile.referral_source) {
          profileCounts[profile.referral_source] = (profileCounts[profile.referral_source] || 0) + 1
        }
      })

      // Aggregate lead stats
      const leadCounts: { [key: string]: number } = {}
      leadStats?.forEach(lead => {
        if (lead.referral_source) {
          leadCounts[lead.referral_source] = (leadCounts[lead.referral_source] || 0) + 1
        }
      })

      // Convert to arrays
      const referralStatsArray = Object.entries(profileCounts).map(([source, count]) => ({
        source,
        count
      }))

      const leadStatsArray = Object.entries(leadCounts).map(([source, count]) => ({
        source,
        count
      }))

      setReferralStats(referralStatsArray)
      setLeadStats(leadStatsArray)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      toast({
        title: "Error",
        description: "Failed to fetch referral statistics",
        variant: "destructive"
      })
    }
  }

  const fetchUsers = async () => {
    try {
      // Get profiles with basic enrollments (no course join since foreign key doesn't exist)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          enrollments (
            payment_status,
            course_id
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

      // Get verification status for all users
      const userIds = profilesData?.map(profile => profile.id) || []
      let verificationStatus: Record<string, boolean> = {}
      
      if (userIds.length > 0) {
        try {
          const response = await supabase.functions.invoke('get-user-verification-status', {
            body: { userIds }
          })
          
          if (response.data?.verificationStatus) {
            verificationStatus = response.data.verificationStatus
          }
        } catch (verificationError) {
          console.error('Error fetching verification status:', verificationError)
          // Continue without verification status
        }
      }

      // Combine the data
      const usersWithEnrollments = profilesData?.map(profile => {
        const userOrderEnrollments = orderEnrollments?.filter(order => 
          order.user_id === profile.id || order.user_email === profile.email
        ) || []
        
        return {
          ...profile,
          email_verified: verificationStatus[profile.id] || false,
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone and will remove all associated data including enrollments, orders, and certificates.`
    )
    
    if (!confirmed) return
    
    setDeletingUserId(userId)
    
    try {
      // Delete user profile (this will cascade delete due to foreign key constraints)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId))
      toast({
        title: "Success",
        description: "User deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingUserId(null)
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
              variant={activeTab === 'weeks' ? 'default' : 'outline'}
              onClick={() => setActiveTab('weeks')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Course Weeks
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
              variant={activeTab === 'pricing' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Pricing & Coupons
            </Button>
            <Button
              variant={activeTab === 'interests' ? 'default' : 'outline'}
              onClick={() => setActiveTab('interests')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              International Interests
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
              variant={activeTab === 'analytics' ? 'default' : 'outline'}
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
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
          {activeTab === 'weeks' && (
            <CourseWeeksManagement />
          )}
          {activeTab === 'content' && (
            <ContentManagement />
          )}
          {activeTab === 'certificates' && (
            <CertificatesManagement />
          )}
          {activeTab === 'pricing' && (
            <PricingCouponManagement />
          )}
          {activeTab === 'interests' && (
            <InternationalInterestManagement />
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

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Referral Analytics */}
              <AnimatedCard>
                <AnimatedCardHeader>
                  <AnimatedCardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Referral Source Analytics</span>
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* User Signups by Source */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">User Signups by Source</h3>
                      {referralStats.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No referral data available</p>
                      ) : (
                        <div className="space-y-3">
                          {referralStats
                            .sort((a, b) => b.count - a.count)
                            .map((stat) => (
                            <div key={stat.source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <span className="font-medium capitalize">{stat.source.replace('_', ' ')}</span>
                              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                                {stat.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact Form Leads by Source */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Form Leads by Source</h3>
                      {leadStats.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No lead data available</p>
                      ) : (
                        <div className="space-y-3">
                          {leadStats
                            .sort((a, b) => b.count - a.count)
                            .map((stat) => (
                            <div key={stat.source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <span className="font-medium capitalize">{stat.source.replace('_', ' ')}</span>
                              <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                                {stat.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Combined Statistics */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Total Traffic Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {referralStats.reduce((sum, stat) => sum + stat.count, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Signups</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg">
                        <div className="text-2xl font-bold text-secondary-foreground">
                          {leadStats.reduce((sum, stat) => sum + stat.count, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Leads</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-100/50 to-green-50/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {users.filter(u => u.order_enrollments?.some(e => e.status === 'paid')).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Paid Enrollments</div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-100/50 to-blue-50/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {users.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </div>
                    </div>
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </div>
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
                         <th className="text-left p-2">Verified</th>
                         <th className="text-left p-2">Role</th>
                         <th className="text-left p-2">Source</th>
                         <th className="text-left p-2">Enrollment Status</th>
                         <th className="text-left p-2">Course Type</th>
                         <th className="text-left p-2">Amount Paid</th>
                         <th className="text-left p-2">Joined</th>
                         <th className="text-left p-2">Actions</th>
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
                        
                        // Since enrollments don't have course relationship, just use order enrollments
                        
                        const paidOrder = user.order_enrollments?.find(e => e.status === 'paid')
                        const courseType = paidOrder?.course_type || 'N/A'
                        const courseTitle = paidOrder?.courses?.title || courseType
                        const amountPaid = paidOrder ? formatCurrency(paidOrder.amount / 100, paidOrder.currency) : 'N/A'
                        
                         return (
                           <tr key={user.id} className="border-b hover:bg-muted/50">
                             <td className="p-2">{user.name}</td>
                             <td className="p-2">{user.email}</td>
                             <td className="p-2">
                               <span className={`px-2 py-1 rounded text-xs ${
                                 user.email_verified 
                                   ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                   : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                               }`}>
                                 {user.email_verified ? 'Verified' : 'Unverified'}
                               </span>
                             </td>
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
                                  user.referral_source 
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {user.referral_source ? user.referral_source.replace('_', ' ') : 'Direct'}
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
                             <td className="p-2">
                               <button
                                 onClick={() => handleDeleteUser(user.id, user.name)}
                                 className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                 disabled={user.role === 'admin' || deletingUserId === user.id}
                                 title={user.role === 'admin' ? 'Cannot delete admin users' : `Delete ${user.name}`}
                               >
                                 {deletingUserId === user.id ? '⏳ Deleting...' : user.role === 'admin' ? '🔒' : '🗑️ Delete'}
                               </button>
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
