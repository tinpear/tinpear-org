import { NextResponse } from 'next/server';
import { verifyTransaction, recordPaymentPurchase } from '@/lib/paystack';

/**
 * POST /api/paystack/verify
 *
 * Confirms a Paystack transaction and, on success, records the purchase in
 * Supabase so the course unlocks for the user.
 *
 * Body: { reference: string }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const reference = typeof body?.reference === 'string' ? body.reference : '';

  if (!reference) {
    return NextResponse.json({ error: 'Missing transaction reference.' }, { status: 400 });
  }

  let result;
  try {
    result = await verifyTransaction(reference);
  } catch (err: any) {
    // Misconfiguration (e.g. PAYSTACK_SECRET_KEY unset) throws before the
    // request is ever sent. Fail loudly but without leaking internals —
    // otherwise this surfaces as an opaque500.
    console.error('[api/paystack/verify] Verification unavailable:', err?.message ?? err);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Payment verification is unavailable right now. Please try again shortly.',
      },
      { status: 503 }
    );
  }

  if (!result.success) {
    return NextResponse.json({ status: 'failed', reference }, { status: 200 });
  }

  const metadata = result.metadata ?? {};
  const userId = metadata.userId ?? '';
  const courseSlug = metadata.courseSlug ?? '';

  if (userId && courseSlug) {
    await recordPaymentPurchase({
      userId,
      courseSlug,
      courseTitle: metadata.courseTitle ?? undefined,
      amountCents: metadata.amountCents
        ? Number(metadata.amountCents)
        : result.amount
          ? Number(result.amount)
          : 499900,
      currency: result.currency ?? undefined,
      reference,
    });
  }

  return NextResponse.json({
    status: 'success',
    reference,
    amount: result.amount,
    currency: result.currency,
  });
}
