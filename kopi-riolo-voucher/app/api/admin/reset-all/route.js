import { NextResponse } from 'next/server';
import { kv, KEY_INDEX, keyValid, keyClaimed } from '@/lib/kv';
import { checkAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ ok: false, message: 'Password admin salah.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (body?.confirm !== 'HAPUS SEMUA') {
    return NextResponse.json({ ok: false, message: 'Konfirmasi tidak sesuai.' }, { status: 400 });
  }

  const phones = (await kv.smembers(KEY_INDEX)) || [];
  for (const phone of phones) {
    await kv.del(keyValid(phone));
    await kv.del(keyClaimed(phone));
  }
  await kv.del(KEY_INDEX);

  return NextResponse.json({ ok: true, removed: phones.length });
}
