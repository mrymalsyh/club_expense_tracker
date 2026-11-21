import type { Metadata } from 'next';
import { Archivo_Black, Space_Mono, Inter } from 'next/font/google';
import './globals.css';

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Club Expense Tracker — Sistem Penjejak Bajet & Perbelanjaan Kelab',
  description:
    'Sistem Penjejak Bajet & Perbelanjaan Kelab untuk bendahari dan jawatankuasa program pelajar mengurus pendapatan, perbelanjaan, dan baki semasa dalam RM.',
  openGraph: {
    title: 'Club Expense Tracker — Sistem Penjejak Bajet & Perbelanjaan Kelab',
    description:
      'Sistem Penjejak Bajet & Perbelanjaan Kelab untuk bendahari dan jawatankuasa program pelajar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Club Expense Tracker — Sistem Penjejak Bajet & Perbelanjaan Kelab',
    description:
      'Sistem Penjejak Bajet & Perbelanjaan Kelab untuk bendahari dan jawatankuasa program pelajar.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      className={`${archivoBlack.variable} ${spaceMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[#FF4D00] text-black antialiased selection:bg-black selection:text-[#FF4D00]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
