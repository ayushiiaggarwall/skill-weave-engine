import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, CreditCard } from "lucide-react"

export function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-orange-700 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm">
                If you encountered any issues during checkout, please try again or contact our support team.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => window.location.href = "/pay"}
                className="w-full"
                size="lg"
              >
                <CreditCard className="mr-2 w-4 h-4" />
                Try Payment Again
              </Button>
              
              <Button 
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}