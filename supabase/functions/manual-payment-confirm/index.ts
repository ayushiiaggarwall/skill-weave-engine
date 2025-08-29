import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUAL-CONFIRM] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Manual payment confirmation started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId, paymentId } = await req.json();
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    logStep("Confirming payment", { orderId, paymentId });

    // Update order status to paid
    const { data: updateData, error: updateError } = await supabaseClient
      .from('order_enrollments')
      .update({
        status: 'paid',
        payment_id: paymentId || 'manual_confirm',
        paid_at: new Date().toISOString(),
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
      
      // Also update enrollment status if user exists
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

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment confirmed successfully",
        orderData: updateData[0]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("No order found to update", { orderId });
      throw new Error("No order found with this ID");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});