'use client';

import React, { useRef, useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from '@react-pdf/renderer';
import { supabase } from '@/lib/supabase';

/** Brand palette (greens + gold) */
const COLORS = {
  greenDark: '#0b4a36',
  green: '#16a34a',
  greenDeep: '#0f3d2d',
  gold: '#CBA135',
  text: '#0f172a',
  textMuted: '#5b6270',
  paper: '#ffffff',
  paperTint: '#f7f7f9',
};

/** Fonts served from /public/fonts */
try {
  Font.register({ family: 'Playfair-Bold', src: '/fonts/PlayfairDisplay-Bold.ttf' });
  Font.register({ family: 'Poppins', src: '/fonts/Poppins-Regular.ttf' });
  Font.register({ family: 'Poppins-Semi', src: '/fonts/Poppins-SemiBold.ttf' });
  Font.register({ family: 'GreatVibes', src: '/fonts/GreatVibes-Regular.ttf' });
} catch {}

/** Styles (react-pdf friendly) */
const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.paper, padding: 24 },

  canvas: {
    position: 'relative',
    borderRadius: 10,
    backgroundColor: COLORS.paper,
    minHeight: 792 - 48,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eceef2',
  },

  // Decorative geometric corners
  cornerTR: {
    position: 'absolute', top: -60, right: -60, width: 220, height: 220,
    backgroundColor: COLORS.greenDark, transform: 'rotate(45deg)',
  },
  cornerTRInset: {
    position: 'absolute', top: -50, right: -50, width: 180, height: 180,
    backgroundColor: COLORS.greenDeep, transform: 'rotate(45deg)',
    borderWidth: 6, borderColor: COLORS.gold,
  },
  cornerBL: {
    position: 'absolute', bottom: -80, left: -80, width: 260, height: 260,
    backgroundColor: COLORS.greenDark, transform: 'rotate(45deg)',
  },
  cornerBLInset: {
    position: 'absolute', bottom: -65, left: -65, width: 210, height: 210,
    backgroundColor: COLORS.greenDeep, transform: 'rotate(45deg)',
    borderWidth: 6, borderColor: COLORS.gold,
  },

  // Faint inner backdrop
  backdrop: {
    position: 'absolute', top: 28, left: 28, right: 28, bottom: 28,
    backgroundColor: COLORS.paperTint, borderRadius: 8, opacity: 0.35,
  },

  // Header: medal + title + plate
  headerWrap: { marginTop: 64, alignItems: 'center' },
  medalWrap: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.greenDark,
    alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: COLORS.gold,
  },
  medalStar: { fontFamily: 'Poppins-Semi', color: '#fff', fontSize: 24 },

  title: {
    fontFamily: 'Playfair-Bold', fontSize: 36, color: COLORS.greenDark, marginTop: 10, letterSpacing: 2,
  },

  plate: {
    marginTop: 8,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 18, borderWidth: 2, borderColor: COLORS.gold, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center',
  },
  plateText: {
    fontFamily: 'Poppins-Semi', fontSize: 12, color: COLORS.greenDark, letterSpacing: 3,
  },

  // Recipient section
  subline: {
    marginTop: 30, textAlign: 'center', fontFamily: 'Poppins', color: COLORS.textMuted, fontSize: 12,
  },
  name: {
    marginTop: 10, textAlign: 'center', fontFamily: 'GreatVibes', fontSize: 40, color: COLORS.greenDark,
  },
  flourishWrap: { alignItems: 'center', marginTop: 8 },
  flourish: { width: 120, height: 1.5, backgroundColor: COLORS.gold },

  description: {
    marginTop: 12, marginLeft: 64, marginRight: 64, textAlign: 'center',
    fontFamily: 'Poppins', fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5,
  },

  awarded: {
    marginTop: 28, textAlign: 'center', fontFamily: 'Poppins-Semi', fontSize: 12, color: COLORS.text,
  },

  // Signer + brand row
  signerRow: {
    marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginLeft: 80, marginRight: 80,
  },
  logo: { width: 100, height: 28 },

  sigBlock: { alignItems: 'center' },
  signLine: { width: 200, height: 1.2, backgroundColor: COLORS.text },
  signName: { marginTop: 6, fontFamily: 'Poppins-Semi', fontSize: 11, color: COLORS.text },
  signTitle: { marginTop: 2, fontFamily: 'Poppins', fontSize: 10, color: COLORS.textMuted },

  // Verify block (bottom-right)
  verify: { position: 'absolute', right: 28, bottom: 20, alignItems: 'flex-end' },
  verifyLabel: { fontFamily: 'Poppins', fontSize: 9.5, color: COLORS.textMuted },
  verifyValue: { fontFamily: 'Poppins', fontSize: 9.5, color: COLORS.text },
});

