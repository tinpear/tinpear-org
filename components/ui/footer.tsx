import Link from "next/link";
import Logo from "./logo";

export default function Footer({ border = false }: { border?: boolean }) {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Footer content */}
        <div className={`grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4 ${
          border ? "border-t border-gray-200" : ""
        }`}>
          
          {/* Column 1: Logo and copyright */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Tinpear. All rights reserved.
            </p>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learn" className="text-sm text-gray-500 hover:text-gray-900 transition">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/labs" className="text-sm text-gray-500 hover:text-gray-900 transition">
                  Labs
                </Link>
              </li>
              <li>
                <Link href="/apps" className="text-sm text-gray-500 hover:text-gray-900 transition">
                  Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-gray-500 hover:text-gray-900 transition">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Connect</h3>
            <div className="flex space-x-4">
              <Link 
                href="https://x.com/TinpearAI" 
                target="_blank"
                className="text-gray-500 hover:text-gray-900 transition"
                aria-label="Twitter"
              >
               <svg
          className="h-6 w-6 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.938 3H17.66l-4.116 5.588L8.858 3H3l7.037 9.474L3 21h3.365l4.404-5.967L15.484 21H21l-7.262-9.783L20.938 3zM6.03 4.5h1.727l11.25 15h-1.746L6.03 4.5z" />
        </svg>
              </Link>
              <Link 
                href="https://www.linkedin.com/company/tinpear" 
                target="_blank"
                className="text-gray-500 hover:text-gray-900 transition"
                aria-label="LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link 
                href="https://www.facebook.com/share/16oyK1cA79/" 
                target="_blank"
                className="text-gray-500 hover:text-gray-900 transition"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}