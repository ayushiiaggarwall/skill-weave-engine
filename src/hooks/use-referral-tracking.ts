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
      console.log('Referral source already stored:', sessionStorage.getItem(STORAGE_KEY))
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('source')
    
    console.log('Checking URL for referral source. Found:', source)
    console.log('Valid sources:', VALID_SOURCES)
    
    if (source && VALID_SOURCES.includes(source as ReferralSource)) {
      console.log('Storing referral source:', source)
      sessionStorage.setItem(STORAGE_KEY, source)
    } else if (source) {
      console.log('Invalid referral source detected:', source)
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