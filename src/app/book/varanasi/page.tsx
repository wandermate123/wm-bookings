import { redirect } from "next/navigation";
import { getVaranasiBookingPath } from "@/lib/varanasi-packages";

/** Start of range (1N/2D); aligns with lowest “From” on `/book`. */
const DEFAULT_VARIANT = "1n2d";

export default function VaranasiPackageIndexPage() {
  redirect(getVaranasiBookingPath(DEFAULT_VARIANT));
}
