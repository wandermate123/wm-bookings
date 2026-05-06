import Link from "next/link";

const mainSite = "https://www.wandermate.in";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
        <Link
          href={`${mainSite}/`}
          className="font-display text-2xl font-semibold text-[#3d6fb8]"
        >
          Wandermate
        </Link>
      </div>
      <div className="border-t border-black/5 bg-wm-footer">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold text-wm-navy-deep">
              Opening Hours
            </h3>
            <ul className="space-y-1 font-sans text-sm text-wm-navy-deep/80">
              <li>Mon - Fri: 10am - 9pm</li>
              <li>Saturday: 9am - 7pm</li>
              <li>Sunday: 9am - 8pm</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold text-wm-navy-deep">
              Socials
            </h3>
            <p className="font-sans text-sm text-wm-navy-deep/80">
              <a href="https://www.instagram.com/wandermate.official/" className="hover:underline">
                Instagram
              </a>
              <span className="mx-2">·</span>
              <a href={`${mainSite}/`} className="hover:underline">
                Facebook
              </a>
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-sans text-sm text-wm-navy-deep/70">
              © 2035 by Wandermate.
              <br />
              <span className="text-wm-navy-deep/60">Proudly designed by Ayush Singh</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
