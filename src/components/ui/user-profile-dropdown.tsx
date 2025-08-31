
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { useNavigate } from "react-router-dom"
import { LogOut, Settings, BookOpen, GraduationCap, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function UserProfileDropdown() {
  const { user, profile, signOut } = useAuth()
  const enrollmentStatus = useEnrollmentStatus()
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

  const showEnrolledOptions = enrollmentStatus.isEnrolled && !enrollmentStatus.loading

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center hover:bg-primary/90 transition-colors overflow-hidden"
        aria-label="User profile menu"
      >
        {profile?.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials()
        )}
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
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {profile?.role === 'student' ? 'learner' : (profile?.role || 'learner')}
                </span>
                {showEnrolledOptions && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                    enrolled
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/dashboard')
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              {/* Show enrolled user options only if enrolled */}
              {showEnrolledOptions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2"
                    onClick={() => {
                      setIsOpen(false)
                      navigate('/my-courses')
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    My Courses
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2"
                    onClick={() => {
                      setIsOpen(false)
                      navigate('/learner')
                    }}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Learner Hub
                  </Button>
                </>
              )}
              
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
