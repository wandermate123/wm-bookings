import type { MultiDayPackageVariant } from "./multi-day-types";

/**
 * Spiritual Triangle multi-day variants — same route (Kashi · Prayagraj · Ayodhya),
 * different nights/days and per-adult pricing. Tune prices in this file.
 */
export const SPIRITUAL_TRIANGLE_ADDONS = [
  {
    id: "private-photography",
    label: "Private photography (2 hr)",
    description: "Private photography session in Kashi.",
    pricePerBookingInr: 2_999,
  },
  {
    id: "sunrise-boat",
    label: "Private sunrise boat",
    description: "Quiet Ganga at dawn with dedicated boat.",
    pricePerBookingInr: 1_500,
  },
  {
    id: "airport-pickup-varanasi",
    label: "Varanasi airport / station pickup",
    description: "One-way transfer — share details after booking.",
    pricePerBookingInr: 799,
  },
] as const;

export type SpiritualTriangleAddon = (typeof SPIRITUAL_TRIANGLE_ADDONS)[number];

export type SpiritualTriangleVariant = MultiDayPackageVariant;

export const SPIRITUAL_TRIANGLE_VARIANTS: readonly MultiDayPackageVariant[] = [
  {
    id: "spiritual-triangle-3n4d",
    variantSlug: "3n4d",
    pillLabel: "3N / 4D",
    title: "The Spiritual Triangle",
    routeLabel: "Kashi · Prayagraj · Ayodhya",
    durationLabel: "3 nights · 4 days",
    tripDays: 4,
    pricePerAdultInr: 10_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "spiritual-triangle-4n5d",
    variantSlug: "4n5d",
    pillLabel: "4N / 5D",
    title: "The Spiritual Triangle",
    routeLabel: "Kashi · Prayagraj · Ayodhya",
    durationLabel: "4 nights · 5 days",
    tripDays: 5,
    pricePerAdultInr: 12_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "spiritual-triangle-5n6d",
    variantSlug: "5n6d",
    pillLabel: "5N / 6D",
    title: "The Spiritual Triangle",
    routeLabel: "Kashi · Prayagraj · Ayodhya",
    durationLabel: "5 nights · 6 days",
    tripDays: 6,
    pricePerAdultInr: 15_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
];

const bySlug = new Map(SPIRITUAL_TRIANGLE_VARIANTS.map((v) => [v.variantSlug, v]));
const byId = new Map(SPIRITUAL_TRIANGLE_VARIANTS.map((v) => [v.id, v]));

export function getSpiritualVariantBySlug(
  slug: string,
): MultiDayPackageVariant | undefined {
  return bySlug.get(slug);
}

export function getSpiritualVariantById(
  id: string,
): MultiDayPackageVariant | undefined {
  return byId.get(id);
}

export function getSpiritualTriangleBookingPath(variantSlug: string): string {
  return `/book/spiritual-triangle/${variantSlug}`;
}

/** @deprecated Use SPIRITUAL_TRIANGLE_VARIANTS; 4N/5D is the default catalogue entry. */
export const SPIRITUAL_TRIANGLE =
  SPIRITUAL_TRIANGLE_VARIANTS.find((v) => v.variantSlug === "4n5d")!;

export type PackageId = SpiritualTriangleVariant["id"];

export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
