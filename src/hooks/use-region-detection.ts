import { useState, useEffect } from 'react'

export function useRegionDetection() {
  const [region, setRegion] = useState<'in' | 'intl'>('intl') // Default to international
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectRegion = async () => {
      try {
        // Try to detect from IP using same method as backend
        const ipResponse = await fetch('https://ipapi.co/json/')
        const ipData = await ipResponse.json()
        
        if (ipData.country_code === 'IN') {
          setRegion('in')
        } else {
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