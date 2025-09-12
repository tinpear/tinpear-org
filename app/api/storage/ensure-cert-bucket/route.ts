import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server env missing' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Create the private bucket if missing
  const { data: bucket } = await admin.storage.getBucket('certificates');
  if (!bucket) {
    await admin.storage.createBucket('certificates', { public: false });
  }

  return NextResponse.json({ ok: true });
}
