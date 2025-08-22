import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface CourseContent {
  id: string
  title: string
  description: string | null
  content_type: 'video' | 'document' | 'link' | 'assignment'
  content_url: string | null
  file_name?: string | null
  week_number: number
  is_visible: boolean
  created_at: string
}

const ContentManagement: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState<CourseContent[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  const [newContent, setNewContent] = useState<{
    title: string
    description: string
    content_type: 'video' | 'document' | 'link' | 'assignment'
    content_url: string
    week_number: number
    is_visible: boolean
  }>({
    title: '',
    description: '',
    content_type: 'document',
    content_url: '',
    week_number: 1,
    is_visible: true
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .order('week_number', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      setContent((data || []) as CourseContent[])
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch course content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUploading(true)
    try {
      const { error } = await supabase
        .from('course_content')
        .insert([
          {
            ...newContent,
            course_id: '00000000-0000-0000-0000-000000000001', // Static course ID for now
            created_by: user.id
          }
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Content added successfully",
      })

      setNewContent({
        title: '',
        description: '',
        content_type: 'document',
        content_url: '',
        week_number: 1,
        is_visible: true
      })

      fetchContent()
    } catch (error) {
      console.error('Error adding content:', error)
      toast({
        title: "Error",
        description: "Failed to add content",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('course_content')
        .update({ is_visible: !currentVisibility })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Content ${!currentVisibility ? 'shown' : 'hidden'} successfully`,
      })

      fetchContent()
    } catch (error) {
      console.error('Error updating visibility:', error)
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      })
    }
  }

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_content')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Content deleted successfully",
      })

      fetchContent()
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading content...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Course Content</CardTitle>
          <CardDescription>Upload materials that learners will see in their dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={newContent.title}
                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter content title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Week Number</label>
                <Select
                  value={newContent.week_number.toString()}
                  onValueChange={(value: string) => setNewContent(prev => ({ ...prev, week_number: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newContent.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter content description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <Select
                  value={newContent.content_type}
                  onValueChange={(value: 'video' | 'document' | 'link' | 'assignment') => 
                    setNewContent(prev => ({ ...prev, content_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content URL</label>
                <Input
                  value={newContent.content_url}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content_url: e.target.value }))}
                  placeholder="Enter URL or file path"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={uploading} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {uploading ? 'Adding...' : 'Add Content'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Content</CardTitle>
          <CardDescription>Manage course materials by week</CardDescription>
        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No content added yet</p>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(week => {
                const weekContent = content.filter(item => item.week_number === week)
                return (
                  <div key={week} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Week {week}</h4>
                    {weekContent.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No content for this week</p>
                    ) : (
                      <div className="space-y-2">
                        {weekContent.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.title}</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {item.content_type}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleVisibility(item.id, item.is_visible)}
                              >
                                {item.is_visible ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContent(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContentManagement