'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type CertRow = {
  cert_id: string;
  full_name: string;
  course_key: string;
  issued_at: string;
  storage_path: string;
};

export default function VerifyPage() {
  const sp = useSearchParams();
  const initialCid = sp.get('cid') || '';
  const [cid, setCid] = useState(initialCid);
  const [row, setRow] = useState<CertRow | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const showResult = checked && !loading;

  async function verify(id: string) {
    const val = (id || '').trim();
    if (!val) return;

    setLoading(true);
    setRow(null);
    setSignedUrl(null);

    try {
      // 1) Look up by cert_id (public SELECT policy must allow this)
      const { data } = await supabase
        .from('certificates')
        .select('cert_id, full_name, course_key, issued_at, storage_path')
        .eq('cert_id', val)
        .maybeSingle<CertRow>();

      setRow(data ?? null);

      // 2) Optional: create a short-lived signed URL to view the PDF
      if (data?.storage_path) {
        const { data: signed } = await supabase
          .storage
          .from('certificates')
          .createSignedUrl(data.storage_path, 60 * 10); // 10 min
        setSignedUrl(signed?.signedUrl ?? null);
      }
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }

  useEffect(() => {
    if (initialCid) verify(initialCid);
  }, [initialCid]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Verify Certificate</h1>
      <p className="text-sm text-gray-600 mt-1">
        Paste the Certificate ID printed on the document.
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
          placeholder="e.g. pe-beginner-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        />
        <button
          className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm disabled:opacity-60"
          disabled={!cid || loading}
          type="submit"
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </form>

      {/* Results */}
      {showResult && row && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="text-green-800 font-medium">Certificate is valid ✅</div>
          <div className="text-sm text-gray-800 mt-2">
            <div><b>Name:</b> {row.full_name}</div>
            <div><b>Course:</b> {row.course_key}</div>
            <div><b>Issued:</b> {new Date(row.issued_at).toDateString()}</div>
            <div><b>Certificate ID:</b> {row.cert_id}</div>
          </div>
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm underline text-green-800"
            >
              View PDF
            </a>
          )}
        </div>
      )}

      {showResult && !row && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-amber-800 font-medium">Certificate not found ❌</div>
          <div className="text-sm text-gray-800 mt-2">
            We couldn’t find a certificate with ID <code className="px-1 rounded bg-white border">{cid}</code>.
            Please check the ID and try again.
          </div>
        </div>
      )}
    </div>
  );
}
