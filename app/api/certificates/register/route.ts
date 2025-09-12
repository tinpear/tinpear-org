import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createAdmin } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server env missing' }, { status: 500 });
  }

  const admin = createAdmin(url, serviceKey, { auth: { persistSession: false } });

  // Identify user (cookie or Bearer token)
  const cookieStore = cookies();
  const supaFromCookies = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: cookieUser } = await supaFromCookies.auth.getUser();
  let user = cookieUser?.user ?? null;

  const authHeader = req.headers.get('authorization');
  if (!user && authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7);
    const { data: bearerUser } = await admin.auth.getUser(jwt);
    user = bearerUser?.user ?? null;
  }
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const certId = (body?.certId || '').trim();
  const fullName = (body?.fullName || '').trim() || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner';
  const courseKey = (body?.courseKey || 'pe-beginner').trim();
  const storagePath = (body?.storagePath || '').trim() || null;

  if (!certId) return NextResponse.json({ error: 'Missing certId' }, { status: 400 });

  const { error } = await admin
    .from('certificates')
    .upsert({
      cert_id: certId,
      user_id: user.id,
      full_name: fullName,
      course_key: courseKey,
      issued_at: new Date().toISOString(),
      ...(storagePath ? { storage_path: storagePath } : {}),
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
