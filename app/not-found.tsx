import Link from 'next/link';
import SiteHeader from '@/components/shell/SiteHeader';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div
            className="font-display font-black text-rule leading-none mb-8 select-none"
            style={{ fontFamily: 'var(--font-display)', fontSize: '8rem', letterSpacing: '0em' }}
          >
            404
          </div>
          <div className="h-px bg-rule mb-8" />
          <h1
            className="font-display text-2xl font-bold text-ink mb-3"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            Expediente no encontrado
          </h1>
          <p className="text-ink-muted mb-8">
            El recurso solicitado no existe en el sistema de auditoría.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper text-sm hover:bg-ink-soft transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
