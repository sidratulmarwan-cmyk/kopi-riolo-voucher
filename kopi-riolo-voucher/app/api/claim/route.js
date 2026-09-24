import { NextResponse } from 'next/server';
import { kv, keyValid, keyClaimed } from '@/lib/kv';
import { normalizePhone, isValidPhoneLength } from '@/lib/phone';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const raw = body?.phone;
  if (!raw || typeof raw !== 'string') {
    return NextResponse.json({ ok: false, message: 'Masukkan nomor HP Anda.' }, { status: 400 });
  }

  const phone = normalizePhone(raw);
  if (!isValidPhoneLength(phone)) {
    return NextResponse.json({ ok: false, message: 'Format nomor HP tidak valid.' }, { status: 400 });
  }

  let isValid;
  try {
    isValid = await kv.get(keyValid(phone));
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: 'Sistem sedang bermasalah. Coba lagi sebentar lagi.' },
      { status: 500 }
    );
  }

  if (!isValid) {
    return NextResponse.json({
      ok: false,
      status: 'not_found',
      message: 'Nomor HP ini tidak terdaftar sebagai peserta Pariolo Show.',
    });
  }

  // SET ... NX bersifat atomik: kalau dua orang submit nomor yang sama
  // hampir bersamaan, hanya salah satu yang berhasil membuat key ini.
  const claimedNow = await kv.set(keyClaimed(phone), new Date().toISOString(), { nx: true });

  if (!claimedNow) {
    return NextResponse.json({
      ok: false,
      status: 'already_claimed',
      message: 'Nomor HP ini sudah pernah klaim Kopi Riolo.',
    });
  }

  return NextResponse.json({
    ok: true,
    status: 'claimed',
    message:
      'Anda berhak klaim Kopi Riolo untuk event Pariolo Show, perlihatkan ke kasir untuk klaim.',
  });
}
