import { notFound } from 'next/navigation';
import { getCasoById } from '@/lib/mock-data';
import Timeline from '@/components/visual/Timeline';

interface TimelinePageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: TimelinePageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Línea de tiempo · ${caso.numero} · True Audit` : 'Timeline · True Audit' };
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  return (
    <div className="dark min-h-full flex flex-col" style={{ background: '#0E1116' }}>
      {/* Header */}
      <div
        className="px-8 py-5 border-b"
        style={{ borderColor: '#2A3140', background: '#171B23' }}
      >
        <div
          className="font-mono uppercase tracking-widest mb-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890', letterSpacing: '0.12em' }}
        >
          Línea de tiempo del caso
        </div>
        <div
          className="font-display font-bold"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#E8E1D0', letterSpacing: '-0.03em' }}
        >
          {caso.titulo}
        </div>
        <div
          className="mt-1 font-mono"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6A7890' }}
        >
          {caso.banco} · {caso.fechaInicio} → hoy · {caso.timeline.length} eventos
        </div>
      </div>

      {/* Legend */}
      <div
        className="px-8 py-3 border-b flex items-center gap-6"
        style={{ borderColor: '#2A3140', background: '#0F131A' }}
      >
        {[
          { label: 'Solicitud',  color: '#4A7BA7' },
          { label: 'Evidencia',  color: '#6A5492' },
          { label: 'Entrevista', color: '#5B7FA0' },
          { label: 'Prueba',     color: '#4A7B6A' },
          { label: 'Hallazgo',   color: '#E0593F' },
          { label: 'Respuesta',  color: '#3A8B5A' },
          { label: 'Cierre',     color: '#E4B33A' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 p-8 overflow-x-auto">
        <Timeline eventos={caso.timeline} />
      </div>

      {/* Summary */}
      <div
        className="px-8 py-4 border-t"
        style={{ borderColor: '#2A3140', background: '#171B23' }}
      >
        <div className="flex items-center gap-8">
          {[
            { n: caso.timeline.filter(e => e.tipo === 'solicitud-info' || e.tipo === 'recepcion-evidencia').length, l: 'Solicitudes/recepciones' },
            { n: caso.timeline.filter(e => e.tipo === 'entrevista').length, l: 'Entrevistas' },
            { n: caso.timeline.filter(e => e.tipo === 'prueba-aplicada').length, l: 'Pruebas aplicadas' },
            { n: caso.timeline.filter(e => e.tipo === 'hallazgo-emitido').length, l: 'Emisión de hallazgos' },
            { n: caso.timeline.filter(e => e.tipo === 'respuesta-banco').length, l: 'Respuestas banco' },
          ].map(item => (
            <div key={item.l} className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#E8E1D0', fontWeight: 700, letterSpacing: '-0.04em' }}>
                {item.n}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890', maxWidth: '80px', lineHeight: '1.2' }}>
                {item.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
