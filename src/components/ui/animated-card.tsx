import { useEffect, useRef, forwardRef } from 'react'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number
  hoverScale?: number
  scrollThreshold?: number
  animationType?: 'fadeUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate'
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    children, 
    className,
    delay = 0, 
    hoverScale = 1.02,
    scrollThreshold = 0.2,
    animationType = 'fadeUp',
    ...props 
  }, _ref) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
      const element = cardRef.current
      if (!element) return

      // Set initial state based on animation type
      const getInitialState = () => {
        switch (animationType) {
          case 'slideLeft':
            return { opacity: 0, translateX: -50 }
          case 'slideRight':
            return { opacity: 0, translateX: 50 }
          case 'scale':
            return { opacity: 0, scale: 0.8 }
          case 'rotate':
            return { opacity: 0, rotateY: 30, scale: 0.9 }
          default: // fadeUp
            return { opacity: 0, translateY: 30 }
        }
      }

      // Apply initial state
      const initialState = getInitialState()
      Object.assign(element.style, {
        opacity: String(initialState.opacity),
        transform: `translateX(${initialState.translateX || 0}px) translateY(${initialState.translateY || 0}px) scale(${initialState.scale || 1}) rotateY(${initialState.rotateY || 0}deg)`
      })

      // Intersection Observer for scroll trigger
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.current) {
              hasAnimated.current = true
              
              // Entrance animation
              animate(element, {
                opacity: [initialState.opacity, 1],
                translateX: [initialState.translateX || 0, 0],
                translateY: [initialState.translateY || 0, 0],
                scale: [initialState.scale || 1, 1],
                rotateY: [initialState.rotateY || 0, 0],
                duration: 800,
                delay: delay,
                ease: 'outElastic(1, .8)',
              })

              // Subtle floating animation after entrance
              setTimeout(() => {
                animate(element, {
                  translateY: [-2, 2],
                  duration: 4000,
                  ease: 'inOut(3)',
                  loop: true,
                  alternate: true,
                })
              }, 800 + delay)
            }
          })
        },
        { threshold: scrollThreshold }
      )

      observer.observe(element)

      // Hover effects
      const handleMouseEnter = () => {
        animate(element, {
          scale: hoverScale,
          rotateY: animationType === 'rotate' ? 5 : 0,
          rotateX: animationType === 'rotate' ? 2 : 0,
          duration: 300,
          ease: 'out(2)',
        })
      }

      const handleMouseLeave = () => {
        animate(element, {
          scale: 1,
          rotateY: 0,
          rotateX: 0,
          duration: 300,
          ease: 'out(2)',
        })
      }

      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        observer.disconnect()
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
    }, [delay, hoverScale, scrollThreshold, animationType])

    return (
      <div
        ref={cardRef}
        className={cn(
          "transform-gpu rounded-lg border border-border bg-card text-card-foreground shadow-sm",
          className
        )}
        style={{ transformStyle: 'preserve-3d' }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

// Enhanced versions of the existing card components
const AnimatedCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
AnimatedCardHeader.displayName = "AnimatedCardHeader"

const AnimatedCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
AnimatedCardTitle.displayName = "AnimatedCardTitle"

const AnimatedCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AnimatedCardDescription.displayName = "AnimatedCardDescription"

const AnimatedCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
AnimatedCardContent.displayName = "AnimatedCardContent"

const AnimatedCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
AnimatedCardFooter.displayName = "AnimatedCardFooter"

export { 
  AnimatedCard, 
  AnimatedCardHeader, 
  AnimatedCardFooter, 
  AnimatedCardTitle, 
  AnimatedCardDescription, 
  AnimatedCardContent 
}
