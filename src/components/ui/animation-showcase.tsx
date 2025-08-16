import { useState } from 'react'
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from './animated-card'
import { AnimatedButton } from './animated-button'
import { AnimatedInput } from './animated-input'
import { AnimatedBadge } from './animated-badge'
import { Star, Sparkles, Zap, Heart } from 'lucide-react'

export function AnimationShowcase() {
  const [inputValue, setInputValue] = useState('')

  return (
    <section className="py-24 px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedBadge variant="outline" animation="glow" className="mb-4">
            ✨ Animation Showcase
          </AnimatedBadge>
          <h2 className="text-4xl font-bold mb-6 text-gradient">
            Enhanced Components in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the smooth, organic animations powered by Anime.js
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card Animations */}
          <AnimatedCard 
            delay={200}
            animationType="fadeUp"
            className="glass-card"
          >
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Fade Up Card
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <p className="text-muted-foreground">
                This card animates with a smooth fade-up motion triggered by scroll.
              </p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard 
            delay={400}
            animationType="slideLeft"
            className="glass-card"
          >
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-accent" />
                Slide Left Card
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <p className="text-muted-foreground">
                Slides in from the left with elastic easing for a bouncy feel.
              </p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard 
            delay={600}
            animationType="rotate"
            hoverScale={1.05}
            className="glass-card"
          >
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Rotating Card
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <p className="text-muted-foreground">
                Enters with a 3D rotation and enhanced hover scaling.
              </p>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Button Animations */}
          <AnimatedCard delay={800} className="glass-card">
            <AnimatedCardHeader>
              <AnimatedCardTitle>Button Styles</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-4">
              <AnimatedButton animation="glow" className="w-full">
                Glow Effect
              </AnimatedButton>
              <AnimatedButton animation="bounce" variant="outline" className="w-full">
                Bounce Animation
              </AnimatedButton>
              <AnimatedButton animation="magnetic" variant="secondary" className="w-full">
                Magnetic Pull
              </AnimatedButton>
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Input Animations */}
          <AnimatedCard delay={1000} className="glass-card">
            <AnimatedCardHeader>
              <AnimatedCardTitle>Input Variations</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-4">
              <AnimatedInput
                placeholder="Glow effect input"
                animationType="glow"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <AnimatedInput
                placeholder="Floating input"
                animationType="float"
              />
              <AnimatedInput
                placeholder="Magnetic input"
                animationType="magnetic"
              />
            </AnimatedCardContent>
          </AnimatedCard>

          {/* Badge Animations */}
          <AnimatedCard delay={1200} className="glass-card">
            <AnimatedCardHeader>
              <AnimatedCardTitle>Animated Badges</AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <AnimatedBadge animation="pulse" delay={200}>
                  <Heart className="w-3 h-3 mr-1" />
                  Pulse
                </AnimatedBadge>
                <AnimatedBadge animation="bounce" variant="secondary" delay={400}>
                  Bounce
                </AnimatedBadge>
                <AnimatedBadge animation="glow" variant="outline" delay={600}>
                  <Star className="w-3 h-3 mr-1" />
                  Glow
                </AnimatedBadge>
                <AnimatedBadge animation="shake" variant="destructive" delay={800}>
                  Shake
                </AnimatedBadge>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        {/* Performance Note */}
        <AnimatedCard delay={1400} className="mt-12 glass-card border-primary/20">
          <AnimatedCardContent className="text-center p-8">
            <AnimatedBadge animation="glow" className="mb-4">
              ⚡ Performance Optimized
            </AnimatedBadge>
            <h3 className="text-xl font-semibold mb-2">Smooth & Responsive</h3>
            <p className="text-muted-foreground">
              All animations use transform-gpu for hardware acceleration and are optimized 
              for 60fps performance across devices.
            </p>
          </AnimatedCardContent>
        </AnimatedCard>
      </div>
    </section>
  )
}
