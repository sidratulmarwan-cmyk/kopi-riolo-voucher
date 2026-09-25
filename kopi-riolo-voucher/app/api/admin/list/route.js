import { NextResponse } from 'next/server';
import { kv, KEY_INDEX, keyValid, keyClaimed } from '@/lib/kv';
import { checkAdmin } from '@/lib/auth';

export async function GET(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ ok: false, message: 'Password admin salah.' }, { status: 401 });
  }

  const phones = (await kv.smembers(KEY_INDEX)) || [];
  const items = [];

  for (const phone of phones) {
    const [infoRaw, claimedAt] = await Promise.all([kv.get(keyValid(phone)), kv.get(keyClaimed(phone))]);
    let name = '';
    try {
      const info = typeof infoRaw === 'string' ? JSON.parse(infoRaw) : infoRaw;
      name = info?.name || '';
    } catch {
      // infoRaw bukan JSON yang valid, biarkan name kosong
    }
    items.push({ phone, name, claimed: !!claimedAt, claimedAt: claimedAt || null });
  }

  items.sort((a, b) => String(a.phone).localeCompare(String(b.phone)));
  const claimed = items.filter((i) => i.claimed).length;

  return NextResponse.json({
    ok: true,
    total: items.length,
    claimed,
    remaining: items.length - claimed,
    items,
  });
}
