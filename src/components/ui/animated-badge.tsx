import { useEffect, useRef, forwardRef } from 'react'
import { animate } from 'animejs'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const animatedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transform-gpu",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      animation: {
        none: "",
        pulse: "",
        bounce: "",
        glow: "",
        shake: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animation: "pulse",
    },
  }
)

export interface AnimatedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedBadgeVariants> {
  delay?: number
}

const AnimatedBadge = forwardRef<HTMLDivElement, AnimatedBadgeProps>(
  ({ className, variant, animation = "pulse", delay = 0, children, ...props }, _ref) => {
    const badgeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const badge = badgeRef.current
      if (!badge) return

      // Initial entrance animation
      animate(badge, {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        delay,
        ease: 'outElastic(1, .8)',
      })

      // Continuous animation based on type
      let continuousAnimation: any
      
      const startContinuousAnimation = () => {
        switch (animation) {
          case 'pulse':
            continuousAnimation = animate(badge, {
              scale: [1, 1.05, 1],
              duration: 2000,
              ease: 'inOut(3)',
              loop: true,
            })
            break
          case 'bounce':
            continuousAnimation = animate(badge, {
              translateY: [-2, 0],
              duration: 1500,
              ease: 'outBounce',
              loop: true,
              alternate: true,
            })
            break
          case 'glow':
            continuousAnimation = animate(badge, {
              boxShadow: [
                '0 0 5px rgba(var(--primary), 0.3)',
                '0 0 20px rgba(var(--primary), 0.6)',
                '0 0 5px rgba(var(--primary), 0.3)'
              ],
              duration: 2000,
              ease: 'inOut(3)',
              loop: true,
            })
            break
          case 'shake':
            continuousAnimation = animate(badge, {
              translateX: [-1, 1, -1, 1, 0],
              duration: 500,
              ease: 'out(2)',
              loop: true,
              delay: 3000, // Shake every 3 seconds
            })
            break
        }
      }

      // Start continuous animation after entrance
      setTimeout(startContinuousAnimation, 600 + delay)

      // Hover effects
      const handleMouseEnter = () => {
        animate(badge, {
          scale: 1.1,
          duration: 200,
          ease: 'out(2)',
        })
      }

      const handleMouseLeave = () => {
        animate(badge, {
          scale: 1,
          duration: 200,
          ease: 'out(2)',
        })
      }

      badge.addEventListener('mouseenter', handleMouseEnter)
      badge.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        badge.removeEventListener('mouseenter', handleMouseEnter)
        badge.removeEventListener('mouseleave', handleMouseLeave)
        if (continuousAnimation) {
          continuousAnimation.pause()
        }
      }
    }, [animation, delay])

    return (
      <div 
        ref={badgeRef}
        className={cn(animatedBadgeVariants({ variant, animation }), className)} 
        {...props}
      >
        {children}
      </div>
    )
  }
)

AnimatedBadge.displayName = "AnimatedBadge"

export { AnimatedBadge, animatedBadgeVariants }
