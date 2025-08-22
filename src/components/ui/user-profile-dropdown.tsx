import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function UserProfileDropdown() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const getInitials = () => {
    if (profile?.name) {
      const names = profile.name.split(' ')
      return names.map(name => name.charAt(0).toUpperCase()).join('')
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="User profile menu"
      >
        {getInitials()}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50"
          >
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium">{profile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {profile?.role === 'student' ? 'learner' : (profile?.role || 'learner')}
              </span>
            </div>
            
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/profile')
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => {
                  setIsOpen(false)
                  handleSignOut()
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}