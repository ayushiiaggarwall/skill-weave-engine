import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

export function PaymentSuccess() {
  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = "/dashboard"
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-700 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-muted-foreground">
              Welcome to the 5-Week No-Code to Product Course!
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm">
                You'll receive a confirmation email shortly with course details and access instructions.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard in 3 seconds...
            </p>

            <Button 
              onClick={() => window.location.href = "/dashboard"}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}