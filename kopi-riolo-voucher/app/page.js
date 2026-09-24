'use client';

import { useState } from 'react';

export default function ClaimPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!phone.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ ok: false, message: 'Koneksi bermasalah. Periksa internet Anda dan coba lagi.' });
    }
    setLoading(false);
  }

  function reset() {
    setPhone('');
    setResult(null);
  }

  return (
    <div className="wrap">
      <div className="ticket">
        <div className="t-top">
          <img className="logo" src="/logo.png" alt="Daeng Coffee & Eatery" />
          <div className="eyebrow">KLAIM KOPI RIOLO</div>
        </div>
        <div className="perf" />
        <div className="t-bot">
          {!result && (
            <form onSubmit={submit}>
              <label className="lbl" htmlFor="phone">
                Nomor HP pendaftaran Pariolo Show
              </label>
              <input
                id="phone"
                className="inp"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Memeriksa...' : 'Cek voucher'}
              </button>
              <p className="hint">
                Gunakan nomor HP yang sama dengan saat mendaftar Pariolo Show.
              </p>
            </form>
          )}

          {result && (
            <div className={'result ' + (result.ok ? 'ok' : 'bad')}>
              <p className="big">{result.message}</p>
              {result.ok && (
                <p className="hint">
                  Berlaku 1x klaim per nomor, khusus di Daeng Coffee &amp; Eatery cabang Binamu.
                </p>
              )}
              <button className="btn ghost" type="button" onClick={reset}>
                Cek nomor lain
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="foot">Daeng Coffee &amp; Eatery &middot; Cabang Binamu</p>
    </div>
  );
}
