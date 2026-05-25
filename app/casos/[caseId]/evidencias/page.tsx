'use client';

import { useState } from 'react';
import { caso2026014 } from '@/lib/mock-data';
import type { TipoEvidencia } from '@/lib/types';
import EvidenceCard from '@/components/data/EvidenceCard';
import SectionRule from '@/components/shell/SectionRule';

const tipoLabels: Record<TipoEvidencia, string> = {
  'documento':        'Documentos',
  'evidencia-tecnica':'Evidencia técnica',
  'entrevista':       'Entrevistas',
  'prueba':           'Fichas de prueba',
  'contrato':         'Contratos',
  'acta':             'Actas',
};

const todos: TipoEvidencia[] = ['documento', 'evidencia-tecnica', 'entrevista', 'prueba', 'contrato', 'acta'];

export default function EvidenciasPage() {
  const caso = caso2026014;
  const [selectedTipo, setSelectedTipo] = useState<TipoEvidencia | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = selectedTipo
    ? caso.evidencias.filter(e => e.tipo === selectedTipo)
    : caso.evidencias;

  const selectedEvidencia = selectedId ? caso.evidencias.find(e => e.id === selectedId) : null;

  const hallazgosDeEvidencia = selectedId
    ? caso.hallazgos.filter(h => h.evidencias.includes(selectedId))
    : [];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div
          className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Expediente {caso.numero}
        </div>
        <h1
          className="font-display font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '-0.04em' }}
        >
          Evidencias recolectadas
        </h1>
        <p className="text-ink-muted text-sm mt-2">
          {caso.evidencias.length} evidencias · {Object.keys(tipoLabels).filter(t => caso.evidencias.some(e => e.tipo === t)).length} tipos distintos
        </p>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelectedTipo(null)}
          className={`px-3 py-1.5 text-xs border transition-colors ${
            selectedTipo === null ? 'bg-ink text-paper border-ink' : 'border-rule text-ink-muted hover:border-ink-muted hover:text-ink'
          }`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Todo ({caso.evidencias.length})
        </button>
        {todos.filter(t => caso.evidencias.some(e => e.tipo === t)).map(tipo => {
          const count = caso.evidencias.filter(e => e.tipo === tipo).length;
          return (
            <button
              key={tipo}
              onClick={() => setSelectedTipo(selectedTipo === tipo ? null : tipo)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                selectedTipo === tipo ? 'bg-ink text-paper border-ink' : 'border-rule text-ink-muted hover:border-ink-muted hover:text-ink'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {tipoLabels[tipo]} ({count})
            </button>
          );
        })}
      </div>

      <SectionRule />

      <div className="mt-6 grid grid-cols-2 gap-3">
        {/* Evidence list */}
        <div className="space-y-2">
          {filtered.map((evd, i) => (
            <div
              key={evd.id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
            >
              <EvidenceCard
                evidencia={evd}
                onClick={() => setSelectedId(selectedId === evd.id ? null : evd.id)}
                selected={selectedId === evd.id}
              />
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="sticky top-0">
          {selectedEvidencia ? (
            <div className="border border-rule p-6 animate-slide-in-right">
              <div
                className="font-mono text-[10px] text-ink-muted uppercase tracking-widest mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {selectedEvidencia.id} · {selectedEvidencia.tipo}
              </div>
              <h2
                className="font-display font-bold text-ink text-xl mb-4"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
              >
                {selectedEvidencia.titulo}
              </h2>

              <div className="space-y-4">
                <div>
                  <div
                    className="text-[10px] text-ink-muted uppercase tracking-widest mb-1.5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Descripción
                  </div>
                  <p className="text-sm text-ink leading-relaxed">{selectedEvidencia.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-ink-muted uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Fecha</div>
                    <div className="text-sm text-ink font-mono" style={{ fontFamily: 'var(--font-mono)' }}>{selectedEvidencia.fecha}</div>
                  </div>
                  {selectedEvidencia.formato && (
                    <div>
                      <div className="text-[10px] text-ink-muted uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Formato</div>
                      <div className="text-sm text-ink font-mono" style={{ fontFamily: 'var(--font-mono)' }}>
                        {selectedEvidencia.formato}
                        {selectedEvidencia.paginas ? ` · ${selectedEvidencia.paginas} págs.` : ''}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] text-ink-muted uppercase tracking-widest mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>Fuente</div>
                  <div className="text-sm text-ink-soft">{selectedEvidencia.fuente}</div>
                </div>

                {hallazgosDeEvidencia.length > 0 && (
                  <div>
                    <div className="text-[10px] text-ink-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                      Hallazgos que sustenta
                    </div>
                    <div className="space-y-1.5">
                      {hallazgosDeEvidencia.map(h => (
                        <a
                          key={h.id}
                          href={`/casos/${caso.id}/hallazgos/${h.id}`}
                          className="flex items-center gap-2 text-xs text-ink-soft hover:text-ink transition-colors"
                        >
                          <span className="font-mono" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#9B9388' }}>{h.numero}</span>
                          <span>{h.titulo.slice(0, 50)}…</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-rule-light border-dashed p-8 flex items-center justify-center text-center">
              <div>
                <div className="text-ink-muted text-sm mb-2">Selecciona una evidencia</div>
                <div className="text-xs text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>para ver su detalle y hallazgos vinculados</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
