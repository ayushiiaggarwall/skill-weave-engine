import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceRequest {
  email: string;
  courseId?: string;
  regionOverride?: 'in' | 'intl';
  earlyOverride?: boolean;
  coupon?: string;
  pricingType?: 'regular' | 'combo';
}

interface PriceResponse {
  region: 'in' | 'intl';
  currency: 'INR' | 'USD';
  amount: number;
  display: string;
  earlyBird: boolean;
  couponApplied?: {
    code: string;
    type: string;
    value: number;
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAY-PRICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body: PriceRequest = await req.json();
    const { email, courseId, regionOverride, earlyOverride, coupon, pricingType = 'regular' } = body;

    logStep("Request received", { email, courseId, regionOverride, earlyOverride, coupon, pricingType });

    // Determine region
    let region: 'in' | 'intl' = 'intl';
    if (regionOverride) {
      region = regionOverride;
    } else {
      // Detect from headers and email domain
      const cfCountry = req.headers.get('cf-ipcountry');
      const vercelCountry = req.headers.get('x-vercel-ip-country');
      const country = cfCountry || vercelCountry;
      
      // Check for Indian email domains or country headers
      const indianEmailDomains = ['gmail.com', 'yahoo.in', 'hotmail.in', 'rediffmail.com'];
      const emailDomain = email.split('@')[1];
      const hasIndianEmail = email.includes('india') || email.includes('delhi') || email.includes('mumbai') || email.includes('bangalore') || email.includes('chennai') || email.includes('hyderabad') || email.includes('pune') || email.includes('aggarwal') || email.includes('sharma') || email.includes('kumar') || email.includes('singh');
      
      if (country === 'IN' || hasIndianEmail) {
        region = 'in';
      }
    }

    logStep("Region determined", { region });

    // Get course and pricing from database
    let courseData = null;
    let coursePricing = null;

    if (courseId) {
      const { data: course, error: courseError } = await supabaseClient
        .from('courses')
        .select('id, title, is_active')
        .eq('id', courseId)
        .eq('is_active', true)
        .single();

      if (courseError || !course) {
        throw new Error(`Course not found or inactive: ${courseError?.message}`);
      }
      
      courseData = course;

      const { data: pricing, error: pricingError } = await supabaseClient
        .from('course_pricing')
        .select('*')
        .eq('course_id', courseId)
        .single();

      if (pricingError || !pricing) {
        throw new Error(`Course pricing not found: ${pricingError?.message}`);
      }
      
      coursePricing = pricing;
    } else {
      // Get the first active course if no courseId provided
      const { data: course, error: courseError } = await supabaseClient
        .from('courses')
        .select('id, title, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (courseError || !course) {
        throw new Error(`No active course found: ${courseError?.message}`);
      }
      
      courseData = course;

      const { data: pricing, error: pricingError } = await supabaseClient
        .from('course_pricing')
        .select('*')
        .eq('course_id', course.id)
        .single();

      if (pricingError || !pricing) {
        throw new Error(`Course pricing not found: ${pricingError?.message}`);
      }
      
      coursePricing = pricing;
    }

    logStep("Course and pricing fetched", { courseData, coursePricing });

    // Determine if early bird is active
    let isEarlyBird = false;
    if (earlyOverride !== undefined) {
      isEarlyBird = earlyOverride;
    } else if (coursePricing.is_early_bird_active && coursePricing.early_bird_end_date) {
      const endTime = new Date(coursePricing.early_bird_end_date).getTime();
      const now = new Date().getTime();
      isEarlyBird = now < endTime;
    }

    logStep("Early bird status determined", { isEarlyBird });

    // Get base price from course pricing
    let amount: number;
    let currency: 'INR' | 'USD';
    let symbol: string;

    if (region === 'in') {
      currency = 'INR';
      symbol = '₹';
      amount = isEarlyBird ? coursePricing.inr_early_bird * 100 : coursePricing.inr_regular * 100;
    } else {
      currency = 'USD';
      symbol = '$';
      amount = isEarlyBird ? coursePricing.usd_early_bird * 100 : coursePricing.usd_regular * 100;
    }

    logStep("Base price calculated", { amount, currency, isEarlyBird });

    // Apply coupon if provided
    let couponApplied;
    if (coupon) {
      const { data: couponData, error: couponError } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('code', coupon.toUpperCase())
        .eq('active', true)
        .single();

      if (!couponError && couponData) {
        logStep("Coupon found", couponData);

        if (couponData.type === 'percent') {
          amount = Math.floor(amount * (100 - couponData.value) / 100);
        } else if (couponData.type === 'flat') {
          amount = Math.max(amount - couponData.value, 0);
        }

        couponApplied = {
          code: couponData.code,
          type: couponData.type,
          value: couponData.value
        };

        logStep("Coupon applied", { couponApplied, newAmount: amount });
      } else {
        logStep("Coupon not found or inactive", { coupon });
      }
    }

    // Format display amount
    const displayAmount = currency === 'INR' ? amount / 100 : amount / 100;
    const display = `${symbol}${displayAmount.toLocaleString()}`;

    const response: PriceResponse = {
      region,
      currency,
      amount,
      display,
      earlyBird: isEarlyBird,
      couponApplied
    };

    logStep("Response prepared", response);

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