import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUAL-ENROLLMENT-FIX] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { userEmail, orderId } = await req.json();
    
    if (!userEmail || !orderId) {
      throw new Error("userEmail and orderId are required");
    }

    logStep("Processing manual enrollment fix", { userEmail, orderId });

    // Update order status to paid
    const { data: updateData, error: updateError } = await supabaseClient
      .from('order_enrollments')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)
      .eq('order_id', orderId)
      .select();

    if (updateError) {
      logStep("Update error", updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    if (updateData && updateData.length > 0) {
      logStep("Order updated successfully", { orderId, newStatus: 'paid' });
      
      const enrollment = updateData[0];
      
      // If there's a user_id, also update their enrollment status
      if (enrollment.user_id) {
        const { error: enrollmentError } = await supabaseClient
          .from('enrollments')
          .upsert({
            user_id: enrollment.user_id,
            course_id: enrollment.course_id,
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
            ${enrollment.coupon_code ? `<li><strong>Coupon Applied:</strong> ${enrollment.coupon_code}</li>` : ''}
          </ul>
          <p>We're excited to have you onboard. You'll receive further instructions before the start date.</p>
        `

        const adminHtml = `
          <h3>Manual Enrollment Fix - New Enrollment</h3>
          <ul>
            <li><strong>User:</strong> ${userEmail}</li>
            <li><strong>Course:</strong> ${courseTitle}</li>
            <li><strong>Amount:</strong> ${currency === 'USD' ? '$' : '₹'}${amountMajor.toLocaleString()} (${currency})</li>
            <li><strong>Gateway:</strong> Razorpay</li>
            <li><strong>Order ID:</strong> ${orderId}</li>
            ${enrollment.coupon_code ? `<li><strong>Coupon Applied:</strong> ${enrollment.coupon_code}</li>` : ''}
          </ul>
          <p><em>Note: This enrollment was manually processed due to webhook failure.</em></p>
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
          subject: `Manual enrollment fix: ${courseTitle}`,
          html: adminHtml
        })

        logStep('Enrollment emails sent')
      } catch (emailErr) {
        logStep('Email send failed', emailErr)
      }
    } else {
      logStep("No order found to update", { userEmail, orderId });
      throw new Error("Order not found");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Enrollment fixed successfully",
      orderId: orderId,
      userEmail: userEmail
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