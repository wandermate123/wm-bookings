/**
 * Varanasi-focused multi-day packages (Kashi only — separate product line from Spiritual Triangle).
 * Prices aligned with wandermate.co.in “Authentic Banaras” style; adjust here.
 */
import type { MultiDayPackageVariant } from "@/lib/multi-day-types";
import { SPIRITUAL_TRIANGLE_ADDONS } from "@/lib/spiritual-triangle";

export const VARANASI_PACKAGE_VARIANTS: readonly MultiDayPackageVariant[] = [
  {
    id: "varanasi-1n2d",
    variantSlug: "1n2d",
    pillLabel: "1N / 2D",
    title: "Varanasi Package",
    routeLabel: "Kashi · Ghats · Old city",
    durationLabel: "1 night · 2 days",
    tripDays: 2,
    pricePerAdultInr: 4_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "varanasi-2n3d",
    variantSlug: "2n3d",
    pillLabel: "2N / 3D",
    title: "Varanasi Package",
    routeLabel: "Kashi · Ghats · Old city",
    durationLabel: "2 nights · 3 days",
    tripDays: 3,
    pricePerAdultInr: 7_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "varanasi-3n4d",
    variantSlug: "3n4d",
    pillLabel: "3N / 4D",
    title: "Varanasi Package",
    routeLabel: "Kashi · Ghats · Old city",
    durationLabel: "3 nights · 4 days",
    tripDays: 4,
    pricePerAdultInr: 11_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "varanasi-4n5d",
    variantSlug: "4n5d",
    pillLabel: "4N / 5D",
    title: "Varanasi Package",
    routeLabel: "Kashi · Ghats · Old city",
    durationLabel: "4 nights · 5 days",
    tripDays: 5,
    pricePerAdultInr: 14_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "varanasi-5n6d",
    variantSlug: "5n6d",
    pillLabel: "5N / 6D",
    title: "Varanasi Package",
    routeLabel: "Kashi · Ghats · Old city",
    durationLabel: "5 nights · 6 days",
    tripDays: 6,
    pricePerAdultInr: 17_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
  {
    id: "varanasi-6n7d",
    variantSlug: "6n7d",
    pillLabel: "6N / 7D",
    title: "Varanasi Package",
    routeLabel: "Kashi · Ghats · Old city",
    durationLabel: "6 nights · 7 days",
    tripDays: 7,
    pricePerAdultInr: 20_999,
    childPriceFactor: 0.5,
    minAdults: 1,
    maxPax: 12,
    addOns: SPIRITUAL_TRIANGLE_ADDONS,
  },
];

const bySlug = new Map(VARANASI_PACKAGE_VARIANTS.map((v) => [v.variantSlug, v]));
const byId = new Map(VARANASI_PACKAGE_VARIANTS.map((v) => [v.id, v]));

export function getVaranasiVariantBySlug(
  slug: string,
): MultiDayPackageVariant | undefined {
  return bySlug.get(slug);
}

export function getVaranasiVariantById(id: string): MultiDayPackageVariant | undefined {
  return byId.get(id);
}

export function getVaranasiBookingPath(variantSlug: string): string {
  return `/book/varanasi/${variantSlug}`;
}
