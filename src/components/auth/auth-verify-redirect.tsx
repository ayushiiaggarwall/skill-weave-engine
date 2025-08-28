import { useEffect } from 'react'

// This page keeps the email link on your custom domain and immediately
// redirects to Supabase's verify endpoint with the provided params.
export default function AuthVerifyRedirect() {
  useEffect(() => {
    console.log('AuthVerifyRedirect: Starting verification process')
    console.log('Current URL:', window.location.href)
    
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash') || ''
    const type = params.get('type') || ''
    const redirect_to = params.get('redirect_to') || `${window.location.origin}/dashboard`

    console.log('Extracted params:', { token_hash, type, redirect_to })

    if (!token_hash || !type) {
      console.log('Missing required params, redirecting to home')
      window.location.replace('/')
      return
    }

    const supabaseUrl = 'https://xujaxssbncobmiwxbaxh.supabase.co'
    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}&redirect_to=${encodeURIComponent(redirect_to)}`

    console.log('Redirecting to Supabase verify URL:', verifyUrl)
    window.location.replace(verifyUrl)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Verifying your request...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
