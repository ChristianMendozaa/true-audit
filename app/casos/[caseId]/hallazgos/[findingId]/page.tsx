import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCasoById, getHallazgoById } from '@/lib/mock-data';
import FindingChain from '@/components/visual/FindingChain';
import StatusPill from '@/components/data/StatusPill';
import SectionRule from '@/components/shell/SectionRule';

interface FindingDetailProps {
  params: Promise<{ caseId: string; findingId: string }>;
}

export async function generateMetadata({ params }: FindingDetailProps) {
  const { caseId, findingId } = await params;
  const h = getHallazgoById(caseId, findingId);
  return { title: h ? `${h.numero} · True Audit` : 'Hallazgo · True Audit' };
}

export default async function FindingDetail({ params }: FindingDetailProps) {
  const { caseId, findingId } = await params;
  const caso = getCasoById(caseId);
  const hallazgo = getHallazgoById(caseId, findingId);
  if (!caso || !hallazgo) notFound();

  const severidadColor = hallazgo.severidad === 'critico' ? '#C8412C'
    : hallazgo.severidad === 'medio' ? '#B88A1C'
    : '#5B7034';

  const allIds = caso.hallazgos.map(h => h.id);
  const currentIdx = allIds.indexOf(hallazgo.id);
  const prevId = currentIdx > 0 ? allIds[currentIdx - 1] : null;
  const nextId = currentIdx < allIds.length - 1 ? allIds[currentIdx + 1] : null;

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-ink-muted mb-8" style={{ fontFamily: 'var(--font-mono)' }}>
        <Link href={`/casos/${caseId}/hallazgos`} className="hover:text-ink transition-colors">
          ← Hallazgos
        </Link>
        <span>/</span>
        <span>{hallazgo.numero}</span>
      </div>

      {/* Finding header */}
      <div
        className="border-l-4 pl-6 mb-8"
        style={{ borderColor: severidadColor }}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs text-ink-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {hallazgo.numero}
            </span>
            <StatusPill status={hallazgo.severidad} />
            <StatusPill status={hallazgo.estadoRespuesta} />
          </div>
          <div
            className="font-mono text-xs text-ink-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Emitido {hallazgo.fechaEmision}
          </div>
        </div>
        <h1
          className="font-display font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '-0.03em' }}
        >
          {hallazgo.titulo}
        </h1>
      </div>

      <SectionRule label="Cadena de trazabilidad" number={1} />

      {/* Finding chain */}
      <div className="mb-10 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
        <FindingChain hallazgo={hallazgo} caso={caso} />
      </div>

      {/* Navigation */}
      <div className="border-t border-rule pt-6 flex items-center justify-between">
        {prevId ? (
          <Link
            href={`/casos/${caseId}/hallazgos/${prevId}`}
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Hallazgo anterior
          </Link>
        ) : <div />}
        <Link
          href={`/casos/${caseId}/hallazgos`}
          className="text-xs text-ink-muted hover:text-ink transition-colors font-mono"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Ver todos los hallazgos
        </Link>
        {nextId ? (
          <Link
            href={`/casos/${caseId}/hallazgos/${nextId}`}
            className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Hallazgo siguiente
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
