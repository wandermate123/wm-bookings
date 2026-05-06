"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { applyCheckoutTax, CHECKOUT_TAX_RATE } from "@/lib/checkout-tax";
import type { MultiDayPackageVariant } from "@/lib/multi-day-types";
import { formatInr } from "@/lib/spiritual-triangle";
import {
  buildMultiDayWhatsAppMessage,
  getWhatsAppBookingUrl,
} from "@/lib/whatsapp-booking";

const SPECIAL_REQUESTS_MAX_LEN = 2000;
const TAX_LABEL = `Tax (${Math.round(CHECKOUT_TAX_RATE * 100)}%)`;

function addDaysISO(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load payment script."));
    document.body.appendChild(s);
  });
}

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCtor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, fn: (payload: { error?: { description?: string } }) => void) => void;
};

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.63 0 5.104 1.026 6.957 2.885 1.85 1.85 2.873 4.323 2.872 6.954 0 5.452-4.432 9.888-9.888 9.888m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export type MultiDayPackageBookingProps = {
  variants: readonly MultiDayPackageVariant[];
  variantSlug: string;
  /** e.g. `/book/spiritual-triangle` — pills link here + `/${variantSlug}` */
  familyBasePath: string;
  durationPickerAriaLabel: string;
};

export function MultiDayPackageBooking({
  variants,
  variantSlug,
  familyBasePath,
  durationPickerAriaLabel,
}: MultiDayPackageBookingProps) {
  const bookingPkg = useMemo(
    () => variants.find((v) => v.variantSlug === variantSlug),
    [variants, variantSlug],
  );

  const [tripStart, setTripStart] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    reference: string;
    tripEnd: string;
    subtotalInr: number;
    taxInr: number;
    totalInr: number;
    packageLabel: string;
    /** Razorpay keys missing — booking still saved */
    paymentSkipped?: boolean;
    /** Checkout closed / pay not completed — booking still saved */
    paymentPendingNote?: boolean;
    /** Client-side payment id — confirm only after webhook (Step 4) */
    razorpayPaymentId?: string;
  } | null>(null);

  const tripEnd =
    tripStart && bookingPkg ? addDaysISO(tripStart, bookingPkg.tripDays - 1) : "";

  const pricing = useMemo(() => {
    if (!bookingPkg) {
      return {
        packageTotal: 0,
        addOnTotal: 0,
        subtotalInr: 0,
        taxInr: 0,
        totalInr: 0,
      };
    }
    const childFactor = bookingPkg.childPriceFactor;
    const packageTotal =
      adults * bookingPkg.pricePerAdultInr + children * bookingPkg.pricePerAdultInr * childFactor;
    let addOnTotal = 0;
    for (const a of bookingPkg.addOns) {
      if (addOns[a.id]) addOnTotal += a.pricePerBookingInr;
    }
    const rawSubtotal = packageTotal + addOnTotal;
    const { subtotalInr, taxInr, totalInr } = applyCheckoutTax(rawSubtotal);
    return {
      packageTotal,
      addOnTotal,
      subtotalInr,
      taxInr,
      totalInr,
    };
  }, [bookingPkg, adults, children, addOns]);

  const whatsappHref = useMemo(() => {
    if (!bookingPkg) return null;
    const message = buildMultiDayWhatsAppMessage(bookingPkg, {
      tripStart: tripStart || "—",
      tripEnd: tripEnd || "—",
      adults,
      children,
      addOns,
      subtotalInr: pricing.subtotalInr,
      taxInr: pricing.taxInr,
      totalInr: pricing.totalInr,
      guestName,
      email,
      phone,
      specialRequests,
    });
    return getWhatsAppBookingUrl(message);
  }, [
    bookingPkg,
    tripStart,
    tripEnd,
    adults,
    children,
    addOns,
    pricing.subtotalInr,
    pricing.taxInr,
    pricing.totalInr,
    guestName,
    email,
    phone,
    specialRequests,
  ]);

  const toggleAddOn = (id: string) => {
    setAddOns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingPkg) return;
    setError(null);
    setSubmitting(true);
    let checkoutOpened = false;
    try {
      const addOnIds = Object.entries(addOns)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: bookingPkg.id,
          tripStart,
          adults,
          children,
          addOnIds,
          guestName,
          email,
          phone,
          specialRequests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong");
        return;
      }

      const bookingPayload = {
        reference: data.reference as string,
        tripEnd: data.tripEnd as string,
        subtotalInr: data.subtotalInr as number,
        taxInr: data.taxInr as number,
        totalInr: data.totalInr as number,
        packageLabel: typeof data.package === "string" ? data.package : bookingPkg.title,
      };

      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: bookingPayload.reference }),
      });
      const orderJson = await orderRes.json();

      if (orderRes.status === 501) {
        setResult({ ...bookingPayload, paymentSkipped: true });
        return;
      }

      if (!orderRes.ok) {
        setError(typeof orderJson.error === "string" ? orderJson.error : "Could not start payment.");
        setResult({ ...bookingPayload, paymentPendingNote: true });
        return;
      }

      checkoutOpened = true;
      await loadRazorpayScript();
      const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;

      const options: Record<string, unknown> = {
        key: orderJson.keyId as string,
        amount: orderJson.amount as number,
        currency: (orderJson.currency as string) ?? "INR",
        order_id: orderJson.orderId as string,
        name: "WanderMate",
        description: `Booking ${bookingPayload.reference}`,
        prefill: {
          name: guestName.trim(),
          email: email.trim(),
          contact: phone.replace(/\D/g, ""),
        },
        theme: { color: "#0f2744" },
        handler(rzpResponse: RazorpaySuccess) {
          setSubmitting(false);
          setResult({
            ...bookingPayload,
            razorpayPaymentId: rzpResponse.razorpay_payment_id,
          });
        },
        modal: {
          ondismiss() {
            setSubmitting(false);
            setResult({
              ...bookingPayload,
              paymentPendingNote: true,
            });
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", (payload) => {
        setSubmitting(false);
        setError(payload.error?.description ?? "Payment failed.");
        setResult({
          ...bookingPayload,
          paymentPendingNote: true,
        });
      });
      rzp.open();
    } catch {
      setError("Network error — try again.");
    } finally {
      if (!checkoutOpened) {
        setSubmitting(false);
      }
    }
  }

  if (result) {
    return (
      <div className="rounded-sm border border-black/10 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-wm-navy/60">
          Received
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-wm-navy sm:text-3xl">
          Booking saved
        </h2>
        <p className="mt-2 text-sm text-wm-navy-deep/80">
          Reference{" "}
          <span className="font-mono font-semibold text-wm-navy-deep">{result.reference}</span>
        </p>
        <p className="mt-4 space-y-1 text-sm text-wm-navy-deep/80">
          <span className="block">
            {result.packageLabel}: {tripStart} → {result.tripEnd}
          </span>
          <span className="flex justify-center gap-4 text-xs text-wm-navy-deep/70">
            <span>Subtotal {formatInr(result.subtotalInr)}</span>
            <span>
              {TAX_LABEL} {formatInr(result.taxInr)}
            </span>
          </span>
        </p>
        <p className="mt-3 font-display text-xl font-semibold text-wm-navy">
          Total {formatInr(result.totalInr)}
        </p>
        <p className="mt-6 text-xs text-wm-navy-deep/60">
          {result.razorpayPaymentId ? (
            <>
              Payment ID{" "}
              <span className="font-mono">{result.razorpayPaymentId}</span> — your bank may still be
              processing. We will mark the booking paid only after verification (webhook).
            </>
          ) : result.paymentSkipped ? (
            <>
              Card/UPI checkout is not configured on the server. Your booking is saved — pay or
              confirm via WhatsApp below.
            </>
          ) : result.paymentPendingNote ? (
            <>Payment was not completed. Your booking is saved — use the reference above or WhatsApp.</>
          ) : (
            <>
              A confirmation email will be sent once payment gateway + email are connected.
            </>
          )}
        </p>
      </div>
    );
  }

  if (!bookingPkg) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-sm border border-black/10 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10"
    >
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-wm-navy/70">
        Book online
      </p>
      <nav className="mt-3 flex flex-wrap gap-2" aria-label={durationPickerAriaLabel}>
        {variants.map((v) => (
          <Link
            key={v.variantSlug}
            href={`${familyBasePath}/${v.variantSlug}`}
            scroll={false}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition sm:text-sm ${
              v.variantSlug === bookingPkg.variantSlug
                ? "bg-wm-navy text-white"
                : "border border-wm-navy/20 text-wm-navy-deep hover:border-wm-orange/50 hover:text-wm-navy"
            }`}
          >
            {v.pillLabel}
          </Link>
        ))}
      </nav>
      <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-wm-navy sm:text-3xl">
        {bookingPkg.title}
      </h1>
      <p className="mt-1 text-sm text-wm-blue">{bookingPkg.routeLabel}</p>
      <p className="mt-2 text-sm text-wm-navy-deep/80">{bookingPkg.durationLabel}</p>
      <p className="mt-4 font-display text-lg font-medium text-wm-navy">
        From {formatInr(bookingPkg.pricePerAdultInr)}{" "}
        <span className="text-sm font-sans font-normal text-wm-navy-deep/70">per adult</span>
      </p>

      <div className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Trip start
            </span>
            <input
              type="date"
              required
              min={todayISO()}
              value={tripStart}
              onChange={(e) => setTripStart(e.target.value)}
              className="mt-1 w-full rounded border border-wm-navy/20 bg-white px-3 py-2.5 text-sm text-wm-navy-deep outline-none ring-wm-orange/30 focus:border-wm-orange focus:ring-2"
            />
          </label>
          <div className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Trip end
            </span>
            <div className="mt-1 flex min-h-[42px] items-center rounded border border-dashed border-wm-navy/20 bg-wm-footer/40 px-3 py-2.5 text-sm text-wm-navy-deep/80">
              {tripEnd || "—"}
            </div>
            <p className="mt-1 text-xs text-wm-navy-deep/55">
              Auto from {bookingPkg.durationLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Adults
            </span>
            <input
              type="number"
              required
              min={bookingPkg.minAdults}
              max={bookingPkg.maxPax}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="mt-1 w-full rounded border border-wm-navy/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-wm-orange focus:ring-2 focus:ring-wm-orange/30"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Children (5–11)
            </span>
            <input
              type="number"
              min={0}
              max={bookingPkg.maxPax}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="mt-1 w-full rounded border border-wm-navy/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-wm-orange focus:ring-2 focus:ring-wm-orange/30"
            />
            <p className="mt-1 text-xs text-wm-navy-deep/55">
              Priced at {Math.round(bookingPkg.childPriceFactor * 100)}% of adult — adjust in
              config.
            </p>
          </label>
        </div>

        <fieldset>
          <legend className="mb-3 text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
            Add-ons
          </legend>
          <ul className="space-y-3">
            {bookingPkg.addOns.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer gap-3 rounded border border-wm-navy/10 bg-wm-footer/30 px-3 py-3 transition hover:border-wm-navy/25">
                  <input
                    type="checkbox"
                    checked={!!addOns[a.id]}
                    onChange={() => toggleAddOn(a.id)}
                    className="mt-1 h-4 w-4 rounded border-wm-navy/30 text-wm-orange focus:ring-wm-orange"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-wm-navy-deep">{a.label}</span>
                    <span className="mt-0.5 block text-xs text-wm-navy-deep/65">
                      {a.description}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-sm font-semibold text-wm-navy">
                    {formatInr(a.pricePerBookingInr)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Full name
            </span>
            <input
              type="text"
              required
              autoComplete="name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mt-1 w-full rounded border border-wm-navy/20 px-3 py-2.5 text-sm outline-none focus:border-wm-orange focus:ring-2 focus:ring-wm-orange/30"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-wm-navy/20 px-3 py-2.5 text-sm outline-none focus:border-wm-orange focus:ring-2 focus:ring-wm-orange/30"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
              Phone
            </span>
            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 "
              className="mt-1 w-full rounded border border-wm-navy/20 px-3 py-2.5 text-sm outline-none focus:border-wm-orange focus:ring-2 focus:ring-wm-orange/30"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-wm-navy-deep/70">
            Special requests{" "}
            <span className="font-normal normal-case text-wm-navy-deep/50">(optional)</span>
          </span>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value.slice(0, SPECIAL_REQUESTS_MAX_LEN))}
            maxLength={SPECIAL_REQUESTS_MAX_LEN}
            rows={4}
            placeholder="Dietary needs, mobility, guide language, pickup details, anniversaries, temple priorities…"
            className="mt-1 w-full resize-y rounded border border-wm-navy/20 px-3 py-2.5 text-sm text-wm-navy-deep outline-none placeholder:text-wm-navy-deep/40 focus:border-wm-orange focus:ring-2 focus:ring-wm-orange/30"
          />
          <p className="mt-1 text-right text-xs text-wm-navy-deep/50">
            {specialRequests.length} / {SPECIAL_REQUESTS_MAX_LEN}
          </p>
        </label>
      </div>

      <div className="mt-8 border-t border-wm-navy/10 pt-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-wm-navy-deep/75">
            <span>Package</span>
            <span className="font-medium text-wm-navy-deep tabular-nums">
              {formatInr(pricing.packageTotal)}
            </span>
          </div>
          {pricing.addOnTotal > 0 && (
            <div className="flex justify-between gap-4 text-wm-navy-deep/75">
              <span>Add-ons</span>
              <span className="font-medium text-wm-navy-deep tabular-nums">
                {formatInr(pricing.addOnTotal)}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-wm-navy/10 pt-2 text-wm-navy-deep">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums">{formatInr(pricing.subtotalInr)}</span>
          </div>
          <div className="flex justify-between gap-4 text-wm-navy-deep/75">
            <span>{TAX_LABEL}</span>
            <span className="font-medium text-wm-navy-deep tabular-nums">
              {formatInr(pricing.taxInr)}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-4 border-t border-wm-navy/10 pt-4">
          <span className="font-display text-xl font-semibold text-wm-navy">Total</span>
          <span className="font-display text-xl font-semibold text-wm-navy tabular-nums">
            {formatInr(pricing.totalInr)}
          </span>
        </div>
        {adults + children > bookingPkg.maxPax && (
          <p className="mt-3 text-sm text-red-600">
            Maximum {bookingPkg.maxPax} travellers for this package online.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || adults + children > bookingPkg.maxPax || !tripStart}
          className="mt-6 w-full rounded bg-wm-orange py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-wm-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Processing…" : "Pay & confirm"}
        </button>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded border-2 border-[#25D366] bg-[#25D366]/10 py-3.5 text-sm font-semibold text-[#075E54] transition hover:bg-[#25D366]/20"
          >
            <WhatsAppGlyph className="h-5 w-5 shrink-0" aria-hidden />
            Book via WhatsApp
          </a>
        ) : (
          process.env.NODE_ENV === "development" && (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
              WhatsApp: set{" "}
              <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER</code> in{" "}
              <code className="rounded bg-white/80 px-1">.env.local</code> (see{" "}
              <code className="rounded bg-white/80 px-1">.env.example</code>).
            </p>
          )
        )}
        <p className="mt-3 text-center text-xs text-wm-navy-deep/55">
          Payment gateway hooks to Razorpay (or similar) next — this demo confirms the booking after
          server validation.
        </p>
      </div>
    </form>
  );
}
