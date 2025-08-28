import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payloadText = await req.text()
    const headers = Object.fromEntries(req.headers)

    // Parse event payload (Resend events typically provide { type, data, created_at })
    let event: any
    try {
      event = JSON.parse(payloadText)
    } catch (e) {
      console.error('Failed to parse webhook payload as JSON')
      return new Response('Bad Request', { status: 400, headers: corsHeaders })
    }

    const type = event?.type || event?.event || 'unknown'
    const data = event?.data || {}
    const createdAt = event?.created_at || new Date().toISOString()

    const emailId = data?.id || data?.email?.id || data?.message_id || 'unknown'
    const to = Array.isArray(data?.to) ? data?.to.join(',') : (data?.to || '')
    const subject = data?.subject || ''

    // Log concise line for quick scanning in logs
    console.log(`Resend event: type=${type} emailId=${emailId} to=${to} subject="${subject}" at=${createdAt}`)

    // Optionally, store recent critical events to DB in future (kept simple per request)
    // If you later want persistence, we can insert here using the service role key.

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    console.error('Error handling Resend events webhook:', error)
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
