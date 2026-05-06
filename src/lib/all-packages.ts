import type { MultiDayPackageVariant } from "@/lib/multi-day-types";
import { SPIRITUAL_TRIANGLE_VARIANTS } from "@/lib/spiritual-triangle";
import { VARANASI_PACKAGE_VARIANTS } from "@/lib/varanasi-packages";

const byId = new Map<string, MultiDayPackageVariant>();
for (const v of SPIRITUAL_TRIANGLE_VARIANTS) byId.set(v.id, v);
for (const v of VARANASI_PACKAGE_VARIANTS) byId.set(v.id, v);

/** Any multi-day package id accepted by POST /api/bookings */
export function getBookablePackageById(id: string): MultiDayPackageVariant | undefined {
  return byId.get(id);
}
