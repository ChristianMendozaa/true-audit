'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import { todosLosCriterios } from '@/lib/frameworks';

export default function AseguramientoPage() {
  const { caso } = useCaseData();

  const hallazgosActivos = useMemo(
    () => caso.hallazgos.filter(h => !h.descartado && h.estado !== 'descartado'),
    [caso.hallazgos]
  );
  const evidenciasActivas = useMemo(
    () => caso.evidencias.filter(e => !e.descartada),
    [caso.evidencias]
  );

  // Hallazgos sin evidencia
  const sinEvidencia = hallazgosActivos.filter(h => h.evidencias.length === 0);
  // Hallazgos sin criterio normativo
  const sinCriterio = hallazgosActivos.filter(h => h.criterios.length === 0);
  // Hallazgos sin recomendación
  const sinRecomendacion = hallazgosActivos.filter(h => !h.recomendacion.trim());
  // Hallazgos sin condición
  const sinCondicion = hallazgosActivos.filter(h => !h.condicion.trim());

  // Evidencias huérfanas (no vinculadas a ningún hallazgo)
  const evidenciasVinculadas = new Set(hallazgosActivos.flatMap(h => h.evidencias));
  const evidenciasHuerfanas = evidenciasActivas.filter(e => !evidenciasVinculadas.has(e.id));

  // Cobertura normativa
  const criteriosUsados = new Set(hallazgosActivos.flatMap(h => h.criterios));
  const cobitTotal = todosLosCriterios.filter(c => c.marco === 'COBIT').length;
  const cosoTotal = todosLosCriterios.filter(c => c.marco === 'COSO').length;
  const rgsiTotal = todosLosCriterios.filter(c => c.marco === 'RGSI').length;
  const cobitUsados = todosLosCriterios.filter(c => c.marco === 'COBIT' && criteriosUsados.has(c.id)).length;
  const cosoUsados = todosLosCriterios.filter(c => c.marco === 'COSO' && criteriosUsados.has(c.id)).length;
  const rgsiUsados = todosLosCriterios.filter(c => c.marco === 'RGSI' && criteriosUsados.has(c.id)).length;

  // Sustentación
  const hallazgosBienSustentados = hallazgosActivos.filter(
    h => h.evidencias.length > 0 && h.criterios.length > 0 && h.recomendacion.trim() && h.condicion.trim()
  );
  const porcentajeSustentacion = hallazgosActivos.length > 0
    ? Math.round((hallazgosBienSustentados.length / hallazgosActivos.length) * 100)
    : 0;

  // Respuestas pendientes
  const sinRespuesta = hallazgosActivos.filter(h => h.estadoRespuesta === 'pendiente');

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <section className="audit-file-surface mb-6 p-6">
        <div
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Control de calidad / Expediente {caso.numero}
        </div>
        <h1
          className="font-display text-3xl font-bold text-ink"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
        >
          Aseguramiento del expediente
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Revisión de la calidad documental: sustentación de hallazgos, cobertura normativa, evidencias huérfanas y huecos del expediente.
        </p>
      </section>

      {/* Indicador general de sustentación */}
      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <QualityMetric
          value={`${porcentajeSustentacion}%`}
          label="Sustentación"
          detail={`${hallazgosBienSustentados.length} de ${hallazgosActivos.length} hallazgos completos`}
          severity={porcentajeSustentacion >= 80 ? 'ok' : porcentajeSustentacion >= 50 ? 'warning' : 'critical'}
        />
        <QualityMetric
          value={sinEvidencia.length}
          label="Sin evidencia"
          detail="Hallazgos sin evidencia vinculada"
          severity={sinEvidencia.length === 0 ? 'ok' : 'critical'}
        />
        <QualityMetric
          value={evidenciasHuerfanas.length}
          label="Evidencias huérfanas"
          detail="Evidencias sin hallazgo asociado"
          severity={evidenciasHuerfanas.length === 0 ? 'ok' : 'warning'}
        />
        <QualityMetric
          value={sinRespuesta.length}
          label="Sin respuesta"
          detail="Hallazgos pendientes de respuesta"
          severity={sinRespuesta.length === 0 ? 'ok' : 'warning'}
        />
      </section>

      {/* Cobertura normativa */}
      <section className="audit-file-surface mb-6 p-5">
        <div
          className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Cobertura normativa del expediente
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <CoverageBar label="COBIT" used={cobitUsados} total={cobitTotal} color="#6FA8D8" />
          <CoverageBar label="COSO" used={cosoUsados} total={cosoTotal} color="#9E80D8" />
          <CoverageBar label="RGSI" used={rgsiUsados} total={rgsiTotal} color="#D8A437" />
        </div>
      </section>

      {/* Hallazgos débiles */}
      <div className="grid gap-6 lg:grid-cols-2">
        <IssueList
          title="Hallazgos sin evidencia"
          items={sinEvidencia}
          caseId={caso.id}
          emptyMessage="Todos los hallazgos tienen al menos una evidencia vinculada."
        />
        <IssueList
          title="Hallazgos sin criterio normativo"
          items={sinCriterio}
          caseId={caso.id}
          emptyMessage="Todos los hallazgos tienen al menos un criterio normativo."
        />
        <IssueList
          title="Hallazgos sin recomendación"
          items={sinRecomendacion}
          caseId={caso.id}
          emptyMessage="Todos los hallazgos tienen recomendación registrada."
        />
        <IssueList
          title="Hallazgos sin condición"
          items={sinCondicion}
          caseId={caso.id}
          emptyMessage="Todos los hallazgos tienen condición registrada."
        />
      </div>

      {/* Evidencias huérfanas */}
      {evidenciasHuerfanas.length > 0 && (
        <section className="audit-file-surface mt-6 p-5">
          <div
            className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-signal"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Evidencias sin hallazgo asociado
          </div>
          <div className="space-y-1">
            {evidenciasHuerfanas.map(e => (
              <div key={e.id} className="flex items-center gap-3 border-l border-rule pl-3 py-1.5 text-sm">
                <span className="font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{e.id}</span>
                <span className="flex-1 truncate text-ink-soft">{e.titulo}</span>
                <span className="text-xs text-ink-muted">{e.tipo}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QualityMetric({
  value,
  label,
  detail,
  severity,
}: {
  value: string | number;
  label: string;
  detail: string;
  severity: 'ok' | 'warning' | 'critical';
}) {
  const borderColor = severity === 'ok' ? 'border-olive/55' : severity === 'warning' ? 'border-amber-signal/55' : 'border-vermilion/55';
  const valueColor = severity === 'ok' ? 'text-olive' : severity === 'warning' ? 'text-amber-signal' : 'text-vermilion';

  return (
    <div className={`border ${borderColor} bg-[#101721] p-4`}>
      <div
        className={`font-display text-2xl font-bold ${valueColor}`}
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-ink">{label}</div>
      <div className="mt-1 text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{detail}</div>
    </div>
  );
}

function CoverageBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div className="border border-rule bg-[#0B0F15]/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold" style={{ fontFamily: 'var(--font-mono)', color }}>{label}</span>
        <span className="font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          {used}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 overflow-hidden bg-rule-light">
        <div className="h-full transition-all" style={{ background: color, width: `${pct}%`, opacity: 0.8 }} />
      </div>
    </div>
  );
}

function IssueList({
  title,
  items,
  caseId,
  emptyMessage,
}: {
  title: string;
  items: Array<{ id: string; numero: string; titulo: string; severidad: string }>;
  caseId: string;
  emptyMessage: string;
}) {
  return (
    <section className="audit-file-surface p-5">
      <div
        className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <div className="border border-olive/30 bg-olive/5 p-3 text-xs text-olive">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-1">
          {items.map(h => (
            <Link
              key={h.id}
              href={`/casos/${caseId}/hallazgos/${h.id}`}
              className="flex items-center gap-3 border-l border-rule pl-3 py-1.5 text-sm transition-colors hover:border-vermilion hover:text-ink"
            >
              <span className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{h.numero}</span>
              <span className="flex-1 truncate text-ink-muted">{h.titulo}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
