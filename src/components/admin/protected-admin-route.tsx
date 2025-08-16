import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        navigate("/login")
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data.role === 'admin') {
          setIsAdmin(true)
        } else {
          navigate("/")
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
        navigate("/")
      } finally {
        setChecking(false)
      }
    }

    if (!loading) {
      checkAdminRole()
    }
  }, [user, loading, navigate])

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}