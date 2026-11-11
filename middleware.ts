import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route protection for the admin area.
 *
 * This hides /admin/* from anonymous visitors and refreshes the Supabase
 * session cookie on the way through. It is NOT the security boundary for the
 * data itself: the anon key ships in the browser bundle, so anyone can still
 * call the PostgREST API directly. The real enforcement lives in the Row
 * Level Security policies on the `blogs` table (see ops/supabase-rls-migration.sql).
 */
export async function middleware(request: NextRequest) {
  // Handed back to the browser; cookies written during getUser() are
  // copied onto it in setAll() below.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient() and getUser(): doing so can
  // leave the session cookie stale and log the user out unexpectedly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    // Send the user back where they were headed after signing in.
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Admin area only. Keep this narrow so the rest of the site stays public.
  matcher: ['/admin/:path*'],
};
