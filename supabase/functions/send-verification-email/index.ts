import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'
import { PasswordResetEmail } from './_templates/password-reset-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_VERIFICATION_EMAIL_HOOK_SECRET') as string

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
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    console.log('Processing verification email request...')
    
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    // Try to verify webhook if secret is configured, otherwise parse directly
    let webhookData
    if (hookSecret) {
      try {
        const wh = new Webhook(hookSecret)
        webhookData = wh.verify(payload, headers) as {
          user: {
            email: string
            id: string
          }
          email_data: {
            token: string
            token_hash: string
            redirect_to: string
            email_action_type: string
            site_url: string
          }
        }
        console.log('Webhook verification successful')
      } catch (error) {
        console.log('Webhook verification failed, parsing payload directly:', error.message)
        webhookData = JSON.parse(payload)
      }
    } else {
      // Parse payload directly if no webhook secret
      webhookData = JSON.parse(payload)
    }

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = webhookData

    console.log(`Sending email to: ${user.email}`)
    console.log(`Email action type: ${email_action_type}`)

    let html: string
    let subject: string

    if (email_action_type === 'recovery') {
      // Password recovery email
      console.log('Rendering password reset email template...')
      html = await renderAsync(
        React.createElement(PasswordResetEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? 'https://xujaxssbncobmiwxbaxh.supabase.co',
          token,
          token_hash,
          redirect_to: redirect_to || 'https://ayushiaggarwal.tech/reset-password',
          email_action_type,
          user_email: user.email,
        })
      )
      subject = 'Reset Your Password'
    } else {
      // Verification email (signup)
      console.log('Rendering verification email template...')
      html = await renderAsync(
        React.createElement(VerificationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? 'https://xujaxssbncobmiwxbaxh.supabase.co',
          token,
          token_hash,
          redirect_to: redirect_to || `${Deno.env.get('SUPABASE_URL') ?? 'https://xujaxssbncobmiwxbaxh.supabase.co'}/dashboard`,
          email_action_type,
          user_email: user.email,
        })
      )
      subject = 'Welcome! Please verify your email address'
    }

    // Get sender information from secrets
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'hello@ayushiaggarwal.tech'
    const fromName = Deno.env.get('RESEND_FROM_NAME') || 'Tech With Ayushi Aggarwal'
    const fromAddress = `${fromName} <${fromEmail}>`

    console.log(`Sending email from: ${fromAddress}`)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: email_action_type === 'recovery' ? 'Password reset email sent successfully' : 'Verification email sent successfully',
        email_id: data?.id 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Failed to send email',
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
})