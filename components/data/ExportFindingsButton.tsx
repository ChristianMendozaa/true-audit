'use client';

import { useState } from 'react';
import type { Caso } from '@/lib/types';

type ExportKind = 'informe-final' | 'fichas-hallazgo' | 'matriz-cobit';

const exportsConfig: Array<{
  kind: ExportKind;
  label: string;
  filename: (caso: Caso) => string;
  tone: string;
}> = [
  {
    kind: 'informe-final',
    label: 'Descargar informe PDF',
    filename: caso => `informe-final-${caso.numero}.pdf`,
    tone: 'border-signal/45 bg-signal/10 text-signal hover:border-signal',
  },
  {
    kind: 'fichas-hallazgo',
    label: 'Descargar fichas PDF',
    filename: caso => `fichas-hallazgo-${caso.numero}.pdf`,
    tone: 'border-node-response/45 bg-node-response/10 text-node-response hover:border-node-response',
  },
  {
    kind: 'matriz-cobit',
    label: 'Exportar matriz Excel',
    filename: caso => `matriz-cobit-${caso.numero}.xlsx`,
    tone: 'border-node-doc/55 bg-node-doc/15 text-ink hover:border-node-doc',
  },
];

export default function ExportFindingsButton({ caso }: { caso: Caso }) {
  const [loading, setLoading] = useState<ExportKind | null>(null);

  const downloadExport = async (kind: ExportKind, filename: string) => {
    setLoading(kind);
    try {
      const response = await fetch(`/api/casos/${caso.id}/exports/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caso }),
      });

      if (!response.ok) {
        throw new Error(`No se pudo generar el archivo (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {exportsConfig.map(config => (
        <button
          key={config.kind}
          type="button"
          onClick={() => downloadExport(config.kind, config.filename(caso))}
          disabled={loading !== null}
          className={`border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-55 ${config.tone}`}
        >
          {loading === config.kind ? 'Generando...' : config.label}
        </button>
      ))}
    </>
  );
}
