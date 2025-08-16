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
      className="fixed pointer-events-none z-30"
      style={{
        left: mousePosition.x - 300,
        top: mousePosition.y - 300,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.9,
      }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 25,
      }}
    >
      {/* Outer spread glow - very subtle */}
      <div className="w-[600px] h-[600px] relative">
        {/* Large spread glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-[0.08]"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.06) 0%, 
              hsl(var(--accent) / 0.04) 25%, 
              hsl(var(--primary) / 0.02) 50%,
              transparent 85%
            )`,
            filter: 'blur(80px)',
          }}
        />
        
        {/* Medium glow */}
        <div 
          className="absolute inset-20 rounded-full opacity-[0.12]"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.08) 0%, 
              hsl(var(--accent) / 0.06) 35%, 
              transparent 75%
            )`,
            filter: 'blur(60px)',
          }}
        />
        
        {/* Inner subtle glow */}
        <div 
          className="absolute inset-32 rounded-full opacity-[0.15]"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.1) 0%, 
              hsl(var(--accent) / 0.08) 40%,
              transparent 70%
            )`,
            filter: 'blur(40px)',
          }}
        />

        {/* Core very subtle glow */}
        <div 
          className="absolute inset-48 rounded-full opacity-[0.2]"
          style={{
            background: `radial-gradient(circle, 
              hsl(var(--primary) / 0.12) 0%, 
              transparent 60%
            )`,
            filter: 'blur(20px)',
          }}
        />
      </div>
    </motion.div>
  )
}
