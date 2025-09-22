import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card, CardContent } from '@/components/ui/card'
import { SectionBadge } from '@/components/ui/section-badge'
import { Calendar, CheckCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Workshop {
  id: string
  title: string
  description: string | null
  date_time: string
}

interface FormData {
  name: string
  email: string
  phone: string
  city: string
  role: string
  howHeard: string
  consent: boolean
}

export function WorkshopPage() {
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    role: '',
    howHeard: '',
    consent: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkshop()
    captureUTMParams()
  }, [])

  const fetchWorkshop = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('is_active', true)
        .order('date_time', { ascending: true })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching workshop:', error)
        return
      }

      setWorkshop(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const captureUTMParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const utmData = {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || ''
    }
    
    // Store in sessionStorage for form submission
    sessionStorage.setItem('utmData', JSON.stringify(utmData))
  }

  const scrollToForm = () => {
    document.getElementById('enrollment-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!workshop) {
      toast({
        title: "Error",
        description: "No active workshop found",
        variant: "destructive"
      })
      return
    }

    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to receive updates about the workshop",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const utmData = JSON.parse(sessionStorage.getItem('utmData') || '{}')
      
      const { error } = await supabase
        .from('workshop_registrations')
        .insert({
          workshop_id: workshop.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          city: formData.city || null,
          role: formData.role || null,
          how_heard: formData.howHeard || null,
          consent: formData.consent,
          ...utmData
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setIsEnrolled(true)
          toast({
            title: "Already Enrolled!",
            description: `You're already registered for this workshop, ${formData.name}!`
          })
        } else {
          throw error
        }
      } else {
        // Send confirmation email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-workshop-confirmation', {
            body: {
              name: formData.name,
              email: formData.email,
              workshopTitle: workshop.title,
              workshopDate: new Date(workshop.date_time).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })
            }
          })

          if (emailError) {
            console.error('Email sending failed:', emailError)
          }
        } catch (emailError) {
          console.error('Email function call failed:', emailError)
        }

        setIsEnrolled(true)
        toast({
          title: "Enrollment Successful!",
          description: `Welcome aboard, ${formData.name}! Check your email for confirmation.`,
          variant: "success"
        })
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      toast({
        title: "Enrollment Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateCalendarLink = () => {
    if (!workshop) return '#'
    
    const startDate = new Date(workshop.date_time)
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours later
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const title = encodeURIComponent(workshop.title)
    const description = encodeURIComponent(workshop.description || '')
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${description}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workshop details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        {/* Global background effects */}
        <div 
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.2) 0%, transparent 50%)
            `
          }}
        />
        
        <Header />
        <main className="relative z-10">
          <section className="container mx-auto px-4 py-16 md:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionBadge className="mb-6">FREE LIVE WORKSHOP</SectionBadge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Vibe-Coding Bootcamp
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-4xl mx-auto">
                Learn how to build AI products end-to-end without coding — in just 3 hours.
              </p>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                From prompts to landing pages, automations, and voice agents — get hands-on with the future of building.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  size="lg" 
                  disabled
                  className="w-full sm:w-auto"
                >
                  Workshop Coming Soon
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                📅 Stay tuned for upcoming workshop dates!
              </p>
            </motion.div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Global background effects */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.2) 0%, transparent 50%)
          `
        }}
      />
      
      <Header />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionBadge className="mb-6">FREE LIVE WORKSHOP</SectionBadge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {workshop.title}
            </h1>
            
            {workshop.description && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
                {workshop.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="w-full sm:w-auto"
              >
                Enroll Now
              </Button>
              
              {isEnrolled && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.open(generateCalendarLink(), '_blank')}
                  className="w-full sm:w-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Add to Calendar
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              📅 {new Date(workshop.date_time).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </motion.div>
        </section>

        {/* Enrollment Form or Success State */}
        <section id="enrollment-form" className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="backdrop-blur-sm bg-card/90 border border-border/50 shadow-xl">
              <CardContent className="p-10 md:p-12">
                {isEnrolled ? (
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">
                      You're in, {formData.name}! 🎉
                    </h2>
                    <p className="text-lg mb-6">Add it to your calendar:</p>
                    <Button 
                      onClick={() => window.open(generateCalendarLink(), '_blank')}
                      className="mb-6"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Add to Calendar
                    </Button>
                    <p className="text-muted-foreground">
                      A confirmation email with all details is on its way.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">Secure Your Spot</h2>
                      <p className="text-muted-foreground">Join the AI revolution</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <Input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Your city"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full p-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Select your role</option>
                        <option value="Student">Student</option>
                        <option value="Founder">Founder</option>
                        <option value="Working Pro">Working Pro</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">How did you hear about us?</label>
                      <select
                        value={formData.howHeard}
                        onChange={(e) => setFormData(prev => ({ ...prev, howHeard: e.target.value }))}
                        className="w-full p-2 border border-input rounded-md bg-background"
                      >
                        <option value="">Select an option</option>
                        <option value="Twitter">Twitter</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consent}
                        onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <label htmlFor="consent" className="text-sm text-muted-foreground">
                        I agree to receive updates about this workshop and related programs.
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}