import { motion } from "framer-motion"
import { ArrowRight, Play, Trophy, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimeDemo } from "@/components/ui/anime-demo"
import { courseData } from "@/lib/course-data"
import { useNavigate } from "react-router-dom"

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

function FloatingElement({ children, delay = 0, duration = 6, className = "" }: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

export function HeroSection() {
  const navigate = useNavigate()
  
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 overflow-hidden pt-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Shapes */}
        <FloatingElement delay={0} className="absolute top-32 right-1/4">
          <div className="w-4 h-4 bg-primary/20 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement delay={2} className="absolute bottom-1/4 left-1/3">
          <div className="w-6 h-6 bg-accent/20 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement delay={4} className="absolute top-1/3 right-1/3">
          <div className="w-3 h-3 bg-yellow-400/20 rounded-full blur-sm" />
        </FloatingElement>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                ✨ Join {courseData.stats.students}+ learners already on the waitlist
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  From{" "}
                </motion.span>
                <motion.span 
                  className="text-gradient block sm:inline"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  No-Code
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="block sm:inline"
                >
                  {" "}to{" "}
                </motion.span>
                <motion.span 
                  className="text-gradient-purple block sm:inline"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  Product
                </motion.span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                {courseData.description}
              </motion.p>
            </div>

            {/* Value Propositions with Icons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="space-y-4"
            >
              {courseData.features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 + index * 0.1 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">{feature.icon}</span>
                  </div>
                  <span className="text-foreground font-medium text-lg group-hover:text-primary transition-colors">
                    {feature.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Button 
                size="lg" 
                className="px-10 py-4 text-lg button-3d hover-glow relative overflow-hidden group"
                onClick={() => navigate("/signup")}
              >
                <span className="relative z-10 flex items-center">
                  Enroll Now - ${courseData.price}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </motion.div>
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-4 text-lg glass-card border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300"
              >
                <Play className="mr-3 h-5 w-5" />
                See Syllabus
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Interactive Hero Card */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative space-y-8"
          >
            <div className="relative">
              {/* Floating decorative elements */}
              <FloatingElement delay={1} className="absolute -top-8 -right-8 z-10">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
              </FloatingElement>

              <FloatingElement delay={3} className="absolute -bottom-6 -left-6 z-10">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-xl">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
              </FloatingElement>

              {/* Main Card */}
              <motion.div
                className="glass-card-strong p-8 rounded-3xl hover-lift transform-gpu"
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="space-y-8">
                  <div className="text-center">
                    <motion.div 
                      className="w-20 h-20 mx-auto mb-6 bg-primary rounded-3xl flex items-center justify-center shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Trophy className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-gradient">Success Guaranteed</h3>
                    <p className="text-muted-foreground text-lg">
                      Join {courseData.stats.students}+ learners already on the waitlist
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div 
                      className="glass-card p-6 rounded-2xl text-center hover-glow"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="text-3xl font-bold text-primary mb-2">
                        {courseData.stats.successRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">projects built without coding</div>
                    </motion.div>
                    
                    <motion.div 
                      className="glass-card p-6 rounded-2xl text-center hover-glow"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="text-3xl font-bold text-accent mb-2">
                        {courseData.stats.revenue}
                      </div>
                      <div className="text-sm text-muted-foreground">goal: helping you launch your idea live</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Anime.js Demo Section */}
            <div className="glass-card p-6 rounded-2xl">
              <AnimeDemo />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
