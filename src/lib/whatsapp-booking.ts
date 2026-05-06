import type { MultiDayPackageVariant } from "@/lib/multi-day-types";
import { formatInr } from "@/lib/spiritual-triangle";

/** Digits only, with country code (e.g. 9198xxxxxxxx for India). Set via NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER */
export function getWhatsAppBookingNumber(): string {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER
      : undefined;
  if (!raw) return "";
  return raw.replace(/\D/g, "");
}

export function buildMultiDayWhatsAppMessage(
  pkg: MultiDayPackageVariant,
  params: {
    tripStart: string;
    tripEnd: string;
    adults: number;
    children: number;
    addOns: Record<string, boolean>;
    subtotalInr: number;
    taxInr: number;
    totalInr: number;
    guestName: string;
    email: string;
    phone: string;
    specialRequests: string;
  },
): string {
  const addOnLabels = pkg.addOns
    .filter((a) => params.addOns[a.id])
    .map((a) => a.label);
  const lines = [
    `Hi WanderMate! I’d like to book *${pkg.title}* (${pkg.durationLabel}).`,
    "",
    `Trip start: ${params.tripStart || "—"}`,
    `Trip end: ${params.tripEnd || "—"}`,
    `${pkg.routeLabel}`,
    `Adults: ${params.adults}, Children (5–11): ${params.children}`,
    `Add-ons: ${addOnLabels.length ? addOnLabels.join(", ") : "None"}`,
    "",
    `Subtotal: ${formatInr(params.subtotalInr)}`,
    `Tax: ${formatInr(params.taxInr)}`,
    `*Total (incl. tax): ${formatInr(params.totalInr)}*`,
    "",
  ];
  if (params.guestName.trim()) lines.push(`Name: ${params.guestName.trim()}`);
  if (params.phone.trim()) lines.push(`Phone: ${params.phone.trim()}`);
  if (params.email.trim()) lines.push(`Email: ${params.email.trim()}`);
  if (params.specialRequests.trim())
    lines.push("", `Special requests: ${params.specialRequests.trim()}`);
  lines.push("", "_Sent from wandermate booking page._");
  return lines.join("\n");
}

export function getWhatsAppBookingUrl(message: string): string | null {
  const num = getWhatsAppBookingNumber();
  if (num.length < 10) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
