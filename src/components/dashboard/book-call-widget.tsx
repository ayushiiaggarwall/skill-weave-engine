import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

export function BookCallWidget() {
  const { user, profile } = useAuth()

  const openCalendly = () => {
    let calendlyUrl = 'https://calendly.com/hello-ayushiaggarwal'
    
    // Prefill user data if logged in
    if (user && profile?.name) {
      const params = new URLSearchParams()
      params.append('name', profile.name)
      params.append('email', user.email || '')
      calendlyUrl += `?${params.toString()}`
    }
    
    // @ts-ignore - Calendly is loaded via script tag
    if (window.Calendly) {
      // @ts-ignore
      window.Calendly.initPopupWidget({ url: calendlyUrl });
    } else {
      // Fallback to opening in new tab
      window.open(calendlyUrl, '_blank');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="glass-card-strong hover-lift pt-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Got Questions?</h3>
              <p className="text-muted-foreground text-sm">
                Have doubts about the program or your idea? Book a quick call and I'll help you decide the next step.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg"
                onClick={openCalendly}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a 15-min call
              </Button>
              
              <p className="text-xs text-muted-foreground">
                No pressure—just a quick chat 🙂
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}