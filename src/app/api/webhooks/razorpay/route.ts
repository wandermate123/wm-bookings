import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay-webhook-verify";

export const runtime = "nodejs";

/** Razorpay webhook JSON shape we care about (payment.captured). */
type PaymentEntity = {
  id?: string;
  order_id?: string;
  status?: string;
  amount?: number;
};

function parsePayload(body: unknown): { event: string; payment?: PaymentEntity } | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const event = typeof o.event === "string" ? o.event : "";
  const payload = o.payload;
  if (!payload || typeof payload !== "object") return { event, payment: undefined };
  const payWrap = (payload as Record<string, unknown>).payment;
  if (!payWrap || typeof payWrap !== "object") return { event, payment: undefined };
  const entity = (payWrap as Record<string, unknown>).entity;
  if (!entity || typeof entity !== "object") return { event, payment: undefined };
  const e = entity as PaymentEntity;
  return {
    event,
    payment: {
      id: e.id,
      order_id: e.order_id,
      status: e.status,
      amount: e.amount,
    },
  };
}

/**
 * Razorpay → `https://<your-domain>/api/webhooks/razorpay`
 * Dashboard: Settings → Webhooks → add URL, event `payment.captured`, copy signing secret → RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  const rawBody = await req.text();

  if (!verifyRazorpayWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, payment } = parsePayload(parsed) ?? { event: "" };
  if (event !== "payment.captured" || !payment) {
    return NextResponse.json({ ok: true, ignored: event || "unknown" });
  }

  const orderId = typeof payment.order_id === "string" ? payment.order_id : "";
  const paymentId = typeof payment.id === "string" ? payment.id : "";
  const status = typeof payment.status === "string" ? payment.status : "";
  const amountPaise = typeof payment.amount === "number" ? payment.amount : null;

  if (!orderId || !paymentId || status !== "captured") {
    return NextResponse.json({ ok: true, skipped: "incomplete payment payload" });
  }

  const booking = await prisma.booking.findUnique({
    where: { razorpayOrderId: orderId },
  });

  if (!booking) {
    console.warn("Webhook: no booking for order_id", orderId);
    return NextResponse.json({ ok: true, warning: "booking not found" });
  }

  const expectedPaise = Math.round(booking.totalInr * 100);
  if (amountPaise !== null && amountPaise !== expectedPaise) {
    console.error("Webhook: amount mismatch", {
      orderId,
      expectedPaise,
      got: amountPaise,
      reference: booking.reference,
    });
    return NextResponse.json({ ok: true, warning: "amount mismatch" });
  }

  if (booking.status === "paid") {
    if (booking.razorpayPaymentId === paymentId) {
      return NextResponse.json({ ok: true, idempotent: true });
    }
    console.error("Webhook: booking already paid with different payment", {
      reference: booking.reference,
      existing: booking.razorpayPaymentId,
      incoming: paymentId,
    });
    return NextResponse.json({ ok: true, warning: "already paid" });
  }

  try {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "paid",
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
      },
    });
  } catch (e) {
    console.error("Webhook: DB update failed", e);
    return NextResponse.json({ error: "persist failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reference: booking.reference });
}
