import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

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
            <a 
              href="#course" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Course
            </a>
            <a 
              href="#syllabus" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Syllabus
            </a>
            <a 
              href="#pricing" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Pricing
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" className="button-3d hover-glow" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
