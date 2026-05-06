import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingFaq } from "@/components/BookingFaq";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VaranasiPackageBooking } from "@/components/VaranasiPackageBooking";
import { getSpiritualTriangleBookingPath } from "@/lib/spiritual-triangle";
import {
  VARANASI_PACKAGE_VARIANTS,
  getVaranasiVariantBySlug,
} from "@/lib/varanasi-packages";

type Props = { params: Promise<{ variant: string }> };

export function generateStaticParams() {
  return VARANASI_PACKAGE_VARIANTS.map((v) => ({ variant: v.variantSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
  const pkg = getVaranasiVariantBySlug(variant);
  if (!pkg) return { title: "Varanasi Package | Book | WanderMate" };
  return {
    title: `${pkg.title} (${pkg.durationLabel}) | Book | WanderMate`,
    description: `Book ${pkg.title} — ${pkg.routeLabel}. ${pkg.durationLabel}.`,
  };
}

export default async function VaranasiPackagePage({ params }: Props) {
  const { variant } = await params;
  const pkg = getVaranasiVariantBySlug(variant);
  if (!pkg) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <p className="mb-4 text-center text-sm text-wm-navy-deep/70">
              <Link
                href="/book"
                className="text-wm-blue underline-offset-2 hover:underline"
              >
                ← All packages
              </Link>
              <span className="mx-2 text-wm-navy-deep/40">·</span>
              <Link
                href={getSpiritualTriangleBookingPath("4n5d")}
                className="text-wm-blue underline-offset-2 hover:underline"
              >
                Spiritual Triangle
              </Link>
            </p>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="lg:col-span-7">
                <VaranasiPackageBooking variantSlug={pkg.variantSlug} />
              </div>
              <aside className="lg:col-span-5 lg:sticky lg:top-24">
                <BookingFaq />
              </aside>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
