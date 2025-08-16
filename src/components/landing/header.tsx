import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useAdminRole } from "@/hooks/use-admin-role"

export function Header() {
  const auth = useAuth()
  const { user, loading } = auth
  const { isAdmin, loading: adminLoading } = useAdminRole()
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-card border-b border-white/20 backdrop-blur-xl' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="text-2xl font-bold text-gradient cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => navigate("/")}
          >
            LearnLaunch
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button 
                onClick={() => navigate(isDashboard ? '/dashboard' : '/')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {isDashboard ? 'Dashboard' : 'Home'}
              </button>
              {(location.pathname === '/' || location.pathname === '/dashboard') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => navigate('/courses')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Course
              </button>
              {location.pathname === '/courses' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => navigate('/pricing')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Pricing
              </button>
              {location.pathname === '/pricing' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </div>
            {user && !adminLoading && isAdmin && (
              <div className="relative">
                <button 
                  onClick={() => navigate('/admin')}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Admin
                </button>
                {location.pathname === '/admin' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                )}
              </div>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="w-20 h-8 animate-pulse bg-muted/50 rounded"></div>
            ) : user ? (
              <UserProfileDropdown />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button size="sm" className="button-3d hover-glow" onClick={() => navigate("/signup")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
