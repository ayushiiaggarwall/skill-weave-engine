import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, DollarSign, Clock, Bell, Trash2, Upload, Award } from "lucide-react"
import ContentManagement from './content-management'
import CertificatesManagement from './certificates-management'
interface PricingSettings {
  id: string
  usd_early_bird: number
  usd_regular: number
  usd_mrp: number
  inr_early_bird: number
  inr_regular: number
  inr_mrp: number
  early_bird_duration_hours: number
  is_early_bird_active: boolean
  early_bird_end_time: string | null
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface Announcement {
  id: string
  title: string
  body: string
  created_at: string
  cohort_id?: string | null
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pricing')
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPricingSettings()
    fetchUsers()
    fetchAnnouncements()
  }, [])

  const fetchPricingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('*')
        .single()

      if (error) throw error
      setPricingSettings(data)
    } catch (error) {
      console.error('Error fetching pricing settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch pricing settings",
        variant: "destructive"
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
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

  const updatePricingSettings = async (updates: Partial<PricingSettings>) => {
    if (!pricingSettings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .update(updates)
        .eq('id', pricingSettings.id)

      if (error) throw error

      setPricingSettings({ ...pricingSettings, ...updates })
      toast({
        title: "Success",
        description: "Pricing settings updated successfully"
      })
    } catch (error) {
      console.error('Error updating pricing settings:', error)
      toast({
        title: "Error",
        description: "Failed to update pricing settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const activateEarlyBird = async (durationHours: number) => {
    const endTime = new Date()
    endTime.setHours(endTime.getHours() + durationHours)

    await updatePricingSettings({
      is_early_bird_active: true,
      early_bird_duration_hours: durationHours,
      early_bird_end_time: endTime.toISOString()
    })
  }

  const deactivateEarlyBird = async () => {
    await updatePricingSettings({
      is_early_bird_active: false,
      early_bird_end_time: null
    })
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
      <div className="min-h-screen bg-background py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage course pricing, content, and view users</p>
        </div>

{/* Tab Navigation */}
<div className="flex justify-center space-x-4 mb-8">
  <Button
    variant={activeTab === 'pricing' ? 'default' : 'outline'}
    onClick={() => setActiveTab('pricing')}
    className="flex items-center gap-2"
  >
    <DollarSign className="h-4 w-4" />
    Pricing
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

{activeTab === 'content' && (
  <ContentManagement />
)}
{activeTab === 'certificates' && (
  <CertificatesManagement />
)}

        {activeTab === 'pricing' && (
        <AnimatedCard>
          <AnimatedCardHeader>
            <AnimatedCardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Pricing Management</span>
            </AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-6">
            {pricingSettings && (
              <>
                {/* Early Bird Controls */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Early Bird Offer</span>
                  </h3>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      pricingSettings.is_early_bird_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {pricingSettings.is_early_bird_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => activateEarlyBird(4)}
                      disabled={saving}
                      size="sm"
                    >
                      Activate 4 Hours
                    </Button>
                    <Button 
                      onClick={() => activateEarlyBird(24)}
                      disabled={saving}
                      size="sm"
                    >
                      Activate 24 Hours
                    </Button>
                    <Button 
                      onClick={() => activateEarlyBird(168)}
                      disabled={saving}
                      size="sm"
                    >
                      Activate 7 Days
                    </Button>
                    <Button 
                      onClick={deactivateEarlyBird}
                      disabled={saving}
                      variant="destructive"
                      size="sm"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>

                {/* Price Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* USD Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">USD Pricing</h3>
                    <div className="space-y-2">
                      <label className="text-sm">Early Bird Price ($)</label>
                      <Input
                        type="number"
                        value={pricingSettings.usd_early_bird}
                        onChange={(e) => updatePricingSettings({ usd_early_bird: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Regular Price ($)</label>
                      <Input
                        type="number"
                        value={pricingSettings.usd_regular}
                        onChange={(e) => updatePricingSettings({ usd_regular: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">MRP ($)</label>
                      <Input
                        type="number"
                        value={pricingSettings.usd_mrp}
                        onChange={(e) => updatePricingSettings({ usd_mrp: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* INR Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">INR Pricing</h3>
                    <div className="space-y-2">
                      <label className="text-sm">Early Bird Price (₹)</label>
                      <Input
                        type="number"
                        value={pricingSettings.inr_early_bird}
                        onChange={(e) => updatePricingSettings({ inr_early_bird: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Regular Price (₹)</label>
                      <Input
                        type="number"
                        value={pricingSettings.inr_regular}
                        onChange={(e) => updatePricingSettings({ inr_regular: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">MRP (₹)</label>
                      <Input
                        type="number"
                        value={pricingSettings.inr_mrp}
                        onChange={(e) => updatePricingSettings({ inr_mrp: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </AnimatedCardContent>
        </AnimatedCard>
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
                <Button onClick={createAnnouncement} disabled={saving}>
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
                    <th className="text-left p-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
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
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
        )}
      </div>
    </div>
  )
}