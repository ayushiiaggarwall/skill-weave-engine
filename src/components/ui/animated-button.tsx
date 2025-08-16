import { useEffect, useRef, forwardRef } from 'react'
import { animate } from 'animejs'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform-gpu relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "",
        glow: "",
        bounce: "",
        magnetic: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "glow",
    },
  }
)

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean
  magneticStrength?: number
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation = "glow",
    magneticStrength = 0.3,
    asChild = false, 
    children,
    ...props 
  }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const rippleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const button = buttonRef.current
      const ripple = rippleRef.current
      if (!button) return

      // Initialize entrance animation
      animate(button, {
        scale: [0.95, 1],
        opacity: [0.8, 1],
        duration: 600,
        ease: 'outElastic(1, .8)',
      })

      // Hover effects based on animation type
      const handleMouseEnter = (e: MouseEvent) => {
        switch (animation) {
          case 'pulse':
            animate(button, {
              scale: [1, 1.05, 1],
              duration: 600,
              ease: 'outElastic(1, .8)',
            })
            break
          case 'glow':
            animate(button, {
              scale: 1.02,
              duration: 300,
              ease: 'out(2)',
            })
            if (ripple) {
              animate(ripple, {
                opacity: [0, 0.3, 0],
                scale: [0, 2],
                duration: 800,
                ease: 'out(3)',
              })
            }
            break
          case 'bounce':
            animate(button, {
              translateY: [-2, 0],
              scale: [1, 1.02],
              duration: 300,
              ease: 'outBounce',
            })
            break
          case 'magnetic':
            const rect = button.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const deltaX = (e.clientX - centerX) * magneticStrength
            const deltaY = (e.clientY - centerY) * magneticStrength
            
            animate(button, {
              translateX: deltaX,
              translateY: deltaY,
              scale: 1.02,
              duration: 400,
              ease: 'out(3)',
            })
            break
        }
      }

      const handleMouseLeave = () => {
        animate(button, {
          scale: 1,
          translateX: 0,
          translateY: 0,
          duration: 400,
          ease: 'out(2)',
        })
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (animation === 'magnetic') {
          const rect = button.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const deltaX = (e.clientX - centerX) * magneticStrength
          const deltaY = (e.clientY - centerY) * magneticStrength
          
          animate(button, {
            translateX: deltaX,
            translateY: deltaY,
            duration: 200,
            ease: 'out(2)',
          })
        }
      }

      const handleClick = (e: MouseEvent) => {
        // Click ripple effect
        const rect = button.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        if (ripple) {
          ripple.style.left = x + 'px'
          ripple.style.top = y + 'px'
          ripple.style.width = size + 'px'
          ripple.style.height = size + 'px'

          animate(ripple, {
            scale: [0, 4],
            opacity: [0.5, 0],
            duration: 600,
            ease: 'out(3)',
          })
        }

        // Button press animation
        animate(button, {
          scale: [1, 0.96, 1],
          duration: 200,
          ease: 'out(2)',
        })
      }

      button.addEventListener('mouseenter', handleMouseEnter)
      button.addEventListener('mouseleave', handleMouseLeave)
      button.addEventListener('mousemove', handleMouseMove)
      button.addEventListener('click', handleClick)

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter)
        button.removeEventListener('mouseleave', handleMouseLeave)
        button.removeEventListener('mousemove', handleMouseMove)
        button.removeEventListener('click', handleClick)
      }
    }, [animation, magneticStrength])

    if (asChild) {
      return (
        <span
          className={cn(animatedButtonVariants({ variant, size, animation, className }))}
          ref={ref as any}
          {...props}
        >
          {children}
        </span>
      )
    }

    return (
      <button
        ref={buttonRef}
        className={cn(animatedButtonVariants({ variant, size, animation, className }))}
        {...props}
      >
        {/* Ripple effect element */}
        <div
          ref={rippleRef}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ transform: 'scale(0)' }}
        />
        <span className="relative z-10">
          {children}
        </span>
      </button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton, animatedButtonVariants }
