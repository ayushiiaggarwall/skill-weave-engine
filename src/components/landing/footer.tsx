import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-gradient">
              LearnLaunch
            </div>
            <p className="text-muted-foreground">
              Empowering entrepreneurs to build profitable products without code. 
              Join the no-code revolution today.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <a href="#course" className="block text-muted-foreground hover:text-primary transition-colors">
                Course Overview
              </a>
              <a href="#syllabus" className="block text-muted-foreground hover:text-primary transition-colors">
                Syllabus
              </a>
              <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <div className="space-y-2">
              <a href="mailto:support@learnlaunch.com" className="block text-muted-foreground hover:text-primary transition-colors">
                support@learnlaunch.com
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="border-t border-border mt-8 pt-8 text-center text-muted-foreground"
        >
          <p>&copy; 2024 LearnLaunch. All rights reserved. Built with ❤️ for entrepreneurs.</p>
        </motion.div>
      </div>
    </footer>
  )
}
