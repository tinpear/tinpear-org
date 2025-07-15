// lib/supabase/server.ts

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export async function createClient() { // Make createClient async
  // Await the cookies() function
  const cookieStore = await cookies(); // <--- AWAIT IS HERE NOW!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(
          name: string,
          value: string,
          options?: CookieOptions
        ) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          } catch (e) {
            console.warn("Attempted to set cookie outside of Server Action/Route Handler:", e);
          }
        },
        remove(
          name: string,
          options?: CookieOptions
        ) {
          try {
            cookieStore.delete({
              name,
              ...options,
            });
          } catch (e) {
            console.warn("Attempted to delete cookie outside of Server Action/Route Handler:", e);
          }
        },
      },
    }
  );
}