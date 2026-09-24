// Menyamakan format nomor HP Indonesia supaya "0812...", "+62812...",
// "62812...", dan "812..." semuanya dianggap nomor yang sama.
export function normalizePhone(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8')) {
    digits = '62' + digits;
  }
  // Jika sudah diawali 62 (atau format lain), dipakai apa adanya.
  return digits;
}

export function isValidPhoneLength(digits) {
  return digits.length >= 10 && digits.length <= 15;
}
