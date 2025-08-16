import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

interface ScrollAnimationOptions {
  threshold?: number
  delay?: number
  duration?: number
  ease?: string
  staggerDelay?: number
  animationType?: 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate'
  loop?: boolean
  once?: boolean
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    threshold = 0.2,
    delay = 0,
    duration = 800,
    ease = 'outElastic(1, .8)',
    staggerDelay = 100,
    animationType = 'fadeUp',
    loop = false,
    once = true,
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Get initial state based on animation type
    const getInitialState = () => {
      switch (animationType) {
        case 'fadeDown':
          return { opacity: 0, translateY: -30 }
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

    // Get target state
    const getTargetState = () => ({
      opacity: 1,
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotateY: 0,
    })

    const initialState = getInitialState()
    const targetState = getTargetState()

    // Apply initial state
    Object.assign(element.style, {
      opacity: String(initialState.opacity),
      transform: `translateX(${initialState.translateX || 0}px) translateY(${initialState.translateY || 0}px) scale(${initialState.scale || 1}) rotateY(${initialState.rotateY || 0}deg)`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!once || !hasAnimated.current)) {
            hasAnimated.current = true

            // Check if element has children to stagger
            const children = element.children
            if (children.length > 1) {
              // Stagger animation for children
              animate(Array.from(children), {
                ...targetState,
                duration,
                delay: stagger(staggerDelay, { start: delay }),
                ease,
                loop,
              })
            } else {
              // Single element animation
              animate(element, {
                ...targetState,
                duration,
                delay,
                ease,
                loop,
              })
            }
          }
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, delay, duration, ease, staggerDelay, animationType, loop, once])

  return elementRef
}

// Specific hooks for common animation patterns
export function useFadeUpOnScroll(options: Omit<ScrollAnimationOptions, 'animationType'> = {}) {
  return useScrollAnimation({ ...options, animationType: 'fadeUp' })
}

export function useSlideLeftOnScroll(options: Omit<ScrollAnimationOptions, 'animationType'> = {}) {
  return useScrollAnimation({ ...options, animationType: 'slideLeft' })
}

export function useSlideRightOnScroll(options: Omit<ScrollAnimationOptions, 'animationType'> = {}) {
  return useScrollAnimation({ ...options, animationType: 'slideRight' })
}

export function useScaleOnScroll(options: Omit<ScrollAnimationOptions, 'animationType'> = {}) {
  return useScrollAnimation({ ...options, animationType: 'scale' })
}

export function useRotateOnScroll(options: Omit<ScrollAnimationOptions, 'animationType'> = {}) {
  return useScrollAnimation({ ...options, animationType: 'rotate' })
}
