import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)
const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface ContactFormRequest {
  name: string
  email: string
  subject: string
  message: string
  referral_source?: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, email, subject, message, referral_source }: ContactFormRequest = await req.json()

    console.log("Processing contact form submission:", { name, email, subject, referral_source })

    // Store lead in database
    const { error: leadError } = await supabaseClient
      .from('leads')
      .insert({
        name,
        email,
        note: `Subject: ${subject}\n\nMessage: ${message}`,
        source: 'contact_form',
        referral_source: referral_source || null
      })

    if (leadError) {
      console.error("Error storing lead:", leadError)
      // Continue with email sending even if database insert fails
    }

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Contact Form <hello@ayushiaggarwal.tech>",
      to: ["ayushiaggarwaltech@gmail.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This email was sent from the contact form on your website.
        </p>
      `,
    })

    console.log("Admin email sent:", adminEmailResponse)

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Ayushi Aggarwal <hello@ayushiaggarwal.tech>",
      to: [email],
      subject: "Your message has been received!",
      html: `
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We have received your message and will get back to you as soon as possible.</p>
        
        <h3>Your Message Details:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        
        <p>If you need immediate assistance, please feel free to call us at +91-7973195812.</p>
        
        <p>Best regards,<br>
        Ayushi Aggarwal<br>
        <a href="mailto:hello@ayushiaggarwal.tech">hello@ayushiaggarwal.tech</a></p>
      `,
    })

    console.log("User confirmation email sent:", userEmailResponse)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Message sent successfully! You will receive a confirmation email shortly."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )
  } catch (error: any) {
    console.error("Error in contact-form function:", error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send message. Please try again later." 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    )
  }
}

serve(handler)