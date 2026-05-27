'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import { todosLosCriterios } from '@/lib/frameworks';
import CriterioBadge from '@/components/data/CriterioBadge';

export default function MarcosCasoPage() {
  const { caso } = useCaseData();

  const hallazgosActivos = useMemo(
    () => caso.hallazgos.filter(h => !h.descartado && h.estado !== 'descartado'),
    [caso.hallazgos]
  );

  const criteriosUsados = useMemo(() => {
    const usedIds = new Set(hallazgosActivos.flatMap(h => h.criterios));
    return todosLosCriterios.map(c => ({
      ...c,
      usado: usedIds.has(c.id),
      hallazgosCount: hallazgosActivos.filter(h => h.criterios.includes(c.id)).length,
      evidenciasCount: caso.evidencias.filter(
        e => !e.descartada && (e.criterios ?? []).includes(c.id)
      ).length,
    }));
  }, [hallazgosActivos, caso.evidencias]);

  const marcos = [
    { id: 'COBIT', nombre: 'COBIT 2019', desc: 'Gobierno y gestión de TI', accent: '#6FA8D8' },
    { id: 'COSO', nombre: 'COSO 2013', desc: 'Control interno', accent: '#9E80D8' },
    { id: 'RGSI', nombre: 'RGSI', desc: 'Regulación financiera', accent: '#D8A437' },
  ];

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <section className="audit-file-surface mb-6 p-6">
        <div
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Biblioteca normativa / Expediente {caso.numero}
        </div>
        <h1
          className="font-display text-3xl font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
        >
          Marcos normativos del caso
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Criterios COBIT, COSO y RGSI vinculados a hallazgos y evidencias de este expediente.
        </p>
      </section>

      <div className="space-y-6">
        {marcos.map(marco => {
          const criteriosMarco = criteriosUsados.filter(c => c.marco === marco.id);
          const usados = criteriosMarco.filter(c => c.usado).length;

          return (
            <section key={marco.id} className="audit-file-surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-rule p-5" style={{ borderTop: `3px solid ${marco.accent}` }}>
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-display text-xl font-bold"
                      style={{ fontFamily: 'var(--font-display)', color: marco.accent, letterSpacing: '0em' }}
                    >
                      {marco.id}
                    </span>
                    <span className="text-sm text-ink-muted">{marco.nombre}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{marco.desc}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
                    {usados}/{criteriosMarco.length}
                  </div>
                  <div className="text-[10px] text-ink-muted">criterios cubiertos</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                      <th className="border-b border-rule px-4 py-2.5 font-medium">Código</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium">Criterio</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Hallazgos</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Evidencias</th>
                      <th className="border-b border-rule px-4 py-2.5 font-medium text-center">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriosMarco.map(c => (
                      <tr key={c.id} className="border-b border-rule/50 last:border-b-0">
                        <td className="px-4 py-2.5">
                          <CriterioBadge codigo={c.codigo} marco={c.marco} size="sm" />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-ink-soft">{c.nombre}</td>
                        <td className="px-4 py-2.5 text-center">
                          {c.hallazgosCount > 0 ? (
                            <span className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{c.hallazgosCount}</span>
                          ) : (
                            <span className="text-xs text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {c.evidenciasCount > 0 ? (
                            <span className="font-mono text-xs text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{c.evidenciasCount}</span>
                          ) : (
                            <span className="text-xs text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {c.usado ? (
                            <span className="border border-olive/45 bg-olive/10 px-2 py-0.5 font-mono text-[9px] uppercase text-olive" style={{ fontFamily: 'var(--font-mono)' }}>
                              cubierto
                            </span>
                          ) : (
                            <span className="border border-rule px-2 py-0.5 font-mono text-[9px] uppercase text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                              sin uso
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <div className="audit-file-surface mt-6 p-4">
        <p className="text-xs text-ink-muted">
          <Link href="/marcos" className="text-signal hover:text-ink transition-colors">Ver catálogo completo de marcos normativos</Link> para explorar criterios fuera del contexto de este expediente.
        </p>
      </div>
    </div>
  );
}
