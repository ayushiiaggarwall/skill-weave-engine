import { useEffect } from 'react'

const VALID_SOURCES = [
  'linkedin_post',
  'linkedin_profile', 
  'instagram',
  'facebook',
  'snapchat',
  'whatsapp'
] as const

type ReferralSource = typeof VALID_SOURCES[number]

const STORAGE_KEY = 'referral_source'

export function useReferralTracking() {
  useEffect(() => {
    // Only capture on initial page load, not on navigation
    if (sessionStorage.getItem(STORAGE_KEY)) {
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('source')
    
    if (source && VALID_SOURCES.includes(source as ReferralSource)) {
      sessionStorage.setItem(STORAGE_KEY, source)
    }
  }, [])

  const getReferralSource = (): string | null => {
    return sessionStorage.getItem(STORAGE_KEY)
  }

  const clearReferralSource = (): void => {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return {
    getReferralSource,
    clearReferralSource
  }
}