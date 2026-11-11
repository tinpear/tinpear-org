'use client';

import { useState } from 'react';
import type { Course } from '@/lib/courses';

/**
 * Client component: starts a Paystack transaction via /api/paystack/initialize
 * and redirects the browser to Paystack's hosted checkout page.
 */
export default function CheckoutButton({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buy = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug }),
      });

      const data = await res.json().catch(() => ({}));

      // Not signed in: the API gates checkout on an authenticated user, so
      // send them to sign-in and back to this page rather than dead-ending
      // on an error message.
      if (res.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/signin?next=${encodeURIComponent(next)}`;
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Could not start the payment session. Please try again.');
        setLoading(false);
        return;
      }

      if (!data.authorizationUrl) {
        setError('Could not start the payment session. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch {
      setError('Something went wrong while starting the payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 hover:shadow disabled:opacity-60"
      >
        {loading ? 'Redirecting to secure payment…' : `Buy Now — ${course.price}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
