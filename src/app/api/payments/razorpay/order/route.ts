import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay-server";

/** Create (or reuse) a Razorpay Order for a pending booking; amount is total in INR → paise. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || typeof (body as { reference?: unknown }).reference !== "string") {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }
  const reference = (body as { reference: string }).reference.trim();
  if (!reference) {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured (missing Razorpay keys)." },
      { status: 501 },
    );
  }

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ error: "Booking is not payable" }, { status: 400 });
  }

  const amountPaise = Math.round(booking.totalInr * 100);
  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    return NextResponse.json({ error: "Invalid payable amount" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID!;

  if (booking.razorpayOrderId) {
    return NextResponse.json({
      orderId: booking.razorpayOrderId,
      keyId,
      amount: amountPaise,
      currency: "INR",
    });
  }

  const rzp = getRazorpay();
  try {
    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: reference.slice(0, 40),
      notes: {
        reference,
        packageId: booking.packageId,
      },
    });

    await prisma.booking.update({
      where: { reference },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({
      orderId: order.id,
      keyId,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (e) {
    console.error("Razorpay order create failed", e);
    return NextResponse.json(
      { error: "Could not start payment. Try again or use WhatsApp." },
      { status: 503 },
    );
  }
}
