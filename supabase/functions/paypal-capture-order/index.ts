import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-CAPTURE] ${step}${detailsStr}`);
};

const getPayPalAccessToken = async () => {
  const clientId =
    Deno.env.get("PAYPAL_CLIENT_ID") ||
    Deno.env.get("PAYPAL_LIVE_CLIENT_ID") ||
    Deno.env.get("PAYPAL_CLIENTID");
  const clientSecret =
    Deno.env.get("PAYPAL_CLIENT_SECRET") ||
    Deno.env.get("PAYPAL_LIVE_CLIENT_SECRET") ||
    Deno.env.get("PAYPAL_SECRET") ||
    Deno.env.get("PAYPAL_CLIENTSECRET");
  
  if (!clientId || !clientSecret) {
    logStep("Missing PayPal credentials", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      tried: [
        "PAYPAL_CLIENT_ID",
        "PAYPAL_LIVE_CLIENT_ID",
        "PAYPAL_CLIENTID",
        "PAYPAL_CLIENT_SECRET",
        "PAYPAL_LIVE_CLIENT_SECRET",
        "PAYPAL_SECRET",
        "PAYPAL_CLIENTSECRET",
      ],
    });
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const paypalEnv =
    Deno.env.get("PAYPAL_ENV") ||
    Deno.env.get("PAYPAL_CLIENT_ENV") ||
    "sandbox"; // 'live' or 'sandbox'
  const baseUrl = paypalEnv === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get PayPal access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    logStep("Order capture requested", { orderId });

// Get PayPal access token
const accessToken = await getPayPalAccessToken();
const paypalEnv = Deno.env.get("PAYPAL_ENV") || Deno.env.get("PAYPAL_CLIENT_ENV") || "sandbox";
const baseUrl = paypalEnv === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";
logStep("PayPal access token obtained", { paypalEnv });

// Capture the PayPal order
const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

    if (!captureResponse.ok) {
      const errorData = await captureResponse.text();
      throw new Error(`PayPal capture failed: ${errorData}`);
    }

    const captureData = await captureResponse.json();
    logStep("PayPal order captured", { captureId: captureData.id, status: captureData.status });

    // Update order status in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: updateData, error: updateError } = await supabaseClient
      .from('order_enrollments')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('gateway', 'paypal')
      .select();

    if (updateError) {
      logStep("Update error", updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    if (updateData && updateData.length > 0) {
      logStep("Order updated successfully", { orderId, newStatus: 'paid' });
      
      // Update enrollment status
      const enrollment = updateData[0];
      if (enrollment.user_id) {
        const { error: enrollmentError } = await supabaseClient
          .from('enrollments')
          .upsert({
            user_id: enrollment.user_id,
            cohort_id: 'default',
            payment_status: 'completed'
          }, {
            onConflict: 'user_id'
          });

        if (enrollmentError) {
          logStep("Enrollment update error", enrollmentError);
        } else {
          logStep("Enrollment updated");
        }
      }

      // Send emails (welcome to user, notification to admin)
      try {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "")
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'hello@ayushiaggarwal.tech'
        const fromName = Deno.env.get('RESEND_FROM_NAME') || 'Tech With Ayushi Aggarwal'
        const fromAddress = `${fromName} <${fromEmail}>`

        const userEmail = enrollment.user_email as string
        const currency = (enrollment.currency as string) || 'USD'
        const amountMajor = typeof enrollment.amount === 'number' ? enrollment.amount / 100 : 0

        // Fetch course details
        let courseTitle = 'your course'
        let startDate: string | null = null
        let totalWeeks: number | null = null
        if (enrollment.course_id) {
          const { data: course } = await supabaseClient
            .from('courses')
            .select('title, start_date, total_weeks')
            .eq('id', enrollment.course_id)
            .single()
          if (course) {
            courseTitle = course.title
            startDate = course.start_date
            totalWeeks = course.total_weeks
          }
        }

        const userHtml = `
          <h2>Welcome to ${courseTitle}</h2>
          <p>Your enrollment is confirmed. Here are your details:</p>
          <ul>
            <li><strong>Course:</strong> ${courseTitle}</li>
            ${startDate ? `<li><strong>Start Date:</strong> ${startDate}</li>` : ''}
            ${totalWeeks ? `<li><strong>Total Weeks:</strong> ${totalWeeks}</li>` : ''}
            <li><strong>Amount Paid:</strong> ${currency.toUpperCase()} ${amountMajor.toLocaleString()}</li>
            <li><strong>Gateway:</strong> PayPal</li>
            <li><strong>Order ID:</strong> ${orderId}</li>
          </ul>
          <p>We're excited to have you onboard. You'll receive further instructions before the start date.</p>
        `

        const adminHtml = `
          <h3>New Enrollment</h3>
          <ul>
            <li><strong>User:</strong> ${userEmail}</li>
            <li><strong>Course:</strong> ${courseTitle}</li>
            <li><strong>Amount:</strong> ${currency.toUpperCase()} ${amountMajor.toLocaleString()}</li>
            <li><strong>Gateway:</strong> PayPal</li>
            <li><strong>Order ID:</strong> ${orderId}</li>
          </ul>
        `

        await resend.emails.send({
          from: fromAddress,
          to: [userEmail],
          subject: `Enrollment confirmed: ${courseTitle}`,
          html: userHtml
        })
        await resend.emails.send({
          from: fromAddress,
          to: ['ayushiaggarwaltech@gmail.com'],
          subject: `New enrollment: ${courseTitle}`,
          html: adminHtml
        })

        logStep('Enrollment emails sent')
      } catch (emailErr) {
        logStep('Email send failed', emailErr)
      }
    } else {
      logStep("No order found to update", { orderId });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      status: captureData.status,
      captureId: captureData.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});