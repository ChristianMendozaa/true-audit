import { notFound } from 'next/navigation';
import { getCasoById } from '@/lib/mock-data';
import EvidenceBoard from '@/components/visual/EvidenceBoard';

interface TableroPageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: TableroPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Tablero · ${caso.numero} · True Audit` : 'Tablero · True Audit' };
}

export default async function TableroPage({ params }: TableroPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  return (
    <div className="dark h-full min-h-[calc(100dvh-49px)] flex flex-col" style={{ background: '#0E1116' }}>
      {/* Dark header */}
      <div
        className="px-6 py-3 border-b flex items-center justify-between"
        style={{ borderColor: '#2A3140', background: '#171B23' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <div
              className="font-mono uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890', letterSpacing: '0.12em' }}
            >
              Evidence Board
            </div>
            <div
              className="font-display font-semibold"
              style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#E8E1D0', letterSpacing: '-0.02em' }}
            >
              {caso.numero} · {caso.banco}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 font-mono"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6A7890' }}
          >
            <span>{caso.nodosTablero.length} nodos</span>
            <span>·</span>
            <span>{caso.conexionesTablero.length} conexiones</span>
            <span>·</span>
            <span>{caso.hallazgos.length} hallazgos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890' }}>DRAG</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#3A4455' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890' }}>ZOOM</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#3A4455' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6A7890' }}>CLICK PARA DETALLE</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1">
        <EvidenceBoard
          nodos={caso.nodosTablero}
          conexiones={caso.conexionesTablero}
          caso={caso}
        />
      </div>
    </div>
  );
}
