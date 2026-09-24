'use client';

import { useCallback, useEffect, useState } from 'react';

const PW_KEY = 'kr_admin_pw';

function extractPhoneName(row) {
  let phone = null;
  let name = null;
  for (const cell of row || []) {
    const s = String(cell ?? '').trim();
    if (!s) continue;
    const digits = s.replace(/\D/g, '');
    if (!phone && digits.length >= 9 && digits.length <= 15 && /^[+\d\s\-().]+$/.test(s)) {
      phone = s;
    } else if (!name) {
      name = s;
    }
  }
  return phone ? { phone, name: name || '' } : null;
}

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [preview, setPreview] = useState(null);

  const load = useCallback(async (password) => {
    try {
      const res = await fetch('/api/admin/list', { headers: { 'x-admin-password': password } });
      if (res.status === 401) {
        setLoginErr('Password admin salah.');
        setAuthed(false);
        return false;
      }
      const j = await res.json();
      setData(j);
      setAuthed(true);
      setLoginErr('');
      return true;
    } catch {
      setLoginErr('Tidak bisa terhubung ke server.');
      return false;
    }
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(PW_KEY) : null;
    if (saved) {
      setPw(saved);
      load(saved);
    }
    if (typeof window !== 'undefined') setQrUrl(window.location.origin);
  }, [load]);

  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => load(pw), 6000);
    return () => clearInterval(t);
  }, [authed, pw, load]);

  async function login(e) {
    e.preventDefault();
    const ok = await load(pw);
    if (ok && typeof window !== 'undefined') sessionStorage.setItem(PW_KEY, pw);
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFlash('');
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const entries = [];
      let skipped = 0;
      for (const row of rows) {
        const found = extractPhoneName(row);
        if (found) entries.push(found);
        else skipped++;
      }
      setPreview({ entries, skipped });
    } catch {
      setFlash('Gagal membaca file. Pastikan formatnya .xlsx, .xls, atau .csv.');
    }
    setBusy(false);
    e.target.value = '';
  }

  async function confirmUpload() {
    if (!preview?.entries?.length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ entries: preview.entries }),
      });
      const j = await res.json();
      if (j.ok) {
        setFlash(`${j.added} nomor ditambahkan${j.skipped ? `, ${j.skipped} baris dilewati` : ''}.`);
        setPreview(null);
        load(pw);
      } else {
        setFlash(j.message || 'Gagal menyimpan.');
      }
    } catch {
      setFlash('Gagal terhubung ke server.');
    }
    setBusy(false);
  }

  async function resetOne(phone) {
    if (!confirm(`Batalkan status klaim untuk nomor ...${phone.slice(-4)}?`)) return;
    setBusy(true);
    try {
      await fetch('/api/admin/reset-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ phone }),
      });
      setFlash('Klaim dibatalkan.');
      load(pw);
    } catch {
      setFlash('Gagal terhubung ke server.');
    }
    setBusy(false);
  }

  async function resetAll() {
    const typed = prompt(
      'Ini akan menghapus SEMUA data nomor & status klaim. Ketik persis: HAPUS SEMUA'
    );
    if (typed !== 'HAPUS SEMUA') return;
    setBusy(true);
    try {
      await fetch('/api/admin/reset-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ confirm: typed }),
      });
      setFlash('Semua data direset.');
      load(pw);
    } catch {
      setFlash('Gagal terhubung ke server.');
    }
    setBusy(false);
  }

  if (!authed) {
    return (
      <div className="wrap">
        <form className="card" onSubmit={login}>
          <h2>Admin &middot; Klaim Kopi Riolo</h2>
          <label className="f" htmlFor="pw">Password admin</label>
          <input
            id="pw"
            className="inp"
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          {loginErr && <p className="err">{loginErr}</p>}
          <button className="btn" type="submit">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="wrap">
      {flash && <p className="flash">{flash}</p>}

      <div className="card">
        <h2>Ringkasan</h2>
        <div className="sum">
          <div><span>Total nomor</span><b>{data?.total ?? 0}</b></div>
          <div><span>Sudah klaim</span><b>{data?.claimed ?? 0}</b></div>
          <div><span>Sisa</span><b>{data?.remaining ?? 0}</b></div>
        </div>
      </div>

      <div className="card">
        <h3>Upload daftar nomor HP</h3>
        <p className="hint">
          File Excel (.xlsx/.xls) atau CSV dari panitia Pariolo Show. Kolom nomor HP dan nama
          boleh urutan apa saja &mdash; baris yang sudah ada nomornya tidak akan dobel.
        </p>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} disabled={busy} style={{ marginTop: 10 }} />
        {preview && (
          <div className="preview">
            <p>
              <b>{preview.entries.length}</b> nomor terbaca
              {preview.skipped ? `, ${preview.skipped} baris dilewati` : ''}.
            </p>
            <ul className="list">
              {preview.entries.slice(0, 8).map((p, i) => (
                <li key={i}><span>{p.phone}{p.name ? ` · ${p.name}` : ''}</span></li>
              ))}
            </ul>
            {preview.entries.length > 8 && (
              <p className="hint">...dan {preview.entries.length - 8} nomor lainnya.</p>
            )}
            <button className="btn" onClick={confirmUpload} disabled={busy}>Simpan ke database</button>
            <button className="btn ghost" onClick={() => setPreview(null)} disabled={busy}>Batal</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>QR code untuk customer</h3>
        <label className="f" htmlFor="qrurl">Link halaman klaim (setelah aplikasi ini di-deploy)</label>
        <input
          id="qrurl"
          className="inp"
          value={qrUrl}
          onChange={(e) => setQrUrl(e.target.value)}
          placeholder="https://nama-project-anda.vercel.app"
        />
        {qrUrl && (
          <div className="qrbox">
            <img src={`/api/qr?url=${encodeURIComponent(qrUrl)}`} alt="QR Code" width={220} height={220} />
            <a className="btn ghost sm" href={`/api/qr?url=${encodeURIComponent(qrUrl)}`} download="qr-klaim-kopi-riolo.png">
              Unduh PNG
            </a>
          </div>
        )}
        <p className="hint">Cetak QR ini dan taruh di meja/spot event supaya customer bisa scan.</p>
      </div>

      <div className="card">
        <h3>Daftar nomor ({data?.items?.length ?? 0})</h3>
        {(!data?.items || data.items.length === 0) && (
          <p className="hint">Belum ada data. Upload file Excel di atas.</p>
        )}
        <ul className="list">
          {data?.items?.map((it) => (
            <li key={it.phone}>
              <span>{it.phone}{it.name ? ` · ${it.name}` : ''}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={'pill ' + (it.claimed ? 'claimed' : 'open')}>
                  {it.claimed ? 'Sudah klaim' : 'Belum'}
                </span>
                {it.claimed && (
                  <button className="link" onClick={() => resetOne(it.phone)} disabled={busy}>
                    Batalkan
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card danger">
        <h3>Reset semua data</h3>
        <p className="hint">
          Menghapus seluruh daftar nomor dan status klaim. Gunakan hanya untuk memulai event baru
          dari nol.
        </p>
        <button className="btn ghost" onClick={resetAll} disabled={busy}>Reset semua</button>
      </div>
    </div>
  );
}
