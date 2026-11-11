import { NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/paystack';
import { getCourse } from '@/lib/courses';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/paystack/initialize
 *
 * Creates a Paystack transaction for a course and returns the checkout URL.
 * The browser then redirects the customer to Paystack to pay.
 *
 * Body: { courseSlug: string }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const courseSlug = typeof body?.courseSlug === 'string' ? body.courseSlug : '';
  const course = getCourse(courseSlug);
  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to purchase a course.' },
      { status: 401 }
    );
  }

  // Prices are stored as display strings (e.g. "₦4,999"). Strip everything but
  // digits and the decimal point to get the major-unit amount; Paystack wants
  // the smallest unit (kobo for NGN), which lib/paystack.ts multiplies out.
  const amount = Number(String(course.price ?? '').replace(/[^\d.]/g, '')) || 4999;

  const reference = `tinpear_${user.id}_${course.slug}_${Date.now()}`;

  try {
    const { authorizationUrl, accessCode } = await initializeTransaction({
      email: user.email ?? 'user@tinpear.org',
      amount,
      currency: 'ngn',
      reference,
      callbackUrl: `${new URL(req.url).origin}/checkout/success?reference=${reference}&course=${encodeURIComponent(course.slug)}`,
      metadata: {
        courseSlug: course.slug,
        courseTitle: course.title,
        userId: user.id,
        amountCents: String(Math.round(amount * 100)),
        currency: 'ngn',
      },
    });

    return NextResponse.json({ authorizationUrl, accessCode, reference });
  } catch (err: any) {
    console.error('[api/paystack/initialize] Failed to create transaction:', err?.message ?? err);
    return NextResponse.json(
      { error: 'Could not start the payment session. Please try again shortly.' },
      { status: 500 }
    );
  }
}
