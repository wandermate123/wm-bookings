import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFaq } from "@/components/BookingFaq";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpiritualTriangleBooking } from "@/components/SpiritualTriangleBooking";
import {
  getSpiritualVariantBySlug,
  SPIRITUAL_TRIANGLE_VARIANTS,
} from "@/lib/spiritual-triangle";

type Props = { params: Promise<{ variant: string }> };

export function generateStaticParams() {
  return SPIRITUAL_TRIANGLE_VARIANTS.map((v) => ({ variant: v.variantSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
  const pkg = getSpiritualVariantBySlug(variant);
  if (!pkg) return { title: "Book | WanderMate" };
  return {
    title: `${pkg.title} (${pkg.durationLabel}) | Book | WanderMate`,
    description: `Book ${pkg.title} — ${pkg.routeLabel}. ${pkg.durationLabel}.`,
  };
}

export default async function SpiritualTriangleVariantPage({ params }: Props) {
  const { variant } = await params;
  const pkg = getSpiritualVariantBySlug(variant);
  if (!pkg) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="lg:col-span-7">
                <SpiritualTriangleBooking variantSlug={pkg.variantSlug} />
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
