import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Calendar, Users } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface Workshop {
  id: string
  title: string
  slug: string
  description: string | null
  date_time: string
  is_active: boolean
  created_at: string
}

interface Registration {
  id: string
  workshop_id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  role: string | null
  how_heard: string | null
  created_at: string
}

interface NewWorkshopForm {
  title: string
  slug: string
  description: string
  date_time: string
  is_active: boolean
}

export function WorkshopManagement() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newWorkshop, setNewWorkshop] = useState<NewWorkshopForm>({
    title: '',
    slug: '',
    description: '',
    date_time: '',
    is_active: true
  })
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkshops()
    fetchRegistrations()
  }, [])

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error('Error fetching workshops:', error)
      toast({
        title: "Error",
        description: "Failed to fetch workshops",
        variant: "destructive"
      })
    }
  }

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('workshop_registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setNewWorkshop(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const createWorkshop = async () => {
    if (!user?.id || !newWorkshop.title || !newWorkshop.date_time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('workshops')
        .insert({
          ...newWorkshop,
          created_by: user.id
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Workshop created successfully"
      })

      setNewWorkshop({
        title: '',
        slug: '',
        description: '',
        date_time: '',
        is_active: true
      })
      setShowNewForm(false)
      fetchWorkshops()

    } catch (error) {
      console.error('Error creating workshop:', error)
      toast({
        title: "Error",
        description: "Failed to create workshop",
        variant: "destructive"
      })
    }
  }

  const deleteWorkshop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workshop? This will also delete all registrations.')) {
      return
    }

    try {
      // First delete registrations
      await supabase
        .from('workshop_registrations')
        .delete()
        .eq('workshop_id', id)

      // Then delete workshop
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Workshop deleted successfully"
      })

      fetchWorkshops()
      fetchRegistrations()

    } catch (error) {
      console.error('Error deleting workshop:', error)
      toast({
        title: "Error",
        description: "Failed to delete workshop",
        variant: "destructive"
      })
    }
  }

  const toggleWorkshopStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Workshop ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      })

      fetchWorkshops()

    } catch (error) {
      console.error('Error updating workshop:', error)
      toast({
        title: "Error",
        description: "Failed to update workshop status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workshop Management</h2>
          <p className="text-muted-foreground">Manage workshops and view registrations</p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workshop
        </Button>
      </div>

      {/* New Workshop Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workshop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={newWorkshop.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Workshop title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <Input
                value={newWorkshop.slug}
                onChange={(e) => setNewWorkshop(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="workshop-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newWorkshop.description}
                onChange={(e) => setNewWorkshop(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Workshop description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date & Time *</label>
              <Input
                type="datetime-local"
                value={newWorkshop.date_time}
                onChange={(e) => setNewWorkshop(prev => ({ ...prev, date_time: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={newWorkshop.is_active}
                onChange={(e) => setNewWorkshop(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <label htmlFor="is_active" className="text-sm">Active</label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createWorkshop}>Create Workshop</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workshops List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Workshops ({workshops.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workshops.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No workshops created yet</p>
          ) : (
            <div className="space-y-4">
              {workshops.map((workshop) => (
                <div key={workshop.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{workshop.title}</h3>
                      <Badge variant={workshop.is_active ? "default" : "secondary"}>
                        {workshop.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Slug: /{workshop.slug}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📅 {new Date(workshop.date_time).toLocaleString()}
                    </p>
                    {workshop.description && (
                      <p className="text-sm text-muted-foreground mt-2">{workshop.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWorkshopStatus(workshop.id, workshop.is_active)}
                    >
                      {workshop.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteWorkshop(workshop.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Registrations ({registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No registrations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Workshop</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">City</th>
                    <th className="text-left p-2">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="border-b">
                      <td className="p-2 font-medium">{registration.name}</td>
                      <td className="p-2">{registration.email}</td>
                      <td className="p-2">
                        {workshops.find(w => w.id === registration.workshop_id)?.title || 'Unknown'}
                      </td>
                      <td className="p-2">{registration.role || '-'}</td>
                      <td className="p-2">{registration.city || '-'}</td>
                      <td className="p-2">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}