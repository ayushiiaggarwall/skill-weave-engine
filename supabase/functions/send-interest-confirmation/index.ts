import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InterestConfirmationRequest {
  name: string;
  email: string;
  course: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { name, email, course }: InterestConfirmationRequest = await req.json();

    console.log(`Sending interest confirmation to ${email} for course: ${course}`);

    const courseDisplayName = course === 'combo' 
      ? '5-Week Course + 1:1 Mentorship Combo' 
      : '5-Week Idea to Product Course';

    const emailResponse = await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "Tech With Ayushi <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your interest in our course!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED; margin-bottom: 20px;">Thank you for your interest, ${name}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We see you're interested in our <strong>${courseDisplayName}</strong> and we're excited to have you join our community!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're currently working on making international payments available and will get back to you very soon with enrollment details.
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-bottom: 10px;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">We'll notify you as soon as international payments are live</li>
              <li style="margin-bottom: 8px;">You'll get priority access to enrollment</li>
              <li style="margin-bottom: 8px;">We'll send you course updates and valuable resources</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            In the meantime, feel free to follow us on social media for course updates and free learning content.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>Ayushi Aggarwal</strong><br>
            Tech With Ayushi Team
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 14px; color: #64748b;">
              This email was sent because you registered interest in our course at ayushiaggarwal.tech
            </p>
          </div>
        </div>
      `,
    });

    console.log("Interest confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-interest-confirmation function:", error);
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