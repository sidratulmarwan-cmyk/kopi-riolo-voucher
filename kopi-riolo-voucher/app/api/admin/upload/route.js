import { NextResponse } from 'next/server';
import { kv, KEY_INDEX, keyValid } from '@/lib/kv';
import { normalizePhone, isValidPhoneLength } from '@/lib/phone';
import { checkAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ ok: false, message: 'Password admin salah.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const entries = Array.isArray(body?.entries) ? body.entries : [];
  if (!entries.length) {
    return NextResponse.json({ ok: false, message: 'Tidak ada data untuk disimpan.' }, { status: 400 });
  }
  if (entries.length > 500) {
    return NextResponse.json({ ok: false, message: 'Terlalu banyak baris dalam satu kali upload.' }, { status: 400 });
  }

  let added = 0;
  let skipped = 0;
  const seen = new Set();

  for (const entry of entries) {
    const phone = normalizePhone(entry?.phone || '');
    if (!phone || !isValidPhoneLength(phone) || seen.has(phone)) {
      skipped++;
      continue;
    }
    seen.add(phone);
    const name = (entry?.name || '').toString().slice(0, 60);
    await kv.sadd(KEY_INDEX, phone);
    await kv.set(keyValid(phone), JSON.stringify({ name, addedAt: new Date().toISOString() }));
    added++;
  }

  return NextResponse.json({ ok: true, added, skipped });
}
