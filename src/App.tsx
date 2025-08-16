import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/theme-context'
import { CursorGlow } from './components/ui/cursor-glow'
import { Header } from './components/landing/header'
import { HeroSectionAnime } from './components/landing/hero-section-anime'
import { SyllabusSectionAnime } from './components/landing/syllabus-section-anime'
import { PricingSectionAnime } from './components/landing/pricing-section-anime'
import { FooterAnime } from './components/landing/footer-anime'
import { LoginForm } from './components/auth/login-form'
import { SignupForm } from './components/auth/signup-form'
import { Dashboard } from './components/dashboard/dashboard'
import { PaymentPage } from './components/payment/payment-page'

function HomePage() {
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
          <HeroSectionAnime />
          <SyllabusSectionAnime />
          <PricingSectionAnime />
        </main>
        <FooterAnime />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <CursorGlow />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App