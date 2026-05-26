'use client';

import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function Error({ error, unstable_retry }: ErrorProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div
            className="font-display font-black text-vermilion leading-none mb-8 select-none"
            style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', letterSpacing: '0em' }}
          >
            Error
          </div>
          <div className="h-px bg-rule mb-8" />
          <h1
            className="font-display text-2xl font-bold text-ink mb-3"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            Ocurrió un error inesperado
          </h1>
          <p className="text-ink-muted mb-2">{error.message || 'Error interno del sistema.'}</p>
          {error.digest && (
            <p
              className="font-mono text-xs text-ink-muted mb-8"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ref: {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={unstable_retry}
              className="px-5 py-2.5 bg-ink text-paper text-sm hover:bg-ink-soft transition-colors"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 border border-rule text-ink text-sm hover:border-ink-muted transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
