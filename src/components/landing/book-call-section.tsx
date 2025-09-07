import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function BookCallSection() {
  const openCalendly = () => {
    // @ts-ignore - Calendly is loaded via script tag
    if (window.Calendly) {
      // @ts-ignore
      window.Calendly.initPopupWidget({ url: 'https://calendly.com/hello-ayushiaggarwal' });
    } else {
      // Fallback to opening in new tab
      window.open('https://calendly.com/hello-ayushiaggarwal', '_blank');
    }
  }

  return (
    <section className="py-20 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, hsl(var(--accent) / 0.3) 0%, transparent 50%)
          `
        }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card-strong p-12 rounded-3xl text-center space-y-8"
        >
          {/* Floating Calendar Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl"
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>

          {/* Main Content */}
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-gradient leading-tight"
            >
              Got any questions? Schedule a call with us!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Have doubts about the program or your idea? Book a quick call and I'll help you decide the next step.
            </motion.p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-4"
          >
            <Button 
              size="lg" 
              className="px-12 py-4 text-lg bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-2xl hover:shadow-primary/25 transition-all duration-300"
              onClick={openCalendly}
            >
              <Calendar className="mr-3 h-6 w-6" />
              Book a 15-min call
            </Button>
            
            <p className="text-sm text-muted-foreground">
              No pressure—just a quick chat 🙂
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}