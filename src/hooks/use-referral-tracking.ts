import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

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
const CLICK_LOGGED_KEY = 'referral_click_logged'

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
      
      // Log click event once per session
      if (!sessionStorage.getItem(CLICK_LOGGED_KEY)) {
        logReferralClick(source, window.location.href)
        sessionStorage.setItem(CLICK_LOGGED_KEY, 'true')
      }
    } else if (source) {
      console.log('Invalid referral source detected:', source)
    }
  }, [])

  const logReferralClick = async (source: string, url: string) => {
    try {
      const { error } = await supabase
        .from('referral_clicks')
        .insert({
          source,
          url
        })
      
      if (error) {
        console.error('Error logging referral click:', error)
      } else {
        console.log('Referral click logged:', source)
      }
    } catch (error) {
      console.error('Error logging referral click:', error)
    }
  }

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