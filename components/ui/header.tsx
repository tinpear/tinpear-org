'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, ChevronDown, LogOut } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  };

  const navItems = [
    { label: "Learn", href: "/learn" },
    { label: "News", href: "/news" },
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
              src="/lloo.png"
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
              <Link 
                key={item.href} 
                href={item.href} 
                className="hover:text-black transition-all hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-700">
                    {profile?.full_name || profile?.username || 'Account'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/learn"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Learning Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 rounded-lg text-gray-700 text-sm font-semibold hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold shadow hover:bg-gray-800 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <Link href="/profile" className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </Link>
            )}
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
              className="block text-base text-gray-700 hover:text-black hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-gray-200" />
          
          {user ? (
            <>
              <Link 
                href="/profile" 
                className="block text-base text-gray-700 hover:text-black hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
                onClick={() => setIsOpen(false)}
              >
                Your Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block text-base text-gray-700 hover:text-black hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/signin" 
                className="block text-base text-gray-700 hover:text-black hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="block text-base font-medium text-gray-900 hover:text-black hover:underline hover:underline-offset-4 decoration-2 decoration-green-600"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}