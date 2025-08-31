
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserProfileDropdown } from '@/components/ui/user-profile-dropdown'
import { useAuth } from '@/contexts/auth-context'
import { useEnrollmentStatus } from '@/hooks/use-enrollment-status'
import { Menu, X, BookOpen, GraduationCap, Phone, DollarSign, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { user, loading } = useAuth()
  const enrollmentStatus = useEnrollmentStatus()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  // Navigation items for enrolled users only
  const enrolledUserNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: User },
    { path: '/my-courses', label: 'My Courses', icon: BookOpen },
    { path: '/learner', label: 'Learner Hub', icon: GraduationCap },
  ]

  // Navigation items for all authenticated users
  const publicNavItems = [
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/contact', label: 'Contact', icon: Phone },
  ]

  // Show enrolled user navigation only if user is enrolled
  const showEnrolledNavigation = user && enrollmentStatus.isEnrolled && !enrollmentStatus.loading

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
          >
            EduPlatform
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Public navigation items */}
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {/* Enrolled user navigation items */}
            {showEnrolledNavigation && enrolledUserNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserProfileDropdown />
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-4 pb-4 border-t border-border pt-4"
            >
              <nav className="flex flex-col space-y-3">
                {/* Public navigation items for mobile */}
                {publicNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-accent ${
                      isActive(item.path) ? 'bg-accent text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}

                {/* Enrolled user navigation items for mobile */}
                {showEnrolledNavigation && enrolledUserNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-accent ${
                      isActive(item.path) ? 'bg-accent text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}

                {/* Mobile Auth Actions */}
                {!user && (
                  <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => handleNavigation('/login')} className="justify-start">
                      Login
                    </Button>
                    <Button onClick={() => handleNavigation('/signup')} className="justify-start">
                      Sign Up
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
