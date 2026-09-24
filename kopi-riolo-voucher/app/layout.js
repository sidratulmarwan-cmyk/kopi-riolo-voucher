import './globals.css';

export const metadata = {
  title: 'Klaim Kopi Riolo · Pariolo Show x Daeng Coffee & Eatery',
  description:
    'Klaim Kopi Riolo untuk peserta Pariolo Show di Daeng Coffee & Eatery cabang Binamu.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
