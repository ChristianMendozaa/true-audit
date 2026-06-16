'use client';

import { useCaseData } from '@/components/data/CaseDataProvider';
import ReportSheet from '@/components/print/ReportSheet';
import PrintButton from '@/components/print/PrintButton';
import ExportFindingsButton from '@/components/data/ExportFindingsButton';

export default function InformeClient() {
  const { caso } = useCaseData();

  return (
    <div className="min-h-full bg-[#0B0F15] p-8">
      <div className="mx-auto mb-8 flex max-w-5xl flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 label-eyebrow" style={{ fontFamily: 'var(--font-mono)' }}>
            Informe de auditoría / Expediente {caso.numero}
          </div>
          <h1 className="font-display text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
            Informe final
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Documento formal del expediente. Contiene hallazgos, criterios, evidencias y conclusiones para entrega.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportFindingsButton caso={caso} />
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <ReportSheet caso={caso} />
      </div>

      <div className="mx-auto mt-6 max-w-5xl border border-rule bg-surface p-4 text-xs text-ink-soft">
        Ctrl+P para imprimir. Los exportes PDF y Excel usan el expediente editable actual del navegador.
      </div>
    </div>
  );
}
