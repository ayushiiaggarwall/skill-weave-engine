import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RAZORPAY-WEBHOOK] ${step}${detailsStr}`);
};

const verifySignature = async (body: string, signature: string, secret: string): Promise<boolean> => {
  try {
    const expectedSignature = await createHmac("sha256", secret).update(body).digest("hex");
    return expectedSignature === signature;
  } catch (error) {
    logStep("Signature verification error", error);
    return false;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    
    logStep("Request details", { 
      hasSignature: !!signature,
      bodyLength: body.length 
    });

    // Verify signature if webhook secret is configured
    const webhookSecret = Deno.env.get("RZP_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      const isValid = await verifySignature(body, signature, webhookSecret);
      if (!isValid) {
        logStep("Invalid signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      logStep("Signature verified");
    }

    const event = JSON.parse(body);
    logStep("Event parsed", { event: event.event, entity: event.payload?.payment?.entity || 'unknown' });

    // Handle payment captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount;

      logStep("Payment captured", { orderId, paymentId, amount });

      // Update order status in database
      const { data: updateData, error: updateError } = await supabaseClient
        .from('order_enrollments')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('gateway', 'razorpay')
        .select();

      if (updateError) {
        logStep("Update error", updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      if (updateData && updateData.length > 0) {
        logStep("Order updated successfully", { orderId, newStatus: 'paid' });
        
        // If there's a user_id, also update their enrollment status
        const enrollment = updateData[0];
        if (enrollment.user_id) {
          const { error: enrollmentError } = await supabaseClient
            .from('enrollments')
            .upsert({
              user_id: enrollment.user_id,
              cohort_id: 'default', // You might want to get this from somewhere
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
          const currency = (enrollment.currency as string) || 'INR'
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
              <li><strong>Amount Paid:</strong> ${currency === 'USD' ? '$' : '₹'}${amountMajor.toLocaleString()}</li>
              <li><strong>Gateway:</strong> Razorpay</li>
              <li><strong>Order ID:</strong> ${orderId}</li>
            </ul>
            <p>We're excited to have you onboard. You'll receive further instructions before the start date.</p>
          `

          const adminHtml = `
            <h3>New Enrollment</h3>
            <ul>
              <li><strong>User:</strong> ${userEmail}</li>
              <li><strong>Course:</strong> ${courseTitle}</li>
              <li><strong>Amount:</strong> ${currency === 'USD' ? '$' : '₹'}${amountMajor.toLocaleString()} (${currency})</li>
              <li><strong>Gateway:</strong> Razorpay</li>
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
    }

    return new Response(JSON.stringify({ received: true }), {
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