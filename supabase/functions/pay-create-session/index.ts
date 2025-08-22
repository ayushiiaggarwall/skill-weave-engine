import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateSessionRequest {
  email: string;
  coupon?: string;
}

interface CreateSessionResponse {
  sessionId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SESSION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const body: CreateSessionRequest = await req.json();
    const { email, coupon } = body;

    // Get current pricing for International
    const priceResponse = await fetch(`${req.headers.get("origin")}/api/pay/price` || `${Deno.env.get("APP_BASE_URL")}/api/pay/price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        email,
        regionOverride: 'intl',
        coupon
      })
    });

    if (!priceResponse.ok) {
      throw new Error('Failed to get pricing information');
    }

    const priceData = await priceResponse.json();
    logStep("Pricing calculated", priceData);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    logStep("Customer lookup completed", { customerId });

    // Create checkout session
    const baseUrl = req.headers.get("origin") || Deno.env.get("APP_BASE_URL") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "5-Week No-Code to Product Course",
              description: "Complete course with live classes, projects, and lifetime access"
            },
            unit_amount: priceData.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay/cancel`,
      metadata: {
        user_id: user.id,
        coupon_code: priceData.couponApplied?.code || ''
      }
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Store order in database
    const { error: insertError } = await supabaseClient
      .from('order_enrollments')
      .insert({
        user_email: user.email,
        user_id: user.id,
        gateway: 'stripe',
        order_id: session.id,
        currency: 'USD',
        amount: priceData.amount,
        coupon_code: priceData.couponApplied?.code || null,
        status: 'pending'
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      throw new Error(`Failed to store order: ${insertError.message}`);
    }

    logStep("Order stored in database");

    const response: CreateSessionResponse = {
      sessionId: session.id
    };

    return new Response(JSON.stringify(response), {
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