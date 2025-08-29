import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEnrollment = searchParams.get('enroll') === 'true'
  const { signIn, signInWithGoogle, user } = useAuth()
  
  // Redirect authenticated users away from login page
  useEffect(() => {
    if (user) {
      if (isEnrollment) {
        navigate("/payment")
        } else {
          navigate("/dashboard")
        }
    }
  }, [user, navigate, isEnrollment])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Check if email exists to provide better guidance
          try {
            const { data: checkResult } = await supabase.functions.invoke('check-email', {
              body: { email }
            })
            
            if (checkResult?.exists) {
              if (!checkResult.verified) {
                setError("This email is registered but not verified. Please check your email and click the verification link before signing in.")
              } else {
                setError("Incorrect password. If you don't remember your password, click on 'Forgot your password?' to reset it.")
              }
            } else {
              setError("This email is not registered. Please sign up first or check if you entered the correct email address.")
            }
          } catch {
            setError("Invalid email or password. Please check your credentials and try again.")
          }
        } else if (error.message.includes('Email not confirmed')) {
          setError("Please check your email and click the confirmation link before signing in.")
        } else {
          setError(error.message)
        }
      } else {
        // Redirect based on enrollment intent
        if (isEnrollment) {
          navigate("/payment")
        } else {
          navigate("/dashboard")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) setError(error.message)
    } catch (err) {
      setError("Failed to login with Google")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold text-gradient mb-2"
          >
            Welcome Back
          </motion.div>
          <p className="text-muted-foreground">
            Sign in to continue your learning journey
          </p>
        </div>

        <Card className="glass-card-strong border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gradient leading-relaxed pb-2">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full button-3d hover-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full glass-card border-white/20 hover:bg-white/5"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a
                  href={`/signup${isEnrollment ? '?enroll=true' : ''}`}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign up
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
