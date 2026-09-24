// Proteksi sederhana untuk halaman /admin: satu password yang disimpan
// sebagai environment variable ADMIN_PASSWORD di Vercel. Cukup untuk satu
// kasir/satu cabang, bukan sistem login multi-user.
export function checkAdmin(req) {
  const provided = req.headers.get('x-admin-password') || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected.length > 0 && provided === expected;
}
