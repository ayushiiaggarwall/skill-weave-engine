import { useState, useEffect } from 'react'

export function useRegionDetection() {
  const [region, setRegion] = useState<'in' | 'intl'>('intl') // Default to international
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectRegion = async () => {
      try {
        console.log('Detecting region via IP...')
        // Try to detect from IP using same method as backend
        const ipResponse = await fetch('https://ipapi.co/json/')
        const ipData = await ipResponse.json()
        
        console.log('IP detection response:', ipData)
        
        if (ipData.country_code === 'IN') {
          console.log('Setting region to IN')
          setRegion('in')
        } else {
          console.log('Setting region to intl, country code:', ipData.country_code)
          setRegion('intl')
        }
      } catch (error) {
        console.error('Failed to detect region:', error)
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