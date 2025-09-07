import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the client's IP address from headers
    const rawIP = req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') || 
                  req.headers.get('cf-connecting-ip') ||
                  'unknown'

    // Extract the first IP from comma-separated list
    const clientIP = rawIP.split(',')[0].trim()

    console.log('Raw IP header:', rawIP)
    console.log('Extracted client IP:', clientIP)

    let region = 'intl' // Default to international
    let countryCode = 'unknown'

    try {
      // Use ipapi.co server-side (no CORS issues here)
      const ipResponse = await fetch(`https://ipapi.co/${clientIP}/json/`)
      
      if (!ipResponse.ok) {
        throw new Error(`HTTP ${ipResponse.status}: ${ipResponse.statusText}`)
      }
      
      const ipData = await ipResponse.json()
      
      console.log('IP geolocation data:', ipData)
      
      // Check for error response from ipapi.co
      if (ipData.error) {
        throw new Error(`ipapi.co error: ${ipData.reason || ipData.error}`)
      }
      
      if (ipData.country_code === 'IN') {
        region = 'in'
        countryCode = 'IN'
        console.log('Detected India from ipapi.co')
      } else {
        countryCode = ipData.country_code || 'unknown'
        console.log(`Detected country: ${countryCode}`)
      }
    } catch (error) {
      console.error('Failed to detect country from IP:', error)
      // Fallback: check if IP starts with common Indian IP ranges
      const ipParts = clientIP.split('.')
      const firstOctet = parseInt(ipParts[0] || '0')
      
      // Common Indian IP ranges (simplified check)
      if (firstOctet === 183 || firstOctet === 117 || firstOctet === 182 || 
          firstOctet === 49 || firstOctet === 103 || firstOctet === 157 ||
          (firstOctet >= 115 && firstOctet <= 125)) {
        region = 'in'
        countryCode = 'IN (estimated from IP range)'
        console.log('Detected Indian IP range, setting region to IN')
      }
    }

    return new Response(
      JSON.stringify({
        region,
        country_code: countryCode,
        ip: clientIP,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in detect-region function:', error)
    
    return new Response(
      JSON.stringify({
        region: 'intl', // Default fallback
        country_code: 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 with fallback data
      }
    )
  }
})