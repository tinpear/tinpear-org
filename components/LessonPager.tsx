'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type NavItem = { href: string; label?: string };

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export default function LessonPager({
  prev,
  next,
  children,
  className,
  sticky = false,
}: {
  prev?: NavItem;
  next?: NavItem;
  children?: React.ReactNode; // middle area (e.g., "Mark complete" button)
  className?: string;
  sticky?: boolean; // make it stick under the main header if you want
}) {
  return (
    <nav
      className={cx(
        'w-full',
        sticky && 'sticky top-[48px] z-20 border-b border-gray-100 backdrop-blur bg-white/70',
        className
      )}
      aria-label="Lesson navigation"
    >
      <div className="flex items-stretch justify-between gap-3">
        {/* Prev */}
        <div className="flex-1">
          {prev ? (
            <Link
              href={prev.href}
              className="inline-flex items-center justify-start gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              {prev.label ?? 'Previous'}
            </Link>
          ) : (
            <span className="inline-block h-[40px]" />
          )}
        </div>

        {/* Middle (custom) */}
        <div className="flex items-center justify-center">{children}</div>

        {/* Next */}
        <div className="flex-1 flex justify-end">
          {next ? (
            <Link
              href={next.href}
              className="inline-flex items-center justify-end gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow w-full sm:w-auto"
            >
              {next.label ?? 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-block h-[40px]" />
          )}
        </div>
      </div>
    </nav>
  );
}
