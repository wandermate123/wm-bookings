import { redirect } from "next/navigation";
import { getSpiritualTriangleBookingPath } from "@/lib/spiritual-triangle";

/** Default matches the featured variant on `/book`. */
const DEFAULT_VARIANT = "4n5d";

export default function SpiritualTriangleIndexPage() {
  redirect(getSpiritualTriangleBookingPath(DEFAULT_VARIANT));
}
