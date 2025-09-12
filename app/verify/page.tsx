'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// OPTIONAL but recommended on Netlify to skip static generation for this page
export const dynamic = 'force-dynamic';

type CertRow = {
  cert_id: string;
  full_name: string;
  course_key: string;
  issued_at: string;
  storage_path: string | null;
};

function extractCid(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';
  // Allow pasting a full URL like https://.../verify?cid=abc
  try {
    const url = new URL(raw);
    const qp = url.searchParams.get('cid');
    if (qp) return qp.trim();
  } catch {
    // not a URL — fall through
  }
  return raw;
}

/** Wrapper page with Suspense so useSearchParams can bail out to CSR safely */
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifySkeleton />}>
      <VerifyClient />
    </Suspense>
  );
}

/** Lightweight loading UI for Suspense */
function VerifySkeleton() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Verify Certificate</h1>
      <p className="text-sm text-gray-600 mt-1">Loading…</p>
      <div className="mt-4 h-10 rounded-lg bg-gray-100 animate-pulse" />
    </div>
  );
}

/** Client component that actually uses useSearchParams */
function VerifyClient() {
  const sp = useSearchParams();
  const initialCidParam = sp.get('cid') || '';

  const [cid, setCid] = useState(initialCidParam);
  const [row, setRow] = useState<CertRow | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showResult = checked && !loading;

  const displayCourse = useMemo(() => {
    if (!row?.course_key) return '';
    const map: Record<string, string> = {
      'ai-everyone': 'AI for Everyone',
      'pe-beginner': 'Prompt Engineering · Beginner',
    };
    return map[row.course_key] || row.course_key;
  }, [row?.course_key]);

  async function verify(input: string) {
    const id = extractCid(input);
    if (!id) return;

    setLoading(true);
    setChecked(false);
    setError(null);
    setRow(null);
    setSignedUrl(null);

    try {
      // 1) Look up by cert_id (RLS must allow SELECT by cert_id)
      const { data, error: selErr } = await supabase
        .from('certificates')
        .select('cert_id, full_name, course_key, issued_at, storage_path')
        .eq('cert_id', id)
        .maybeSingle<CertRow>();

      if (selErr) throw selErr;

      setRow(data ?? null);

      // 2) If we have a file, create a 10-min signed URL
      if (data?.storage_path) {
        const { data: signed, error: signErr } = await supabase
          .storage
          .from('certificates')
          .createSignedUrl(data.storage_path, 60 * 10);
        if (!signErr) setSignedUrl(signed?.signedUrl ?? null);
      }

      // 3) Update URL to be shareable without reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('cid', id);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e: any) {
      setError(e?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }

  useEffect(() => {
    if (initialCidParam) verify(initialCidParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCidParam]);

  const shareUrl =
    typeof window !== 'undefined' && (row?.cert_id || cid)
      ? `${window.location.origin}/verify?cid=${encodeURIComponent(row?.cert_id || cid)}`
      : '';

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Verify Certificate</h1>
      <p className="text-sm text-gray-600 mt-1">
        Paste the Certificate ID printed on the document (or paste the full link).
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          verify(cid);
        }}
      >
        <input
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. ai-everyone-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          autoFocus
        />
        <button
          className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm disabled:opacity-60"
          disabled={!cid || loading}
          type="submit"
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {showResult && row && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="text-green-800 font-medium">Certificate is valid ✅</div>
          <div className="text-sm text-gray-900 mt-2 space-y-1">
            <div><b>Name:</b> {row.full_name}</div>
            <div><b>Course:</b> {displayCourse || row.course_key}</div>
            <div><b>Issued:</b> {new Date(row.issued_at).toDateString()}</div>
            <div><b>Certificate ID:</b> {row.cert_id}</div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm underline text-green-800"
              >
                View PDF (10-min link)
              </a>
            )}
            {shareUrl && (
              <button
                type="button"
                className="inline-block text-sm underline text-green-800"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Link copied!');
                  } catch {
                    alert('Could not copy link.');
                  }
                }}
              >
                Copy shareable link
              </button>
            )}
          </div>
        </div>
      )}

      {showResult && !row && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-amber-800 font-medium">Certificate not found ❌</div>
          <div className="text-sm text-gray-800 mt-2">
            We couldn’t find a certificate with ID{' '}
            <code className="px-1 rounded bg-white border">{extractCid(cid)}</code>. Please check the ID and try again.
          </div>
        </div>
      )}
    </div>
  );
}
