import { NextResponse } from 'next/server';
import { kv, keyClaimed } from '@/lib/kv';
import { normalizePhone } from '@/lib/phone';
import { checkAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ ok: false, message: 'Password admin salah.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const phone = normalizePhone(body?.phone || '');
  if (!phone) {
    return NextResponse.json({ ok: false, message: 'Nomor tidak valid.' }, { status: 400 });
  }

  await kv.del(keyClaimed(phone));
  return NextResponse.json({ ok: true });
}
