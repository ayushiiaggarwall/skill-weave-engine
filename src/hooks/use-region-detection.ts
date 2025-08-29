import { useState, useEffect } from 'react'
// import { supabase } from '@/integrations/supabase/client' // Temporarily disabled

export function useRegionDetection() {
  const [region, setRegion] = useState<'in' | 'intl'>('intl') // Force international for testing
  const [loading, setLoading] = useState(false) // No loading needed for override

  useEffect(() => {
    const detectRegion = async () => {
      try {
        // TEMPORARY OVERRIDE: Force international region for testing
        console.log('TEMPORARY OVERRIDE: Forcing international region for testing')
        setRegion('intl')
        return
        
        // Original detection code (temporarily disabled)
        /*
        console.log('Detecting region via backend function...')
        
        // Call our backend function for region detection
        const { data, error } = await supabase.functions.invoke('detect-region')
        
        if (error) throw error
        
        console.log('Region detection response:', data)
        
        if (data && data.region === 'in') {
          console.log('Setting region to IN based on backend detection')
          setRegion('in')
        } else {
          console.log('Setting region to intl, country code:', data?.country_code)
          setRegion('intl')
        }
        */
      } catch (error) {
        console.error('Failed to detect region via backend:', error)
        // Default to international if detection fails
        setRegion('intl')
      } finally {
        setLoading(false)
      }
    }

    detectRegion()
  }, [])

  return { region, loading }
}