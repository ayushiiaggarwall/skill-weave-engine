import { useEffect, useRef, useState, forwardRef } from 'react'
import { animate } from 'animejs'
import { cn } from "@/lib/utils"

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  animationType?: 'glow' | 'float' | 'magnetic' | 'ripple'
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, type, animationType = 'glow', ...props }, _ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const rippleRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
      const input = inputRef.current
      const container = containerRef.current
      const ripple = rippleRef.current
      if (!input || !container) return

      // Initial entrance animation
      animate(container, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 600,
        ease: 'out(3)',
      })

      const handleFocus = () => {
        setIsFocused(true)
        
        switch (animationType) {
          case 'glow':
            animate(container, {
              scale: [1, 1.02, 1],
              duration: 300,
              ease: 'out(2)',
            })
            break
          case 'float':
            animate(container, {
              translateY: [-2, 0],
              scale: [1, 1.01],
              duration: 300,
              ease: 'outElastic(1, .8)',
            })
            break
          case 'magnetic':
            animate(container, {
              scale: 1.01,
              duration: 300,
              ease: 'out(2)',
            })
            break
          case 'ripple':
            if (ripple) {
              animate(ripple, {
                scale: [0, 3],
                opacity: [0.3, 0],
                duration: 600,
                ease: 'out(3)',
              })
            }
            break
        }
      }

      const handleBlur = () => {
        setIsFocused(false)
        
        animate(container, {
          scale: 1,
          translateY: 0,
          duration: 300,
          ease: 'out(2)',
        })
      }

      const handleMouseEnter = () => {
        if (!isFocused && animationType === 'float') {
          animate(container, {
            translateY: [-1, 0],
            duration: 200,
            ease: 'out(2)',
          })
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (animationType === 'magnetic' && !isFocused) {
          const rect = container.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const deltaX = (e.clientX - centerX) * 0.02
          const deltaY = (e.clientY - centerY) * 0.02
          
          animate(container, {
            translateX: deltaX,
            translateY: deltaY,
            duration: 200,
            ease: 'out(2)',
          })
        }
      }

      const handleMouseLeave = () => {
        if (animationType === 'magnetic') {
          animate(container, {
            translateX: 0,
            translateY: 0,
            duration: 300,
            ease: 'out(2)',
          })
        }
      }

      input.addEventListener('focus', handleFocus)
      input.addEventListener('blur', handleBlur)
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        input.removeEventListener('focus', handleFocus)
        input.removeEventListener('blur', handleBlur)
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }, [animationType, isFocused])

    return (
      <div ref={containerRef} className="relative transform-gpu opacity-0">
        {/* Ripple effect */}
        {animationType === 'ripple' && (
          <div
            ref={rippleRef}
            className="absolute inset-0 rounded-md bg-primary/10 pointer-events-none"
            style={{ transform: 'scale(0)' }}
          />
        )}
        
        {/* Glow effect */}
        {animationType === 'glow' && isFocused && (
          <div className="absolute inset-0 rounded-md bg-primary/20 blur-sm animate-pulse-glow" />
        )}
        
        <input
          type={type}
          ref={inputRef}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative z-10 transition-all duration-300",
            {
              'focus:border-primary/50 focus:shadow-lg focus:shadow-primary/20': animationType === 'glow',
              'hover:border-primary/30': animationType !== 'ripple',
            },
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }
