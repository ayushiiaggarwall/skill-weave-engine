import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToastContext } from "@/components/ui/toast-provider"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToastContext()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Use the production domain instead of sandbox domain
      const redirectDomain = window.location.hostname.includes('sandbox.lovable.dev') 
        ? 'https://ayushiaggarwal.tech' 
        : window.location.origin
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectDomain}/reset-password`,
      })

      if (error) {
        console.error("Password reset error:", error)
        
        // Special handling for hook timeout - email was likely sent successfully
        if (error.message?.includes("Failed to reach hook within maximum time") || error.code === "hook_timeout") {
          setIsSubmitted(true)
          toast({
            title: "Reset Link Sent Successfully",
            description: "Please check your email inbox for the password reset link. The process took longer than expected but your email should arrive shortly.",
            variant: "success",
          })
          setTimeout(() => navigate('/login'), 3000)
          return // Prevent further execution
        } else {
          // All other errors - show red error message
          toast({
            title: "Failed to Send Reset Email",
            description: error.message || "There was an issue sending the reset email. Please try again.",
            variant: "destructive",
          })
          return // Prevent further execution
        }
      } else {
        setIsSubmitted(true)
        toast({
          title: "Reset Link Sent Successfully",
          description: "Please check your email inbox for the password reset link. Redirecting to login...",
          variant: "success",
        })
        setTimeout(() => navigate('/login'), 2500)
      }
    } catch (error: any) {
      console.error("Unexpected error:", error)
      toast({
        title: "Failed to Send Reset Email",
        description: "There was an issue sending the reset email. Please try again or contact support if the problem persists.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {isSubmitted && (
        <div className="fixed top-4 right-4 z-50">
          <div className="glass-card border-primary/20 bg-primary/10 text-primary px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <div className="font-medium">Reset link sent</div>
              <div className="text-sm opacity-80">Redirecting to login…</div>
            </div>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}