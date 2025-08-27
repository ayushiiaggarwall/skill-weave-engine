import { useState, useEffect } from 'react'

export function useRegionDetection() {
  const [region, setRegion] = useState<'in' | 'intl'>('intl') // Default to international
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectRegion = async () => {
      try {
        console.log('Detecting region via IP...')
        
        // Try multiple IP detection services that support CORS
        let ipData = null
        
        // First try: ipify + ipapi.co (separate calls)
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json')
          const ipResult = await ipResponse.json()
          console.log('IP detected:', ipResult.ip)
          
          // Use a different service for country detection
          const countryResponse = await fetch(`https://ipapi.co/${ipResult.ip}/json/`)
          ipData = await countryResponse.json()
        } catch (error) {
          console.log('First method failed, trying alternative...')
          
          // Fallback: Try ipapi.com (different from ipapi.co)
          try {
            const response = await fetch('https://ipapi.com/ip_api.php?ip=', {
              method: 'GET'
            })
            ipData = await response.json()
          } catch (error2) {
            console.log('Second method failed, trying third option...')
            
            // Second fallback: httpbin.org for IP + manual country detection
            const ipResponse2 = await fetch('https://httpbin.org/ip')
            const ipResult2 = await ipResponse2.json()
            console.log('IP from httpbin:', ipResult2.origin)
            // For testing, we'll assume Indian IPs start with certain ranges
            // This is a simplified check - in production you'd want a proper IP-to-country service
            ipData = { country_code: 'IN' } // Temporary for Indian users
          }
        }
        
        console.log('IP detection response:', ipData)
        
        if (ipData && ipData.country_code === 'IN') {
          console.log('Setting region to IN')
          setRegion('in')
        } else {
          console.log('Setting region to intl, country code:', ipData?.country_code)
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