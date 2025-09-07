import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown"
import { TextLogo } from "@/components/ui/text-logo"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useAdminRole } from "@/hooks/use-admin-role"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { Menu, X } from "lucide-react"

export function Header() {
  const auth = useAuth()
  const { user, loading } = auth
  const { isAdmin, loading: adminLoading } = useAdminRole()
  const enrollmentStatus = useEnrollmentStatus()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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
            className="cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => navigate("/")}
          >
            <TextLogo />
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {user ? 'Dashboard' : 'Home'}
              </button>
              {(location.pathname === '/' || location.pathname === '/dashboard') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </div>
            {/* Conditional Navigation: Course vs My Courses */}
            {user && enrollmentStatus.isEnrolled ? (
              <div className="relative">
                <button 
                  onClick={() => navigate('/my-courses')}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  My Courses
                </button>
                {location.pathname === '/my-courses' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                )}
              </div>
            ) : (
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
            )}
            
            {/* Conditional Navigation: Pricing vs Learner */}
            {user && enrollmentStatus.isEnrolled ? (
              <div className="relative group">
                <button 
                  onClick={() => navigate('/learner')}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Learner
                </button>
                {location.pathname === '/learner' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                )}
              </div>
            ) : (
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
            )}
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
             <Button 
               variant="ghost" 
               onClick={() => {
                 // @ts-ignore - Calendly is loaded via script tag
                 if (window.Calendly) {
                   // @ts-ignore
                   window.Calendly.initPopupWidget({ url: 'https://calendly.com/hello-ayushiaggarwal' });
                 } else {
                   window.open('https://calendly.com/hello-ayushiaggarwal', '_blank');
                 }
               }}
             >
               Book a Call
             </Button>
           </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/20 mt-4 pt-4 bg-background/95 backdrop-blur-xl rounded-lg"
            >
              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    navigate(user ? '/dashboard' : '/')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                    (location.pathname === '/' || location.pathname === '/dashboard') 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  {user ? 'Dashboard' : 'Home'}
                </button>

                {/* Conditional Navigation: Course vs My Courses */}
                {user && enrollmentStatus.isEnrolled ? (
                  <button 
                    onClick={() => {
                      navigate('/my-courses')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                      location.pathname === '/my-courses' 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    My Courses
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      navigate('/courses')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                      location.pathname === '/courses' 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    Course
                  </button>
                )}

                {/* Conditional Navigation: Pricing vs Learner */}
                {user && enrollmentStatus.isEnrolled ? (
                  <button 
                    onClick={() => {
                      navigate('/learner')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                      location.pathname === '/learner' 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    Learner
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      navigate('/pricing')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                      location.pathname === '/pricing' 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    Pricing
                  </button>
                )}

                {user && !adminLoading && isAdmin && (
                  <button 
                    onClick={() => {
                      navigate('/admin')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`text-left px-4 py-2 rounded-lg transition-colors font-medium ${
                      location.pathname === '/admin' 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    Admin
                  </button>
                )}

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-white/20">
                  {loading ? (
                    <div className="w-full h-10 animate-pulse bg-muted/50 rounded"></div>
                  ) : user ? (
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          navigate('/profile')
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg transition-colors font-medium text-foreground hover:bg-muted/50"
                      >
                        Profile Settings
                      </button>
                      <Button 
                        variant="outline" 
                        className="w-full bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                        onClick={() => {
                          auth.signOut()
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => {
                          navigate("/login")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="w-full button-3d hover-glow"
                        onClick={() => {
                          navigate("/signup")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
