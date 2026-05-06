import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  SPIRITUAL_TRIANGLE_VARIANTS,
  formatInr,
  getSpiritualTriangleBookingPath,
} from "@/lib/spiritual-triangle";
import { getVaranasiBookingPath, VARANASI_PACKAGE_VARIANTS } from "@/lib/varanasi-packages";

export const metadata: Metadata = {
  title: "Book a trip | WanderMate Varanasi",
  description:
    "Choose your journey — Spiritual Triangle or Varanasi-only packages. Book online.",
};

const spiritualDefault = SPIRITUAL_TRIANGLE_VARIANTS.find((v) => v.variantSlug === "4n5d")!;
const varanasiDefault = VARANASI_PACKAGE_VARIANTS.find((v) => v.variantSlug === "3n4d")!;

export default function BookIndexPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-black/5 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-wm-navy/65">
              Book online
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-wm-navy sm:text-4xl">
              Choose your package
            </h1>
            <p className="mt-3 text-sm text-wm-navy-deep/75 sm:text-base">
              Each product has its own page and pricing. Pick one to continue.
            </p>
          </div>
        </section>

        <section className="bg-wm-footer/40 py-10 sm:py-14">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
            <Link
              href={getSpiritualTriangleBookingPath(spiritualDefault.variantSlug)}
              className="group rounded-sm border border-black/10 bg-white p-6 shadow-sm transition hover:border-wm-orange/40 hover:shadow-md sm:p-8"
            >
              <h2 className="font-display text-xl font-semibold text-wm-navy sm:text-2xl group-hover:text-wm-orange">
                Spiritual Triangle
              </h2>
              <p className="mt-2 text-sm text-wm-navy-deep/80">
                Kashi · Prayagraj · Ayodhya — multi-city guided journey. Durations from{" "}
                {SPIRITUAL_TRIANGLE_VARIANTS[0].pillLabel} to{" "}
                {SPIRITUAL_TRIANGLE_VARIANTS[SPIRITUAL_TRIANGLE_VARIANTS.length - 1].pillLabel}.
              </p>
              <p className="mt-4 font-display text-lg font-medium text-wm-navy">
                From {formatInr(spiritualDefault.pricePerAdultInr)} per adult
                <span className="text-sm font-sans font-normal text-wm-navy-deep/60">
                  {" "}
                  ({spiritualDefault.durationLabel})
                </span>
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-wm-blue">
                Book Spiritual Triangle →
              </span>
            </Link>

            <Link
              href={getVaranasiBookingPath(varanasiDefault.variantSlug)}
              className="group rounded-sm border border-black/10 bg-white p-6 shadow-sm transition hover:border-wm-orange/40 hover:shadow-md sm:p-8"
            >
              <h2 className="font-display text-xl font-semibold text-wm-navy sm:text-2xl group-hover:text-wm-orange">
                Varanasi Package
              </h2>
              <p className="mt-2 text-sm text-wm-navy-deep/80">
                Kashi · Ghats · Old city — stay in Varanasi. Durations from{" "}
                {VARANASI_PACKAGE_VARIANTS[0].pillLabel} to{" "}
                {VARANASI_PACKAGE_VARIANTS[VARANASI_PACKAGE_VARIANTS.length - 1].pillLabel}.
              </p>
              <p className="mt-4 font-display text-lg font-medium text-wm-navy">
                From {formatInr(varanasiDefault.pricePerAdultInr)} per adult
                <span className="text-sm font-sans font-normal text-wm-navy-deep/60">
                  {" "}
                  ({varanasiDefault.durationLabel})
                </span>
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-wm-blue">
                Book Varanasi Package →
              </span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
