import { MultiDayPackageBooking } from "@/components/MultiDayPackageBooking";
import { VARANASI_PACKAGE_VARIANTS } from "@/lib/varanasi-packages";

export function VaranasiPackageBooking({ variantSlug }: { variantSlug: string }) {
  return (
    <MultiDayPackageBooking
      variants={VARANASI_PACKAGE_VARIANTS}
      variantSlug={variantSlug}
      familyBasePath="/book/varanasi"
      durationPickerAriaLabel="Choose Varanasi package trip length"
    />
  );
}
