import Link from "next/link";
import Logo from "./logo";

export default function Footer({ border = false }: { border?: boolean }) {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top area: Blocks */}
        <div
          className={`grid gap-10 py-8 sm:grid-cols-12 md:py-12 ${
            border
              ? "border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1]"
              : ""
          }`}
        >
          {/* Logo and copyright */}
          <div className="space-y-2 sm:col-span-12 lg:col-span-4">
            <div>
              <Logo />
            </div>
            <div className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Tinpear. All rights reserved.
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/labs" className="text-gray-600 transition hover:text-gray-900">
                  Labs
                </Link>
              </li>
              <li>
                <Link href="/apps" className="text-gray-600 transition hover:text-gray-900">
                  AI Apps
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 transition hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-600 transition hover:text-gray-900">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 transition hover:text-gray-900">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 transition hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 transition hover:text-gray-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 transition hover:text-gray-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-600 transition hover:text-gray-900">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/legal/financials" className="text-gray-600 transition hover:text-gray-900">
                  Financials
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/community" className="text-gray-600 transition hover:text-gray-900">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 transition hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-600 transition hover:text-gray-900">
                  Report Vulnerability
                </Link>
              </li>
            </ul>
          </div>

         {/* 5th block */}
<div className="space-y-2 sm:col-span-6 md:col-span-3 lg:col-span-2">
  <h3 className="text-sm font-medium">Social</h3>
  <ul className="flex gap-3">
    {/* X */}
    <li>
      <Link
        className="flex items-center justify-center text-blue-500 transition hover:text-blue-600"
        href="https://x.com/yourprofile" // update this link
        target="_blank"
        aria-label="X"
      >
        <svg
          className="h-6 w-6 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.938 3H17.66l-4.116 5.588L8.858 3H3l7.037 9.474L3 21h3.365l4.404-5.967L15.484 21H21l-7.262-9.783L20.938 3zM6.03 4.5h1.727l11.25 15h-1.746L6.03 4.5z" />
        </svg>
      </Link>
    </li>
    {/* LinkedIn */}
    <li>
      <Link
        className="flex items-center justify-center text-blue-700 transition hover:text-blue-800"
        href="https://linkedin.com/in/yourprofile" // update this link
        target="_blank"
        aria-label="LinkedIn"
      >
        <svg
          className="h-6 w-6 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0H12v2.6h.1c.6-1.1 2.1-2.6 4.4-2.6C20 8 22 10 22 14v10h-5v-9c0-2-.7-3.3-2.5-3.3S12 12 12 14v9H7.5V8z" />
        </svg>
      </Link>
    </li>
    {/* Facebook */}
    <li>
      <Link
        className="flex items-center justify-center text-blue-600 transition hover:text-blue-700"
        href="https://facebook.com/yourpage" // update this link
        target="_blank"
        aria-label="Facebook"
      >
        <svg
          className="h-6 w-6 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.1 2.1.1v2.3h-1.2c-1.2 0-1.6.8-1.6 1.5v1.5h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
        </svg>
      </Link>
    </li>
  </ul>
</div>

        </div>
      </div>

      {/* Brand text background */}
      <div className="relative -mt-16 h-60 w-full" aria-hidden="true">
        <div className="pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 text-center text-[348px] font-bold leading-none before:bg-gradient-to-b before:from-gray-200 before:to-gray-100/30 before:bg-clip-text before:text-transparent before:content-['Tinpear'] after:absolute after:inset-0 after:bg-gray-300/70 after:bg-clip-text after:text-transparent after:mix-blend-darken after:content-['Tinpear'] after:[text-shadow:0_1px_0_white]"></div>

        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2/3" aria-hidden="true">
          <div className="h-56 w-56 rounded-full border-[20px] border-blue-700 blur-[80px]"></div>
        </div>
      </div>
    </footer>
  );
}
