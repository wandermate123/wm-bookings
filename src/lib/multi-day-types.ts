/** Shared shape for any multi-day bookable product (Spiritual Triangle, Varanasi-only, etc.). */

export type MultiDayAddon = {
  id: string;
  label: string;
  description: string;
  pricePerBookingInr: number;
};

export type MultiDayPackageVariant = {
  id: string;
  variantSlug: string;
  pillLabel: string;
  title: string;
  routeLabel: string;
  durationLabel: string;
  tripDays: number;
  pricePerAdultInr: number;
  childPriceFactor: number;
  minAdults: number;
  maxPax: number;
  addOns: readonly MultiDayAddon[];
};
