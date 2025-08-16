import { useEffect, useRef, useState } from 'react'
import { animate, createScope, createSpring, createDraggable } from 'animejs'
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function AnimeDemo() {
  const root = useRef<HTMLDivElement>(null)
  const scope = useRef<any>(null)
  const [rotations, setRotations] = useState(0)

  useEffect(() => {
    if (!root.current) return

    scope.current = createScope({ root: root.current }).add((self: any) => {
      // Every anime.js instance declared here is now scoped to the root div

      // Created a bounce animation loop
      animate('.demo-logo', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: createSpring({ stiffness: 300 }) }
        ],
        loop: true,
        loopDelay: 250,
      })
      
      // Make the logo draggable around its center
      createDraggable('.demo-logo', {
        container: [0, 0, 0, 0],
        releaseEase: createSpring({ stiffness: 200 })
      })

      // Register function methods to be used outside the useEffect
      self.add('rotateLogo', (i: number) => {
        animate('.demo-logo', {
          rotate: i * 360,
          ease: 'out(4)',
          duration: 1500,
        })
      })

      // Animate text characters
      self.add('animateText', () => {
        animate('.demo-text span', {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          delay: (_el: any, i: number) => i * 100,
          ease: 'outElastic(1, .8)',
        })
      })
    })

    // Initialize text animation
    setTimeout(() => {
      scope.current?.methods.animateText()
    }, 500)

    // Properly cleanup all anime.js instances declared inside the scope
    return () => scope.current?.revert()
  }, [])

  const handleClick = () => {
    setRotations(prev => {
      const newRotations = prev + 1
      // Animate logo rotation on click using the method declared inside the scope
      scope.current?.methods.rotateLogo(newRotations)
      return newRotations
    })
  }

  const animateText = () => {
    scope.current?.methods.animateText()
  }

  return (
    <div ref={root} className="flex flex-col items-center p-8 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">
          <span className="demo-text">
            {"Anime.js".split('').map((char, i) => (
              <span key={i} style={{ display: 'inline-block', opacity: 0 }}>
                {char}
              </span>
            ))}
          </span>
          <span className="text-gradient ml-2">Demo</span>
        </h2>
        <p className="text-muted-foreground">Drag the icon and click the buttons!</p>
      </div>

      {/* Demo Logo */}
      <div className="demo-logo w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button onClick={handleClick} className="button-3d hover-glow">
          Rotate (clicks: {rotations})
        </Button>
        <Button onClick={animateText} variant="outline" className="hover-glow">
          Animate Text
        </Button>
      </div>

      <div className="text-sm text-muted-foreground max-w-md text-center">
        This demonstrates anime.js v4 with React using proper ES modules, 
        createScope for cleanup, springs for physics, and draggable interactions.
      </div>
    </div>
  )
}
