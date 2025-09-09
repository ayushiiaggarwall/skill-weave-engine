import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

const REGION_CACHE_KEY = 'user_region_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface RegionCache {
  region: 'in' | 'intl'
  timestamp: number
}

export function useRegionDetection() {
  const [region, setRegion] = useState<'in' | 'intl'>('intl')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectRegion = async () => {
      // Clear cache for debugging - remove this in production
      sessionStorage.removeItem(REGION_CACHE_KEY)
      
      try {
        // Check if we have cached region data
        const cachedData = sessionStorage.getItem(REGION_CACHE_KEY)
        
        if (cachedData) {
          try {
            const parsed: RegionCache = JSON.parse(cachedData)
            const now = Date.now()
            
            // Check if cache is still valid (within 24 hours)
            if (parsed.timestamp && (now - parsed.timestamp) < CACHE_DURATION) {
              console.log('Using cached region:', parsed.region)
              setRegion(parsed.region)
              setLoading(false)
              return
            } else {
              console.log('Cache expired, detecting region again')
              sessionStorage.removeItem(REGION_CACHE_KEY)
            }
          } catch (e) {
            console.log('Invalid cache data, detecting region')
            sessionStorage.removeItem(REGION_CACHE_KEY)
          }
        }
        
        console.log('Detecting region via backend function...')
        
        // Call our backend function for region detection
        const { data, error } = await supabase.functions.invoke('detect-region')
        
        if (error) throw error
        
        console.log('Region detection response:', data)
        
        const detectedRegion = (data && data.region === 'in') ? 'in' : 'intl'
        
        // Cache the result
        const cacheData: RegionCache = {
          region: detectedRegion,
          timestamp: Date.now()
        }
        
        sessionStorage.setItem(REGION_CACHE_KEY, JSON.stringify(cacheData))
        
        console.log('Region detection - Setting region to:', detectedRegion)
        setRegion(detectedRegion)
        
      } catch (error) {
        console.error('Failed to detect region via backend:', error)
        // Default to international if detection fails
        setRegion('intl')
        
        // Cache the fallback result too
        const cacheData: RegionCache = {
          region: 'intl',
          timestamp: Date.now()
        }
        sessionStorage.setItem(REGION_CACHE_KEY, JSON.stringify(cacheData))
      } finally {
        setLoading(false)
      }
    }

    detectRegion()
  }, [])

  return { region, loading }
}