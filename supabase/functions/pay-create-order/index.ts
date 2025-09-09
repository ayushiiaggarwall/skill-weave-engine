import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  email: string;
  courseId?: string;
  coupon?: string;
  pricingType?: 'regular' | 'combo';
  regionOverride?: 'in' | 'intl';
}

interface CreateOrderResponse {
  orderId: string;
  keyId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ORDER] ${step}${detailsStr}`);
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

    const body: CreateOrderRequest = await req.json();
    const { email, courseId, coupon, pricingType = 'regular', regionOverride } = body;
    const courseTypeLabel = pricingType === 'combo' 
      ? "Builder's Program - Pro Track" 
      : "Builder's Program - Essential Track";

    // Get current pricing for India (respect override)
    const { data: priceData, error: priceError } = await supabaseClient.functions.invoke('pay-price', {
      body: {
        email,
        courseId,
        coupon,
        pricingType,
        regionOverride
      }
    });

    if (priceError) {
      throw new Error(`Failed to get pricing information: ${priceError.message}`);
    }
    logStep("Pricing calculated", priceData);

    // Create Razorpay order
    const rzpKeyId = Deno.env.get("RAZORPAY_KEY_ID") || Deno.env.get("RZP_KEY_ID") || "";
    const rzpKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || Deno.env.get("RZP_KEY_SECRET") || "";

    if (!rzpKeyId || !rzpKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Safe log to confirm which key id is used (last 6 chars only)
    logStep("Using Razorpay key", { keyPreview: rzpKeyId.slice(-6) });

    const razorpayAuth = btoa(`${rzpKeyId}:${rzpKeySecret}`);

    const orderData = {
      amount: priceData.amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: user.email,
        user_id: user.id,
        coupon_code: priceData.couponApplied?.code || null
      }
    };

    logStep("Creating Razorpay order", orderData);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      throw new Error(`Razorpay order creation failed: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();
    logStep("Razorpay order created", { orderId: razorpayOrder.id });

    // Store order in database
    const { error: insertError } = await supabaseClient
      .from('order_enrollments')
      .insert({
        user_email: user.email,
        user_id: user.id,
        course_id: courseId || null,
        course_type: pricingType === 'combo' ? 'combo' : 'course',
        gateway: 'razorpay',
        order_id: razorpayOrder.id,
        currency: 'INR',
        amount: priceData.amount,
        coupon_code: priceData.couponApplied?.code || null,
        status: 'pending'
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      throw new Error(`Failed to store order: ${insertError.message}`);
    }

    logStep("Order stored in database");

    const response: CreateOrderResponse = {
      orderId: razorpayOrder.id,
      keyId: rzpKeyId
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