import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <motion.div
      className="fixed pointer-events-none z-50 mix-blend-difference"
      style={{
        left: mousePosition.x - 200,
        top: mousePosition.y - 200,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
    >
      {/* Main glow */}
      <div className="w-96 h-96 relative">
        {/* Primary glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.15) 0%, 
              hsl(var(--accent) / 0.1) 30%, 
              transparent 70%
            )`,
            filter: 'blur(40px)',
          }}
        />
        
        {/* Secondary smaller glow */}
        <div 
          className="absolute inset-20 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.2) 0%, 
              hsl(var(--accent) / 0.15) 40%, 
              transparent 80%
            )`,
            filter: 'blur(20px)',
          }}
        />
        
        {/* Core glow */}
        <div 
          className="absolute inset-32 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.3) 0%, 
              transparent 60%
            )`,
            filter: 'blur(10px)',
          }}
        />
      </div>
    </motion.div>
  )
}
