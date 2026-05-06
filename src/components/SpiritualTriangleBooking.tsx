import { MultiDayPackageBooking } from "@/components/MultiDayPackageBooking";
import { SPIRITUAL_TRIANGLE_VARIANTS } from "@/lib/spiritual-triangle";

export function SpiritualTriangleBooking({ variantSlug }: { variantSlug: string }) {
  return (
    <MultiDayPackageBooking
      variants={SPIRITUAL_TRIANGLE_VARIANTS}
      variantSlug={variantSlug}
      familyBasePath="/book/spiritual-triangle"
      durationPickerAriaLabel="Choose Spiritual Triangle trip length"
    />
  );
}