/** Turn a /public PNG/JPG into a data URL (react-pdf friendly) */
async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Logo fetch failed (${res.status})`);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Certificate document */
export function CertificateDoc({
  fullName,
  courseTitle = 'Course Certificate',
  issuedAt = new Date(),
  certId,
  logoDataUrl,
  verifyBase = 'https://tinpear.org/verify',
  signerName = 'Chinonso Okereke',
  signerTitle = 'CEO, Tinpear',
}: {
  fullName: string;
  courseTitle?: string;
  issuedAt?: Date;
  certId: string;
  logoDataUrl?: string | null;
  verifyBase?: string;
  signerName?: string;
  signerTitle?: string;
}) {
  const verifyUrl = `${verifyBase}?cid=${encodeURIComponent(certId)}`;
  const awardedLine = `Awarded on this ${issuedAt.toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  })}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.canvas}>
          {/* Decoration */}
          <View style={styles.cornerTR} />
          <View style={styles.cornerTRInset} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBLInset} />
          <View style={styles.backdrop} />

          {/* Header */}
          <View style={styles.headerWrap}>
            <View style={styles.medalWrap}><Text style={styles.medalStar}>★</Text></View>
            <Text style={styles.title}>CERTIFICATE</Text>
            <View style={styles.plate}><Text style={styles.plateText}>OF COMPLETION</Text></View>
          </View>

          {/* Recipient */}
          <Text style={styles.subline}>This is to certify that</Text>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.flourishWrap}><View style={styles.flourish} /></View>

          <Text style={styles.description}>
            has successfully completed {courseTitle}, demonstrating knowledge, professionalism,
            and commitment throughout the program.
          </Text>

          <Text style={styles.awarded}>{awardedLine}</Text>

          {/* Signer + logo */}
          <View style={styles.signerRow}>
            {logoDataUrl ? (
              <Image src={logoDataUrl} style={styles.logo} />
            ) : (
              <Text style={{ fontFamily: 'Poppins-Semi', color: COLORS.greenDark, fontSize: 12 }}>TINPEAR</Text>
            )}
            <View style={styles.sigBlock}>
              <View style={styles.signLine} />
              <Text style={styles.signName}>{signerName}</Text>
              <Text style={styles.signTitle}>{signerTitle}</Text>
            </View>
          </View>

          {/* Verify */}
          <View style={styles.verify}>
            <Text style={styles.verifyLabel}>Verify:</Text>
            <Text style={styles.verifyValue}>{verifyUrl.replace(/^https?:\/\//, '')}</Text>
            <Text style={styles.verifyLabel}>Certificate ID: {certId}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/** Helper: fallback course title from courseKey if not provided */
function titleFromCourseKey(courseKey?: string): string | undefined {
  if (!courseKey) return undefined;
  const key = courseKey.toLowerCase();
  if (key.includes('ai-everyone')) return 'AI for Everyone';
  if (key.includes('pe-beginner')) return 'Prompt Engineering · Beginner';
  return undefined;
}

/** Actions: Download + (optional) Save to Supabase (Storage + certificates table)
 *
 * - certId persists across re-renders (ref)
 * - optional record-on-download so /verify works even without "Save to Supabase"
 * - logo is converted to a data URL for reliable rendering
 */
export default function CertificatePDFActions({
  fullName,
  logoUrl = '/logo.png',
  courseKey = 'ai-everyone',
  certPrefix = courseKey,
  showSaveToSupabase = true,
  verifyBase = 'https://tinpear.org/verify',
  recordOnDownload = true,
  courseTitle,         // NEW: prefer explicit title
  signerName,          // optional override
  signerTitle,         // optional override
}: {
  fullName: string;
  logoUrl?: string;
  courseKey?: string;
  certPrefix?: string;
  showSaveToSupabase?: boolean;
  verifyBase?: string;
  recordOnDownload?: boolean;
  courseTitle?: string;
  signerName?: string;
  signerTitle?: string;
}) {
  const [busy, setBusy] = useState(false);

  // Persist ONE cert id for this component instance
  const certIdRef = useRef<string>('');
  if (!certIdRef.current) {
    const base =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    certIdRef.current = `${certPrefix}-${base}`;
  }
  const certId = certIdRef.current;

  async function getLogoDataUrl(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      const absoluteLogo = new URL(logoUrl, window.location.origin).toString();
      if (!/\.(png|jpe?g)$/i.test(absoluteLogo)) return null; // react-pdf supports png/jpg
      return await toDataUrl(absoluteLogo);
    } catch {
      return null;
    }
  }

  async function renderBlob() {
    const logoDataUrl = await getLogoDataUrl();
    // prefer explicit courseTitle; otherwise infer from courseKey; otherwise neutral
    const effectiveTitle = courseTitle || titleFromCourseKey(courseKey) || 'Course Certificate';
    return pdf(
      <CertificateDoc
        fullName={fullName}
        certId={certId}
        logoDataUrl={logoDataUrl}
        verifyBase={verifyBase}
        courseTitle={effectiveTitle}
        signerName={signerName}
        signerTitle={signerTitle}
      />
    ).toBlob();
  }

  async function recordCertificate(storage_path?: string) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const res = await fetch('/api/certificates/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({
        certId,
        fullName,
        courseKey,
        ...(storage_path ? { storagePath: storage_path } : {}),
      }),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      throw new Error(msg?.error || `Register failed (${res.status})`);
    }
  }

  async function downloadPdf() {
    setBusy(true);
    try {
      const blob = await renderBlob();

      // Optionally record for verification even if user doesn't save
      if (recordOnDownload) {
        await recordCertificate(); // without storage_path
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${fullName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || 'Could not generate PDF.');
    } finally {
      setBusy(false);
    }
  }

  async function saveToSupabase() {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error('Please sign in first.');

      const blob = await renderBlob();
      const path = `${courseKey}/${data.user.id}/${certId}.pdf`;

      // Upload to Storage
      const { error } = await supabase.storage.from('certificates').upload(path, blob, {
        upsert: true,
        contentType: 'application/pdf',
      });
      if (error) throw error;

      // Optional: short signed URL for immediate viewing
      const { data: signed } = await supabase.storage
        .from('certificates')
        .createSignedUrl(path, 60 * 60 * 24 * 30);

      // Record metadata WITH storage_path so verify page can show "View PDF"
      await recordCertificate(path);

      alert('Saved! ' + (signed?.signedUrl ?? ''));
    } catch (e: any) {
      alert(e?.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={downloadPdf}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:shadow disabled:opacity-60"
      >
        {busy ? 'Preparing…' : 'Download PDF'}
      </button>

      {showSaveToSupabase && (
        <button
          onClick={saveToSupabase}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save to Supabase'}
        </button>
      )}
    </div>
  );
}
