# Klaim Kopi Riolo — Pariolo Show x Daeng Coffee & Eatery

Aplikasi web sederhana untuk klaim 1 cup Kopi Riolo per nomor HP peserta
Pariolo Show, khusus di Daeng Coffee & Eatery cabang Binamu.

- **Customer** scan QR → buka halaman → isi nomor HP pendaftaran Pariolo Show
  → kalau terdaftar dan belum pernah klaim, muncul pesan berhak klaim →
  tunjukkan layar itu ke kasir.
- **Admin (Anda)** buka halaman `/admin` → login pakai password → upload
  Excel daftar nomor dari panitia → pantau berapa yang sudah klaim → buat &
  unduh QR code.
- Tidak perlu akun Claude maupun login apa pun untuk customer. Tidak perlu
  akun sama sekali untuk kasir — cukup lihat layar HP customer.

Satu nomor HP hanya bisa klaim **1 kali**, dicek langsung di server jadi
tidak bisa dicurangi dengan refresh halaman berkali-kali.

---

## 1. Yang perlu disiapkan

- Akun [Vercel](https://vercel.com) (gratis) — untuk hosting.
- Akun [GitHub](https://github.com) (gratis) — cara termudah deploy ke
  Vercel adalah lewat GitHub. Bisa juga tanpa GitHub memakai Vercel CLI,
  lihat opsi B di bawah.
- File Excel/CSV daftar nomor HP dari panitia Pariolo Show (menyusul
  27 September).

## 2. Deploy ke Vercel

### Opsi A — lewat GitHub (disarankan)

1. Buat repository baru di GitHub, lalu upload seluruh isi folder ini ke
   repository tersebut.
2. Buka [vercel.com/new](https://vercel.com/new), pilih **Import** repository
   tadi.
3. Biarkan pengaturan default (Vercel otomatis mengenali ini project
   Next.js), lalu klik **Deploy**.
4. Deploy pertama ini akan tetap jalan walau database belum terhubung,
   tapi halaman klaim belum bisa dipakai sampai langkah 3 selesai.

### Opsi B — tanpa GitHub, lewat terminal

```bash
npm install -g vercel
cd kopi-riolo-voucher
vercel login
vercel
```
Ikuti pertanyaan di terminal (pilih "Link to existing project? No", nama
project bebas). Setelah selesai, jalankan `vercel --prod` untuk deploy ke
alamat production.

## 3. Hubungkan database (wajib, supaya status klaim tersimpan)

Vercel KV (produk lama) sudah digantikan integrasi Marketplace. Caranya:

1. Di dashboard project Anda di Vercel, buka tab **Storage** (atau
   **Marketplace**).
2. Cari **Upstash for Redis** (gratis untuk skala kecil seperti ini,
   80 nomor sangat ringan), klik **Add** / **Connect**, ikuti langkahnya.
3. Setelah terhubung, Vercel otomatis menambahkan environment variable
   `KV_REST_API_URL` dan `KV_REST_API_TOKEN` (atau nama serupa) ke project
   Anda. Tidak perlu Anda isi manual.
4. Buka tab **Deployments** → klik titik tiga pada deployment terakhir →
   **Redeploy**, supaya environment variable baru terbaca.

## 4. Set password admin

1. Buka **Project Settings → Environment Variables**.
2. Tambahkan variable baru:
   - Name: `ADMIN_PASSWORD`
   - Value: password pilihan Anda (jangan yang mudah ditebak)
3. Simpan, lalu **Redeploy** sekali lagi.

## 5. Mulai pakai

1. Buka `https://nama-project-anda.vercel.app/admin`, masukkan
   `ADMIN_PASSWORD` tadi.
2. Setelah panitia kasih file Excel (tanggal 27 September), upload di
   bagian **Upload daftar nomor HP**. Aplikasi akan membaca kolom nomor HP
   (dan nama kalau ada) secara otomatis, tunjukkan pratinjau dulu sebelum
   Anda simpan.
3. Di bagian **QR code untuk customer**, pastikan link-nya sudah alamat
   Vercel Anda (otomatis terisi), lalu **Unduh PNG** dan cetak. Tempel QR
   ini di meja kasir/spot event cabang Binamu.
4. Saat event berlangsung, cukup pantau halaman `/admin` untuk melihat
   berapa yang sudah klaim. Kalau ada yang salah pencet atau perlu
   dibatalkan, ada tombol **Batalkan** di tiap baris.
5. Kalau ada acara serupa lagi nanti, gunakan **Reset semua data** di
   bagian bawah untuk mulai daftar baru dari nol.

## Format file Excel/CSV

Tidak perlu format kaku. Setiap baris cukup ada satu kolom berisi nomor HP
(boleh format `0812...`, `+62812...`, atau `62812...`), kolom nama bersifat
opsional. Baris header seperti "No HP" / "Nama" otomatis dilewati karena
tidak mengandung angka yang menyerupai nomor telepon.

## Catatan

- Desain ini untuk **satu cabang, satu perangkat kasir** (sesuai kebutuhan
  Anda saat ini). Kalau nanti perlu banyak kasir/banyak cabang sekaligus,
  beri tahu saya — strukturnya bisa dikembangkan dengan menambah field
  cabang pada data.
- Password admin adalah proteksi sederhana (satu password untuk semua),
  bukan sistem login berlapis. Jangan bagikan password ini ke customer.
- Nomor HP dan status klaim tersimpan di database Upstash Redis yang
  terhubung ke project Vercel Anda — bukan di penyimpanan lokal HP
  customer, jadi aman walau customer ganti HP atau tutup browser.
