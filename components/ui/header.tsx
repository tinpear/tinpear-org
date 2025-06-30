"use client"
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "News", href: "/news" },
    { label: "Learn", href: "/learn" },
    { label: "Labs", href: "/labs" },
    { label: "Apps", href: "/apps" },
    { label: "About", href: "/about" }
  ];

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/lloo.png" // ✅ Replace with your actual logo path
              alt="Tinpear Logo"
              width={100}
              height={100}
              
              quality={100}
              priority
            />
            
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-black transition-all">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold shadow hover:bg-gray-800 transition"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
              className="focus:outline-none"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-6 pt-4 shadow-md rounded-b-2xl space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-base text-gray-700 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-gray-200" />
          
          <Link href="/signup" className="block text-gray-900 font-medium text-base">
            Register
          </Link>
        </div>
      )}
    </header>
  );
}
