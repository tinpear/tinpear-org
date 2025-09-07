'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

type Props = {
  /** Base course path, e.g. "/learn/ai-for-everyone" */
  basePath: string;
  /** Current week slug, e.g. "week1", "week2" */
  week: `week${number}` | string;
  /** Optional label override for Course (default: "Course Overview") */
  courseLabel?: string;
  /** Optional label override for Week overview (default: capitalized current week) */
  weekLabel?: string;
  /** Optionally include a quick link to Week 1 overview too */
  includeWeek1Shortcut?: boolean;
  /** Optional back/next links for intra-week paging (no-op if omitted) */
  backHref?: string;
  backLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  /** Additional className if you want spacing tweaks from parent */
  className?: string;
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export default function TopCourseNav({
  basePath,
  week,
  courseLabel = 'Course Overview',
  weekLabel,
  includeWeek1Shortcut = false,
  backHref,
  backLabel = 'Back',
  nextHref,
  nextLabel = 'Next',
  className,
}: Props) {
  const weekOverview = `${basePath}/${week}`;
  const week1Overview = `${basePath}/week1`;
  const _weekLabel = weekLabel ?? week.replace(/^w/, 'W').replace(/(\d)/, ' $1') + ' Overview';

  return (
    <nav
      aria-label="Course navigation"
      className={cx(
        'sticky top-[56px] z-20 border-b border-gray-100 bg-white/80 backdrop-blur',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Breadcrumb pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            {courseLabel}
          </Link>

          <span className="text-gray-300">/</span>

          <Link
            href={weekOverview}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs sm:text-sm text-emerald-900 hover:bg-emerald-100"
          >
            {_weekLabel}
          </Link>

          {includeWeek1Shortcut && week !== 'week1' && (
            <>
              <span className="text-gray-300">/</span>
              <Link
                href={week1Overview}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
              >
                Week 1 Overview
              </Link>
            </>
          )}
        </div>

        {/* Optional back/next */}
        {(backHref || nextHref) && (
          <div className="flex items-center gap-2">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            )}
            {nextHref && (
              <Link
                href={nextHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:shadow"
              >
                {nextLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
