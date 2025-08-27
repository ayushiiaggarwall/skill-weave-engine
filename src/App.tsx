import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import { ToastProvider } from './components/ui/toast-provider'
import { CursorGlow } from './components/ui/cursor-glow'
import { useReferralTracking } from './hooks/use-referral-tracking'
import { Header } from './components/landing/header'
import { HeroSectionAnime } from './components/landing/hero-section-anime'
import { SyllabusSection } from './components/landing/syllabus-section'
import { PricingSection } from './components/landing/pricing-section'
import { Footer } from './components/landing/footer'
import { LoginForm } from './components/auth/login-form'
import { SignupForm } from './components/auth/signup-form'
import { ForgotPasswordForm } from './components/auth/forgot-password-form'
import { ResetPasswordForm } from './components/auth/reset-password-form'
import AuthVerifyRedirect from './components/auth/auth-verify-redirect'
import { ModernDashboard } from './components/dashboard/modern-dashboard'
import { PaymentPage } from './components/payment/payment-page'
import { EnhancedPaymentPage } from './components/payment/enhanced-payment-page'
import { PaymentSuccess } from './components/payment/payment-success'
import { PaymentCancel } from './components/payment/payment-cancel'
import { CoursePage } from './components/courses/course-page'
import { AdminDashboard } from './components/admin/admin-dashboard'
import { ProtectedAdminRoute } from './components/admin/protected-admin-route'
import { MyCourses } from '@/components/courses/my-courses'
import { LearnerDashboard } from '@/components/learner/learner-dashboard'
import { PricingPage } from './components/pricing/pricing-page'
import { AuthRedirect } from './components/auth/auth-redirect'
import { ContactUs } from './components/support/contact-us'
import { ProfilePage } from './components/profile/profile-page'
import { PayPalTestPage } from './components/testing/paypal-test-page'

function HomePage() {
  // Track referral sources from URL parameters
  useReferralTracking()
  
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
        <SyllabusSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <CursorGlow />
          <Routes>
            <Route path="/" element={
              <AuthRedirect>
                <HomePage />
              </AuthRedirect>
            } />
            <Route path="/login" element={
              <div className="min-h-screen bg-background">
                <Header />
                <LoginForm />
              </div>
            } />
            <Route path="/signup" element={
              <div className="min-h-screen bg-background">
                <Header />
                <SignupForm />
              </div>
            } />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/auth/verify" element={<AuthVerifyRedirect />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/pay" element={<EnhancedPaymentPage />} />
            <Route path="/pay/success" element={<PaymentSuccess />} />
            <Route path="/pay/cancel" element={<PaymentCancel />} />
          <Route path="/dashboard" element={<ModernDashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/learner" element={<LearnerDashboard />} />
            <Route path="/courses" element={<CoursePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/test/paypal" element={<PayPalTestPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  </AuthProvider>
  )
}

export default App