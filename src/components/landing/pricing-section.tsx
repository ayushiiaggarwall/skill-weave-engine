import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { courseData } from "@/lib/course-data"
import { Check, Star, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export function PricingSection() {
  const navigate = useNavigate()
  
  const features = [
    "5-week structured curriculum",
    "Access to all no-code tools",
    "Personal project mentorship", 
    "Lifetime community access",
    "Certificate of completion",
    "Money-back guarantee"
  ]

  return (
    <section id="pricing" className="py-24 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
            💰 Simple Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            One Price, Everything Included
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no monthly subscriptions. Pay once and get lifetime access 
            to everything you need to build your product empire.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Popular badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="px-6 py-2 bg-primary text-primary-foreground border-primary shadow-lg">
              <Star className="w-4 h-4 mr-1 fill-current" />
              Most Popular
            </Badge>
          </div>

          <Card className="glass-card-strong border-primary/50 shadow-2xl hover-lift">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold mb-4">
                Complete Course Access
              </CardTitle>
              <div className="space-y-2">
                <div className="text-6xl font-bold text-gradient">
                  {formatCurrency(courseData.price)}
                </div>
                <p className="text-muted-foreground">
                  One-time payment • Lifetime access
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <Check className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Guarantee */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 mr-2 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    30-Day Money-Back Guarantee
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Button 
                  size="lg" 
                  className="w-full py-6 text-lg font-semibold button-3d hover-glow relative overflow-hidden group"
                  onClick={() => navigate("/signup")}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <span className="relative z-10">
                    Enroll Now - {formatCurrency(courseData.price)}
                  </span>
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center text-sm text-muted-foreground"
              >
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-2">4.9/5 from {courseData.stats.students}+ students</span>
                  </div>
                </div>
                <p>Secure payment • SSL encrypted • Cancel anytime</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
