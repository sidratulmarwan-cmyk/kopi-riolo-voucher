import { NextResponse } from 'next/server';
import { kv, KEY_INDEX, keyValid, keyClaimed } from '@/lib/kv';
import { checkAdmin } from '@/lib/auth';

// Ambil banyak key sekaligus dengan MGET (1 perintah per 500 key),
// bukan 2 perintah per nomor HP seperti sebelumnya.
async function mgetChunked(keys, size = 500) {
  const out = [];
  for (let i = 0; i < keys.length; i += size) {
    const part = keys.slice(i, i + size);
    const vals = await kv.mget(...part);
    out.push(...vals);
  }
  return out;
}

export async function GET(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ ok: false, message: 'Password admin salah.' }, { status: 401 });
  }

  const phones = (await kv.smembers(KEY_INDEX)) || [];
  let infos = [];
  let claims = [];
  if (phones.length) {
    [infos, claims] = await Promise.all([
      mgetChunked(phones.map(keyValid)),
      mgetChunked(phones.map(keyClaimed)),
    ]);
  }

  const items = phones.map((phone, i) => {
    const infoRaw = infos[i];
    const claimedAt = claims[i];
    let name = '';
    try {
      const info = typeof infoRaw === 'string' ? JSON.parse(infoRaw) : infoRaw;
      name = info?.name || '';
    } catch {
      // infoRaw bukan JSON yang valid, biarkan name kosong
    }
    return { phone, name, claimed: !!claimedAt, claimedAt: claimedAt || null };
  });

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
