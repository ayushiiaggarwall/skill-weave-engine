import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, Heart, Mail, Calendar, MessageSquare, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InterestEntry {
  id: string
  user_id: string | null
  email: string
  name: string | null
  course_id: string | null
  course_type: string | null
  message: string | null
  created_at: string
}

export function InternationalInterestManagement() {
  const [interests, setInterests] = useState<InterestEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchInterests()
  }, [])

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('international_interest')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInterests(data || [])
    } catch (error) {
      console.error('Error fetching interests:', error)
      toast({
        title: "Error",
        description: "Failed to load international interests",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportEmails = () => {
    const emails = interests.map(interest => interest.email).join(', ')
    navigator.clipboard.writeText(emails)
    toast({
      title: "Emails Copied!",
      description: "All email addresses have been copied to your clipboard.",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">Loading interests...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              International Payment Interests
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {interests.length} interested users
              </Badge>
              {interests.length > 0 && (
                <Button onClick={exportEmails} variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Export Emails
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {interests.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No international payment interests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interests.map((interest) => (
                <Card key={interest.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{interest.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {interest.course_type || 'course'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{interest.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(interest.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {interest.message && (
                          <div className="flex items-start gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <p className="text-muted-foreground italic">{interest.message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}