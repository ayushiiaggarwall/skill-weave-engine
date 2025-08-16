import { useEffect, useRef } from 'react'
import { Github, Twitter, Linkedin, Mail, Heart, Sparkles } from "lucide-react"
import { animate as anime } from 'animejs'

function AnimatedFooterSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sectionRef.current) {
      anime({
        targets: sectionRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay,
        easing: 'easeOutExpo',
      })
    }
  }, [delay])

  return (
    <div ref={sectionRef} className="opacity-0">
      {children}
    </div>
  )
}

function AnimatedSocialIcon({ icon: Icon, href, delay = 0 }: { icon: any, href: string, delay?: number }) {
  const iconRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (iconRef.current) {
      anime({
        targets: iconRef.current,
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [180, 0],
        duration: 600,
        delay,
        easing: 'easeOutElastic(1, .8)',
      })

      const handleMouseEnter = () => {
        anime({
          targets: iconRef.current,
          scale: 1.2,
          rotate: 360,
          duration: 400,
          easing: 'easeOutElastic(1, .8)',
        })
      }

      const handleMouseLeave = () => {
        anime({
          targets: iconRef.current,
          scale: 1,
          rotate: 0,
          duration: 300,
          easing: 'easeOutQuad',
        })
      }

      iconRef.current.addEventListener('mouseenter', handleMouseEnter)
      iconRef.current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        if (iconRef.current) {
          iconRef.current.removeEventListener('mouseenter', handleMouseEnter)
          iconRef.current.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    }
  }, [delay])

  return (
    <a
      ref={iconRef}
      href={href}
      className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors opacity-0"
      aria-label={`Visit our ${href.includes('github') ? 'GitHub' : href.includes('twitter') ? 'Twitter' : href.includes('linkedin') ? 'LinkedIn' : 'Email'}`}
    >
      <Icon className="w-5 h-5" />
    </a>
  )
}

export function FooterAnime() {
  const footerRef = useRef<HTMLElement>(null)
  const heartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Heart beat animation
    if (heartRef.current) {
      anime({
        targets: heartRef.current,
        scale: [1, 1.2, 1],
        duration: 1000,
        delay: 2000,
        easing: 'easeInOutSine',
        loop: true,
      })
    }

    // Footer entrance animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger sparkle animation
            const sparkles = entry.target.querySelectorAll('.sparkle-decoration')
            anime({
              targets: sparkles,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 360],
              duration: 2000,
              delay: anime.stagger(300),
              easing: 'easeOutElastic(1, .8)',
              loop: true,
            })
          }
        })
      },
      { threshold: 0.5 }
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <footer ref={footerRef} className="relative py-16 px-6 lg:px-8 border-t border-border/50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="sparkle-decoration absolute top-10 left-1/4 opacity-0">
          <Sparkles className="w-4 h-4 text-primary/30" />
        </div>
        <div className="sparkle-decoration absolute bottom-10 right-1/3 opacity-0">
          <Sparkles className="w-3 h-3 text-accent/30" />
        </div>
        <div className="sparkle-decoration absolute top-1/2 right-1/4 opacity-0">
          <Sparkles className="w-5 h-5 text-primary/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <AnimatedFooterSection delay={200}>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gradient">SkillWeave</h3>
              <p className="text-muted-foreground leading-relaxed">
                Empowering entrepreneurs to build profitable products without code. 
                Transform your ideas into reality with our comprehensive program.
              </p>
              <div className="flex space-x-3">
                <AnimatedSocialIcon 
                  icon={Github} 
                  href="https://github.com/ayushiiaggarwall/skill-weave-engine" 
                  delay={600} 
                />
                <AnimatedSocialIcon 
                  icon={Twitter} 
                  href="https://twitter.com" 
                  delay={700} 
                />
                <AnimatedSocialIcon 
                  icon={Linkedin} 
                  href="https://linkedin.com" 
                  delay={800} 
                />
                <AnimatedSocialIcon 
                  icon={Mail} 
                  href="mailto:hello@skillweave.dev" 
                  delay={900} 
                />
              </div>
            </div>
          </AnimatedFooterSection>

          {/* Quick Links */}
          <AnimatedFooterSection delay={400}>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "Course Curriculum", href: "#syllabus" },
                  { name: "Pricing", href: "#pricing" },
                  { name: "Success Stories", href: "#testimonials" },
                  { name: "FAQ", href: "#faq" },
                  { name: "Contact", href: "#contact" }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedFooterSection>

          {/* Program Info */}
          <AnimatedFooterSection delay={600}>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Program</h4>
              <ul className="space-y-3">
                {[
                  { name: "5-Week Duration", value: "Complete program" },
                  { name: "500+ Students", value: "Success stories" },
                  { name: "95% Success Rate", value: "Proven results" },
                  { name: "$2M+ Revenue", value: "Generated by alumni" }
                ].map((item, index) => (
                  <li key={index} className="text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <br />
                    <span className="text-primary font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedFooterSection>
        </div>

        {/* Bottom Section */}
        <AnimatedFooterSection delay={800}>
          <div className="pt-8 border-t border-border/30">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center text-sm text-muted-foreground">
                <span>© 2025 SkillWeave. Made with</span>
                <div ref={heartRef} className="mx-2">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
                <span>for entrepreneurs</span>
              </div>
              
              <div className="flex space-x-6 text-sm">
                <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </AnimatedFooterSection>
      </div>
    </footer>
  )
}
