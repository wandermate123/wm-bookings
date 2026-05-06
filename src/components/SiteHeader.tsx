import Link from "next/link";

const mainSite = "https://www.wandermate.in";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-wm-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <a
            href={`${mainSite}/`}
            className="shrink-0 rounded bg-wm-orange px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-wm-orange-hover sm:px-4 sm:text-sm"
          >
            Enquire Now
          </a>
          <Link
            href={`${mainSite}/`}
            className="hidden truncate text-sm text-white/95 hover:text-white sm:block"
          >
            Self-planning
          </Link>
        </div>

        <Link
          href={`${mainSite}/`}
          className="flex shrink-0 items-center justify-center"
          aria-label="WanderMate home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/90 text-sm font-semibold tracking-tight">
            WM
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-4 sm:gap-6">
          <Link
            href={`${mainSite}/`}
            className="hidden text-sm text-white/95 hover:text-white lg:inline"
          >
            Packages
          </Link>
          <Link
            href={`${mainSite}/`}
            className="hidden text-sm text-white/95 hover:text-white lg:inline"
          >
            Experiences
          </Link>
          <Link
            href={`${mainSite}/`}
            className="hidden text-sm text-white/95 hover:text-white lg:inline"
          >
            Blogs
          </Link>
          <a
            href={`${mainSite}/`}
            className="hidden items-center gap-2 text-sm text-wm-blue sm:flex"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wm-blue/20 text-wm-blue">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
              </svg>
            </span>
            Log In
          </a>
          <button
            type="button"
            className="p-1 text-white lg:hidden"
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
