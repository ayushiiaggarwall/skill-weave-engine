import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    const signature = req.headers.get("stripe-signature");
    
    logStep("Request details", { 
      hasSignature: !!signature,
      bodyLength: body.length 
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    let event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    } else {
      event = JSON.parse(body);
      logStep("Webhook processed without signature verification");
    }

    logStep("Event received", { type: event.type, id: event.data.object.id });

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;
      const amountTotal = session.amount_total;
      const currency = session.currency;

      logStep("Checkout session completed", { sessionId, amountTotal, currency });

      // Update order status in database
      const { data: updateData, error: updateError } = await supabaseClient
        .from('order_enrollments')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', sessionId)
        .eq('gateway', 'stripe')
        .select();

      if (updateError) {
        logStep("Update error", updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      if (updateData && updateData.length > 0) {
        logStep("Order updated successfully", { sessionId, newStatus: 'paid' });
        
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
      } else {
        logStep("No order found to update", { sessionId });
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