import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-CREATE-ORDER] ${step}${detailsStr}`);
};

const getPayPalAccessToken = async (baseUrl: string, clientId: string, clientSecret: string) => {
  const auth = btoa(`${clientId}:${clientSecret}`);

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

    const { pathname } = new URL(req.url);
    if (req.method === "GET" && pathname.endsWith("/health")) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { email, coupon, pricingType = 'regular', courseId } = await req.json();
    logStep("Request received", { email, coupon, pricingType, courseId });

    // Get pricing from pay-price function
    const { data: priceData, error: priceError } = await supabaseClient.functions.invoke('pay-price', {
      body: { email: user.email, coupon, pricingType, courseId }
    });

    if (priceError) {
      throw new Error(`Failed to get pricing: ${priceError.message}`);
    }
    logStep("Pricing retrieved", priceData);

    // Determine PayPal-compatible pricing (fallback to international/USD if needed)
    let effectivePrice = priceData as any;
    if (priceData.currency !== "USD") {
      logStep("Currency not supported by PayPal gateway, refetching as USD", { originalCurrency: priceData.currency });
      const { data: intlPrice, error: intlErr } = await supabaseClient.functions.invoke('pay-price', {
        body: { email: user.email, coupon, regionOverride: 'intl', pricingType, courseId }
      });
      if (!intlErr && intlPrice?.currency === 'USD') {
        effectivePrice = intlPrice;
        logStep("Using international pricing for PayPal", { currency: effectivePrice.currency, amount: effectivePrice.amount, couponApplied: effectivePrice.couponApplied });
      } else {
        logStep("Failed to get international pricing, proceeding with original", { error: intlErr?.message });
      }
    }

    // Convert amount from cents to dollars for PayPal
    const amount = (effectivePrice.amount / 100).toFixed(2);
    const currency = (effectivePrice.currency || 'USD').toUpperCase();
    
    // Read PayPal secrets per-invocation
    const paypalEnv = (Deno.env.get("PAYPAL_ENV") || Deno.env.get("PAYPAL_CLIENT_ENV") || "sandbox").trim();
    const baseUrl = paypalEnv === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") || "").trim();
    const clientSecret = (Deno.env.get("PAYPAL_CLIENT_SECRET") || "").trim();

    logStep("PayPal secrets presence", { paypalEnv, hasClientId: !!clientId, hasClientSecret: !!clientSecret });

    if (!clientId || !clientSecret) {
      logStep("PayPal secrets missing");
      return new Response(JSON.stringify({ error: "Server not configured for PayPal" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);
    logStep("PayPal access token obtained", { paypalEnv });
    // Create PayPal order
    const normalizeBaseUrl = (url: string) => {
      let u = url.trim();
      if (!/^https?:\/\//i.test(u)) {
        u = `https://${u}`;
      }
      return u.replace(/\/+$/, '');
    };

    const rawBaseUrl = Deno.env.get("APP_BASE_URL") || req.headers.get("origin") || "";
    if (!rawBaseUrl) {
      throw new Error("APP_BASE_URL not configured and Origin header missing");
    }
    const appBaseUrl = normalizeBaseUrl(rawBaseUrl);
    logStep("Using app base URL", { appBaseUrl });

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount
        },
        description: "Course Enrollment"
      }],
      application_context: {
        return_url: `${appBaseUrl}/pay/success`,
        cancel_url: `${appBaseUrl}/pay/cancel`,
        user_action: "PAY_NOW",
        brand_name: "Tech With Ayushi"
      }
    };

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      let errorJson: any = null;
      try { errorJson = JSON.parse(errorText); } catch { /* ignore JSON parse */ }

      const isRestricted = !!(errorJson?.name === "UNPROCESSABLE_ENTITY" &&
        Array.isArray(errorJson?.details) &&
        errorJson.details.some((d: any) => d?.issue === "PAYEE_ACCOUNT_RESTRICTED"));

      if (isRestricted) {
        logStep("PayPal account restricted", { debug_id: errorJson?.debug_id });
        return new Response(JSON.stringify({ error: "PayPal order create failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503,
        });
      }

      logStep("PayPal order creation failed", { status: orderResponse.status, error: errorText });
      return new Response(JSON.stringify({ error: "PayPal order create failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      });
    }

    const order = await orderResponse.json();
    logStep("PayPal order created", { orderId: order.id });

    // Store order in database using service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService
      .from('order_enrollments')
      .insert({
        user_id: user.id,
        user_email: user.email,
        order_id: order.id,
        gateway: 'paypal',
        amount: effectivePrice.amount, // Use the effective price (which includes coupon discount)
        currency: effectivePrice.currency,
        status: 'pending',
        coupon_code: coupon
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      throw new Error(`Failed to store order: ${insertError.message}`);
    }

    logStep("Order stored in database");

    // Find approval URL
    const approvalUrl = order.links.find((link: any) => link.rel === "approve")?.href;
    
    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    return new Response(JSON.stringify({ approvalUrl }), {
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