import QRCode from 'qrcode';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Parameter url wajib diisi.', { status: 400 });
  }

  try {
    const buffer = await QRCode.toBuffer(url, {
      width: 640,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFFFF' },
    });
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response('Gagal membuat QR code.', { status: 500 });
  }
}
