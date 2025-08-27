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
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown'

    console.log('Client IP detected:', clientIP)

    let region = 'intl' // Default to international
    let countryCode = 'unknown'

    try {
      // Use ipapi.co server-side (no CORS issues here)
      const ipResponse = await fetch(`https://ipapi.co/${clientIP}/json/`)
      const ipData = await ipResponse.json()
      
      console.log('IP geolocation data:', ipData)
      
      if (ipData.country_code === 'IN') {
        region = 'in'
        countryCode = 'IN'
      } else {
        countryCode = ipData.country_code || 'unknown'
      }
    } catch (error) {
      console.error('Failed to detect country from IP:', error)
      // Fallback: check if IP starts with common Indian IP ranges
      if (clientIP.startsWith('103.') || 
          clientIP.startsWith('117.') || 
          clientIP.startsWith('182.') ||
          clientIP.startsWith('49.')) {
        region = 'in'
        countryCode = 'IN (estimated)'
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