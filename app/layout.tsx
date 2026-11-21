import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
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
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
