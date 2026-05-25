import { notFound } from 'next/navigation';
import { getCasoById } from '@/lib/mock-data';
import ReportSheet from '@/components/print/ReportSheet';
import PrintButton from '@/components/print/PrintButton';

interface InformePageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: InformePageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Informe · ${caso.numero} · True Audit` : 'Informe · True Audit' };
}

export default async function InformePage({ params }: InformePageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  return (
    <div className="p-8 max-w-5xl">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between mb-8">
        <div>
          <div
            className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Vista previa del informe
          </div>
          <h1
            className="font-display font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '-0.04em' }}
          >
            Informe final · {caso.numero}
          </h1>
        </div>
        <PrintButton />
      </div>

      <div
        className="no-print text-xs text-ink-muted mb-6 p-3 border border-rule-light bg-paper-warm"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        💡 Use Ctrl+P / ⌘+P para imprimir o exportar a PDF. El diseño está optimizado para papel A4.
      </div>

      <ReportSheet caso={caso} />
    </div>
  );
}
