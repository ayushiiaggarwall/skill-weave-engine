import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { PasswordResetEmail } from './_templates/password-reset-email.tsx'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_VERIFICATION_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Password reset email webhook received')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method)
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Verifying webhook signature...')
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log('Webhook verified successfully for user:', user.email)
    console.log('Email action type:', email_action_type)

    // Only handle password recovery emails
    if (email_action_type !== 'recovery') {
      console.log('Not a password recovery email, skipping')
      return new Response(JSON.stringify({ message: 'Not a password recovery email' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    console.log('Fetching first name from profile...')
    let firstName = ''
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      )
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('name')
        .eq('email', user.email)
        .single()
      if (profile?.name) {
        firstName = profile.name.split(' ')[0]
      } else {
        firstName = user.email.split('@')[0].split(/[._-]/)[0]
      }
    } catch (e) {
      console.log('Profile lookup failed, falling back to email prefix')
      firstName = user.email.split('@')[0].split(/[._-]/)[0]
    }

    console.log('Rendering password reset email template...')
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
        user_email: user.email,
        first_name: firstName,
      })
    )

    console.log('Preparing plain text version for better deliverability...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const plainText = `Hi ${firstName || 'there'},\n\nWe received a request to reset your password for your Tech With Ayushi Aggarwal account.\n\nOpen this link to set up a new password:\n${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}\n\nIf you didn't request this, you can safely ignore this email, your account will remain secure.\n\nFor your security, this link will expire in 1 hour.\n\nThanks,\nAyushi Aggarwal & Team`

    console.log('Sending password reset email via Resend...')
    const { data, error } = await resend.emails.send({
      from: `${Deno.env.get('RESEND_FROM_NAME')} <${Deno.env.get('RESEND_FROM_EMAIL')}>`,
      to: [user.email],
      subject: 'Reset Your Password',
      html,
      text: plainText,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Password reset email sent successfully:', data)

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    console.error('Error in password reset email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})