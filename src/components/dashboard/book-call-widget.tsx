import { Calendar, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useCalendlyData } from "@/hooks/use-calendly-data"

export function BookCallWidget() {
  const { user, profile } = useAuth()
  const calendlyData = useCalendlyData()

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

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime)
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return { date: dateTime, time: '' }
    }
  }

  if (calendlyData.isScheduled && calendlyData.eventStartTime) {
    const startDateTime = formatDateTime(calendlyData.eventStartTime)
    const endDateTime = formatDateTime(calendlyData.eventEndTime || '')
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="glass-card-strong hover-lift pt-4 border-success/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-success">Call Scheduled!</h3>
                <p className="text-muted-foreground text-sm">
                  {calendlyData.eventTypeName || 'Your call'} is confirmed
                </p>
              </div>
              
              <div className="space-y-3 p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-success" />
                  <span className="font-medium text-sm">Schedule</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{startDateTime.date}</div>
                  <div className="text-muted-foreground">
                    {startDateTime.time} - {endDateTime.time}
                  </div>
                </div>
                {calendlyData.assignedTo && (
                  <div className="text-xs text-muted-foreground">
                    With: {calendlyData.assignedTo}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                You'll receive a calendar invite via email 📧
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
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