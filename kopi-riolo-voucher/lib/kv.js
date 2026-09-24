import { Redis } from '@upstash/redis';

// Vercel menyuntikkan variabel environment ini secara otomatis setelah Anda
// menghubungkan integrasi "Upstash for Redis" dari Marketplace. Nama variabel
// bisa KV_REST_API_URL/TOKEN (nama lama) atau UPSTASH_REDIS_REST_URL/TOKEN
// (nama baru) tergantung versi integrasi, jadi keduanya dicoba di sini.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // Tidak melempar error di sini supaya halaman tetap bisa dibuka untuk
  // debugging, tapi setiap pemanggilan kv.* akan gagal sampai variabel
  // environment ini diisi. Lihat README.md langkah 3.
  console.warn(
    '[kv] KV_REST_API_URL / KV_REST_API_TOKEN belum diisi. Hubungkan database Redis (Upstash) di Vercel terlebih dahulu.'
  );
}

export const kv = new Redis({ url: url || '', token: token || '' });

export const KEY_INDEX = 'kopiriolo:index';
export const keyValid = (phone) => `kopiriolo:valid:${phone}`;
export const keyClaimed = (phone) => `kopiriolo:claimed:${phone}`;
