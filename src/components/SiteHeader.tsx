import Image from "next/image";
import Link from "next/link";

const mainSite = "https://www.wandermate.in";

/** Matches the navy in the logo artwork for a flush bar. */
const headerBg = "#001a3d";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10"
      style={{ backgroundColor: headerBg }}
    >
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={`${mainSite}/`}
          className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001a3d]"
          aria-label="WanderMate — visit main site"
        >
          <Image
            src="/wandermate-logo.png"
            alt="WanderMate"
            width={200}
            height={200}
            priority
            className="h-12 w-auto max-h-14 object-contain sm:h-14 sm:max-h-16"
          />
        </Link>
      </div>
    </header>
  );
}
