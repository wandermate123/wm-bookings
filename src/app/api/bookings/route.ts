import { NextResponse } from "next/server";
import { getBookablePackageById } from "@/lib/all-packages";
import { applyCheckoutTax } from "@/lib/checkout-tax";
import { prisma } from "@/lib/prisma";

const SPECIAL_REQUESTS_MAX_LEN = 2000;

export type BookingPayload = {
  packageId: string;
  tripStart: string;
  adults: number;
  children: number;
  addOnIds: string[];
  guestName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

function addDaysISO(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function validateBody(
  body: unknown,
): { ok: true; data: BookingPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const packageId = b.packageId;
  const tripStart = b.tripStart;
  const adults = b.adults;
  const children = b.children;
  const addOnIds = b.addOnIds;
  const guestName = b.guestName;
  const email = b.email;
  const phone = b.phone;
  const specialRequestsRaw = b.specialRequests;

  if (typeof packageId !== "string") return { ok: false, error: "Unknown package" };
  const pkg = getBookablePackageById(packageId);
  if (!pkg) return { ok: false, error: "Unknown package" };

  if (typeof tripStart !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(tripStart)) {
    return { ok: false, error: "Invalid trip start date" };
  }
  const start = new Date(tripStart + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) return { ok: false, error: "Trip start cannot be in the past" };

  if (typeof adults !== "number" || !Number.isInteger(adults) || adults < pkg.minAdults) {
    return { ok: false, error: "Invalid adults" };
  }
  if (typeof children !== "number" || !Number.isInteger(children) || children < 0 || children > 20) {
    return { ok: false, error: "Invalid children" };
  }
  const pax = adults + children;
  if (pax > pkg.maxPax) {
    return { ok: false, error: `Maximum ${pkg.maxPax} travellers` };
  }
  if (!Array.isArray(addOnIds)) return { ok: false, error: "Invalid add-ons" };
  const allowed = new Set<string>(pkg.addOns.map((a) => a.id));
  for (const id of addOnIds) {
    if (typeof id !== "string" || !allowed.has(id)) return { ok: false, error: "Invalid add-on" };
  }
  if (typeof guestName !== "string" || guestName.trim().length < 2) {
    return { ok: false, error: "Name required" };
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Valid email required" };
  }
  if (typeof phone !== "string" || phone.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Valid phone required" };
  }

  let specialRequests = "";
  if (specialRequestsRaw !== undefined && specialRequestsRaw !== null) {
    if (typeof specialRequestsRaw !== "string") {
      return { ok: false, error: "Invalid special requests" };
    }
    specialRequests = specialRequestsRaw.trim();
    if (specialRequests.length > SPECIAL_REQUESTS_MAX_LEN) {
      return {
        ok: false,
        error: `Special requests must be at most ${SPECIAL_REQUESTS_MAX_LEN} characters`,
      };
    }
  }

  return {
    ok: true,
    data: {
      packageId,
      tripStart,
      adults,
      children,
      addOnIds,
      guestName: guestName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      specialRequests,
    },
  };
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }
  const parsed = validateBody(json);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { data } = parsed;

  const pkg = getBookablePackageById(data.packageId)!;
  const tripEnd = addDaysISO(data.tripStart, pkg.tripDays - 1);

  const packageTotal =
    data.adults * pkg.pricePerAdultInr +
    data.children * pkg.pricePerAdultInr * pkg.childPriceFactor;

  let addOnTotal = 0;
  for (const id of data.addOnIds) {
    const add = pkg.addOns.find((a) => a.id === id);
    if (add) addOnTotal += add.pricePerBookingInr;
  }

  const subtotalInr = Math.round(packageTotal + addOnTotal);
  const { taxInr, totalInr } = applyCheckoutTax(subtotalInr);

  const reference = `WM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const tripStartDate = new Date(`${data.tripStart}T00:00:00.000Z`);
  const tripEndDate = new Date(`${tripEnd}T00:00:00.000Z`);

  try {
    await prisma.booking.create({
      data: {
        reference,
        packageId: data.packageId,
        tripStart: tripStartDate,
        tripEnd: tripEndDate,
        adults: data.adults,
        children: data.children,
        addOnIds: data.addOnIds,
        guestName: data.guestName,
        email: data.email,
        phone: data.phone,
        specialRequests: data.specialRequests || null,
        subtotalInr,
        taxInr,
        totalInr,
        status: "pending",
      },
    });
  } catch (e) {
    console.error("Booking insert failed", e);
    return NextResponse.json(
      { error: "Could not save booking. Try again in a moment." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    reference,
    status: "pending",
    package: `${pkg.title} — ${pkg.durationLabel}`,
    packageId: pkg.id,
    tripStart: data.tripStart,
    tripEnd,
    adults: data.adults,
    children: data.children,
    addOnIds: data.addOnIds,
    specialRequests: data.specialRequests || undefined,
    subtotalInr,
    taxInr,
    totalInr,
    message:
      "Booking saved. Complete payment when the gateway is connected; until then this is a provisional record.",
  });
}
