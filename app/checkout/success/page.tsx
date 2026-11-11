import Link from 'next/link';
import { verifyTransaction, recordPaymentPurchase } from '@/lib/paystack';
import { getCourse } from '@/lib/courses';

export const metadata = {
  title: 'Checkout Success',
};

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; course?: string }>;
}) {
  const { reference, course } = await searchParams;

  let paid = false;
  let referenceChecked = false;

  if (reference) {
    referenceChecked = true;
    try {
      const result = await verifyTransaction(reference);

      if (result.success) {
        const metadata = result.metadata ?? {};
        const userId = metadata.userId ?? '';
        const courseSlug = metadata.courseSlug ?? course ?? '';

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

        paid = true;
      }
    } catch (err: any) {
      console.error('[checkout/success] Verification failed:', err?.message ?? err);
    }
  }

  const resolved = course ? getCourse(course) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mb-6 text-5xl">{paid ? '🎉' : '💳'}</div>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        {paid ? 'Payment successful!' : 'Checkout incomplete'}
      </h1>

      <p className="mb-8 text-gray-600">
        {paid
          ? 'Your payment went through. Congrats! Enjoy the course — you now have access.'
          : referenceChecked
            ? 'We could not verify this payment yet. If you paid, your access should be granted shortly.'
            : 'This session has not been completed yet. If you paid, your access should be granted shortly.'}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {paid && resolved && (
          <Link
            href={resolved.beginHref}
            className="inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 hover:shadow"
          >
            Start Learning
          </Link>
        )}
        <Link
          href={resolved ? resolved.beginHref : '/learn'}
          className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
        >
          {resolved ? 'Go to course' : 'Back to all courses'}
        </Link>
        <Link href="/learn" className="text-sm text-green-600 hover:underline">
          ← Back to all courses
        </Link>
      </div>
    </div>
  );
}
