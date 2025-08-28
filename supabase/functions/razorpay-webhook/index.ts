import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const log = (stage: string, obj?: unknown) => {
  const details = obj ? ` ${JSON.stringify(obj)}` : "";
  console.log(`[RZP-WEBHOOK] ${stage}${details}`);
};

const enc = new TextEncoder();
const verifySignature = async (raw: string, signature: string, secret: string) => {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(raw));
    const bytes = new Uint8Array(sig);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    return hex === signature;
  } catch (e) {
    log("sig-verify-error", { message: (e as Error).message });
    return false;
  }
};

const getRzpAuthHeader = () => {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID") || Deno.env.get("RZP_KEY_ID") || "";
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || Deno.env.get("RZP_KEY_SECRET") || "";
  if (!keyId || !keySecret) return null;
  const token = btoa(`${keyId}:${keySecret}`);
  return `Basic ${token}`;
};

const fetchPayment = async (paymentId: string) => {
  const auth = getRzpAuthHeader();
  if (!auth) return null; // optional confirm
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) return null;
  return await res.json();
};

const fetchOrderCapturedPayment = async (orderId: string) => {
  const auth = getRzpAuthHeader();
  if (!auth) return null;
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const payments = Array.isArray(data?.items) ? data.items : [];
  return payments.find((p: any) => p.status === "captured") || null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const secret =
      Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ||
      Deno.env.get("RZP_WEBHOOK_SECRET") ||
      "";

    if (!secret) {
      log("missing-webhook-secret");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (A) Verify signature
    const valid = await verifySignature(raw, signature, secret);
    if (!valid) {
      log("invalid-signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(raw);
    const eventId = String(event?.id || "");
    const type = String(event?.event || "");
    log("event-received", { id: eventId, type });

    // Idempotency: store event id and short-circuit if duplicate
    if (!eventId) {
      // No ID? Acknowledge but do nothing
      return new Response(JSON.stringify({ ok: true, reason: "no-event-id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertEventErr } = await supabase
      .from("payment_events")
      .insert({ event_id: eventId });

    if (insertEventErr) {
      // Conflict/duplicate should be skipped silently
      if ((insertEventErr as any).code === "23505") {
        log("duplicate-event", { eventId });
        return new Response(JSON.stringify({ ok: true, duplicate: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Other insertion errors
      log("event-insert-error", insertEventErr);
      return new Response(JSON.stringify({ ok: true, noted: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (B) Only handle specific events
    if (![
      "payment.captured",
      "order.paid",
      "payment.failed",
    ].includes(type)) {
      log("ignored-event", { type });
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract entities
    const paymentEntity = event?.payload?.payment?.entity || null;
    const orderEntity = event?.payload?.order?.entity || null;

    let razorpay_order_id: string | null = null;
    let payment_id: string | null = null;
    let amount_minor: number | null = null; // paise
    let currency: string | null = null;
    let status: string | null = null;
    let capturedFlag: boolean | null = null;

    if (type === "payment.captured" && paymentEntity) {
      razorpay_order_id = String(paymentEntity.order_id || "");
      payment_id = String(paymentEntity.id || "");
      amount_minor = typeof paymentEntity.amount === "number" ? paymentEntity.amount : null;
      currency = paymentEntity.currency || null;
      status = paymentEntity.status || null;
      capturedFlag = Boolean(paymentEntity.captured);
    } else if (type === "order.paid" && orderEntity) {
      razorpay_order_id = String(orderEntity.id || "");
      amount_minor = typeof orderEntity.amount === "number" ? orderEntity.amount : null;
      currency = orderEntity.currency || null;
      status = "paid";
      capturedFlag = true;

      // Try to fetch captured payment for this order to get payment_id
      const confirmed = await fetchOrderCapturedPayment(razorpay_order_id);
      if (confirmed) {
        payment_id = String(confirmed.id || "");
      }
    } else if (type === "payment.failed" && paymentEntity) {
      razorpay_order_id = String(paymentEntity.order_id || "");
      payment_id = String(paymentEntity.id || "");
      amount_minor = typeof paymentEntity.amount === "number" ? paymentEntity.amount : null;
      currency = paymentEntity.currency || null;
      status = paymentEntity.status || null; // 'failed'
      capturedFlag = false;
    }

    if (!razorpay_order_id) {
      log("no-order-id", { type });
      return new Response(JSON.stringify({ ok: true, reason: "no-order-id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (D) Match local order
    const { data: localOrders, error: fetchOrderErr } = await supabase
      .from("order_enrollments")
      .select("id, order_id, amount, currency, status, gateway")
      .eq("order_id", razorpay_order_id)
      .eq("gateway", "razorpay")
      .limit(1);

    if (fetchOrderErr) {
      log("local-order-fetch-error", fetchOrderErr);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!localOrders || localOrders.length === 0) {
      log("no-local-order", { razorpay_order_id });
      return new Response(JSON.stringify({ ok: true, reason: "no-local-order" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const local = localOrders[0];

    // (H) Only change from pending
    if (local.status !== "pending") {
      log("order-not-pending", { status: local.status });
      return new Response(JSON.stringify({ ok: true, reason: "not-pending" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "payment.failed") {
      // Mark failed, but never paid
      const { error: failErr } = await supabase
        .from("order_enrollments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", local.id)
        .eq("status", "pending");

      if (failErr) log("fail-update-error", failErr);
      return new Response(JSON.stringify({ ok: true, failed: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (E) Must be captured/paid
    const isCapturedEvent =
      (type === "payment.captured" && status === "captured" && capturedFlag === true) ||
      (type === "order.paid");

    if (!isCapturedEvent) {
      log("not-captured", { type, status, capturedFlag });
      return new Response(JSON.stringify({ ok: true, reason: "not-captured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (F) Amount & currency guard (local amounts are stored in minor units already)
    if (
      typeof amount_minor !== "number" ||
      amount_minor !== local.amount ||
      (currency && local.currency && String(currency) !== String(local.currency))
    ) {
      log("amount-currency-mismatch", {
        webhook_amount: amount_minor,
        local_amount: local.amount,
        webhook_currency: currency,
        local_currency: local.currency,
      });
      return new Response(JSON.stringify({ ok: true, reason: "mismatch" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // (I) Optional server-to-server confirm
    if (payment_id) {
      const confirm = await fetchPayment(payment_id);
      if (confirm) {
        const ok =
          confirm.status === "captured" &&
          confirm.order_id === razorpay_order_id &&
          Number(confirm.amount) === Number(amount_minor);
        if (!ok) {
          log("server-confirm-failed", {
            status: confirm?.status,
            order_id: confirm?.order_id,
            amount: confirm?.amount,
          });
          return new Response(JSON.stringify({ ok: true, reason: "server-confirm-mismatch" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // All checks passed → mark paid
    const { error: updateErr } = await supabase
      .from("order_enrollments")
      .update({
        status: "paid",
        payment_id: payment_id ?? null,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", local.id)
      .eq("status", "pending");

    if (updateErr) {
      log("order-update-error", updateErr);
      return new Response(JSON.stringify({ ok: true, updated: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("order-marked-paid", { id: local.id, razorpay_order_id, payment_id });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log("handler-error", { message: (e as Error).message });
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
