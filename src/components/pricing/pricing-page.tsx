import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { StandalonePricing } from "./standalone-pricing"

export function PricingPage() {
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
      <main className="relative z-10 pt-20">
        <StandalonePricing />
      </main>
      <Footer />
    </div>
  )
}