import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkshopConfirmationRequest {
  name: string;
  email: string;
  workshopTitle: string;
  workshopDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, workshopTitle, workshopDate }: WorkshopConfirmationRequest = await req.json();

    console.log("Sending workshop confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: `${Deno.env.get("RESEND_FROM_NAME")} <${Deno.env.get("RESEND_FROM_EMAIL")}>`,
      to: [email],
      subject: `🎉 Workshop Enrollment Confirmed - ${workshopTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">🎉 You're Enrolled!</h1>
            <h2 style="color: #666; font-weight: normal; margin-top: 0;">${workshopTitle}</h2>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: white;">Hi ${name}! 👋</h3>
            <p style="margin-bottom: 0; color: white;">Welcome to our AI Vibe-Coding Bootcamp! You're all set for an amazing learning experience.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Workshop Details:</h3>
            <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${workshopDate}</p>
            <p style="margin: 5px 0;"><strong>⏱️ Duration:</strong> 3 hours</p>
            <p style="margin: 5px 0;"><strong>💻 Format:</strong> Live Online Workshop</p>
            <p style="margin: 5px 0;"><strong>🎯 What you'll learn:</strong> Build AI products end-to-end without coding</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #2d5a2d; margin-top: 0;">What's Next?</h3>
            <ul style="color: #2d5a2d; margin: 0; padding-left: 20px;">
              <li>You'll receive the workshop link 24 hours before the event</li>
              <li>Make sure to have a stable internet connection</li>
              <li>Bring your creativity and enthusiasm!</li>
              <li>Prepare to be amazed by what you can build</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin: 0;">We're excited to see you at the workshop!</p>
            <p style="color: #666; margin: 5px 0 0 0;">If you have any questions, feel free to reply to this email.</p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 14px;">
            <p style="margin: 0;">AI Vibe-Coding Bootcamp Team</p>
            <p style="margin: 5px 0 0 0;">Building the future, one workshop at a time 🚀</p>
          </div>
        </div>
      `,
    });

    console.log("Workshop confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-workshop-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);