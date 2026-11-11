import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serviceClient: SupabaseClient | null = null;

/**
 * Service-role client for server-to-server writes (e.g. recording a purchase
 * after a payment webhook/verify). Bypasses RLS by design — the confirmation is
 * authenticated by the payment provider's signature, not by a user session.
 *
 * Created lazily so importing this module never throws at load time; the key is
 * only required when a write is actually attempted.
 */
export function getSupabaseService(): SupabaseClient {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

    if (!url || !key) {
      throw new Error(
        'Supabase service-role client is not configured (SUPABASE_SERVICE_ROLE_KEY missing).'
      );
    }

    serviceClient = createClient(url, key);
  }

  return serviceClient;
}
