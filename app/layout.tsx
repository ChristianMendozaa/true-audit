import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono, Geist } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz', 'wght'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'True Audit · Auditoría de Sistemas',
  description:
    'Herramienta de auditoría asistida por computador para análisis, organización y defensa de hallazgos de auditoría de sistemas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${jetbrainsMono.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain-overlay">{children}</body>
    </html>
  );
}
