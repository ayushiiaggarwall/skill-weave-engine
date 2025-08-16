import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"

export function useAdminRole() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('Checking admin role for user:', user?.id)
      if (!user) {
        console.log('No user, setting isAdmin to false')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        console.log('Profile data:', data, 'Error:', error)
        if (error) throw error
        const adminStatus = data.role === 'admin'
        console.log('Setting isAdmin to:', adminStatus)
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin role:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminRole()
  }, [user])

  return { isAdmin, loading }
}