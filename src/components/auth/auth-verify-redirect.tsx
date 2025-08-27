import { useEffect } from 'react'

// This page keeps the email link on your custom domain and immediately
// redirects to Supabase's verify endpoint with the provided params.
export default function AuthVerifyRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token') || params.get('token_hash') || ''
    const type = params.get('type') || ''
    const redirect_to = params.get('redirect_to') || `${window.location.origin}/`

    if (!token || !type) {
      // If missing data, just go home
      window.location.replace('/')
      return
    }

    const supabaseUrl = 'https://xujaxssbncobmiwxbaxh.supabase.co'
    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}&redirect_to=${encodeURIComponent(redirect_to)}`

    window.location.replace(verifyUrl)
  }, [])

  return null
}
