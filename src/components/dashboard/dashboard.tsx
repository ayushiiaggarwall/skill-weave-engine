import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, LogOut } from "lucide-react"

export function Dashboard() {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Welcome to Your Dashboard</h1>
              <p className="text-muted-foreground">
                {profile?.name ? `Hello, ${profile.name}!` : 'Hello there!'}
              </p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{profile?.name || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {profile?.role || 'student'}
                  </span>
                </div>
                {profile?.created_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  View Courses
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Check Assignments
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  View Progress
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Resources
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="glass-card mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Welcome to LearnLaunch!</h2>
              <p className="text-muted-foreground">
                You're all set up and ready to start your no-code journey. 
                Your profile has been created and you can now access all course materials.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
