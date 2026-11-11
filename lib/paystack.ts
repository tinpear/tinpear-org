import { getSupabaseService } from '@/lib/supabase/service';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getSecretKey(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? '';
  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }
  return secret;
}

/**
 * Paystack sometimes answers with an empty body (e.g. 404 for an unknown
 * reference), so parsing must never throw.
 */
async function parseJson(res: Response): Promise<any | null> {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * Create a Paystack transaction (initialize) and return the checkout URL.
 *
 * `amount` is in major units (e.g. 9.99) and is converted to the smallest unit
 * (kobo for NGN, cents for USD) server-side.
 */
export async function initializeTransaction(input: {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      email: input.email,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const json = await parseJson(res);

  if (!res.ok || json?.data?.authorization_url == null) {
    throw new Error(json?.message ?? `Paystack initialize failed (HTTP ${res.status})`);
  }

  return {
    authorizationUrl: json.data.authorization_url as string,
    accessCode: (json.data.access_code as string) ?? '',
  };
}

/**
 * Verify a Paystack transaction by reference. Returns the transaction status
 * plus the metadata that was attached at initialize time (course + user).
 *
 * Never throws for an unverifiable/unknown reference — returns success:false.
 */
export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reference }),
  });

  const json = await parseJson(res);

  if (!res.ok || json == null) {
    return {
      success: false,
      reference,
      amount: null,
      currency: null,
      metadata: null,
    };
  }

  const data = (json?.data ?? {}) as {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, string>;
  };

  return {
    success: json?.status === true && data.status === 'success',
    reference: data.reference ?? reference,
    amount: data.amount ?? null,
    currency: data.currency ?? null,
    metadata: data.metadata ?? null,
  };
}

/**
 * Record a confirmed payment in Supabase (service-role write, bypasses RLS).
 */
export async function recordPaymentPurchase(params: {
  userId: string;
  courseSlug: string;
  courseTitle?: string;
  amountCents?: number;
  currency?: string;
  reference: string;
}) {
  const { error } = await getSupabaseService().from('purchases').insert({
    user_id: params.userId,
    course_slug: params.courseSlug,
    course_title: params.courseTitle ?? params.courseSlug,
    amount_cents: params.amountCents ?? 499900,
    currency: params.currency ?? 'ngn',
    gateway: 'paystack',
    reference: params.reference,
  });

  if (error) {
    console.error('[paystack] Failed to record purchase:', error.message ?? error);
  }

  return !error;
}
