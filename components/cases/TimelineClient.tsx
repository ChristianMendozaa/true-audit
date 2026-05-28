'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import Timeline from '@/components/visual/Timeline';
import type { TipoEvento } from '@/lib/types';
import { buildRelationReasoningLog, type RelationReasoningLogItem } from '@/lib/audit-analysis';

const eventTypes: TipoEvento[] = [
  'solicitud-info',
  'recepcion-evidencia',
  'registro-evidencia',
  'entrevista',
  'prueba-aplicada',
  'observacion-identificada',
  'hallazgo-emitido',
  'respuesta-banco',
  'revision-auditor',
  'cierre',
];

const eventTypeLabels: Record<TipoEvento, string> = {
  'solicitud-info': 'Solicitud documental',
  'recepcion-evidencia': 'Recepción de evidencia',
  'registro-evidencia': 'Registro de evidencia',
  entrevista: 'Entrevista',
  'prueba-aplicada': 'Prueba aplicada',
  'observacion-identificada': 'Observación identificada',
  'hallazgo-emitido': 'Hallazgo emitido',
  'respuesta-banco': 'Respuesta del banco',
  'revision-auditor': 'Revisión del auditor',
  cierre: 'Cierre',
};

function nextEventId(ids: string[]) {
  const max = ids.reduce((current, id) => {
    const match = id.match(/^EVT-(\d+)$/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `EVT-${String(max + 1).padStart(3, '0')}`;
}

function formatTimelineStamp(value: string) {
  const [datePart, timePart] = value.split('T');
  const [year = '', month = '', day = ''] = datePart.split('-');
  return `${day}/${month}/${year}${timePart ? ` ${timePart.slice(0, 5)}` : ''}`;
}

export default function TimelineClient() {
  const { caso, updateCaso } = useCaseData();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoEvento>('revision-auditor');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState('09:00');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [hallazgoId, setHallazgoId] = useState('');

  const eventosOrdenados = [...caso.timeline].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultimoEvento = eventosOrdenados.at(-1);
  const reasoningLog = useMemo(() => buildRelationReasoningLog(caso), [caso]);

  const save = () => {
    if (!titulo.trim()) return;
    updateCaso(current => ({
      ...current,
      timeline: [
        ...current.timeline,
        {
          id: nextEventId(current.timeline.map(e => e.id)),
          tipo,
          fecha: `${fecha}T${hora}`,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          hallazgosVinculados: hallazgoId ? [hallazgoId] : [],
        },
      ],
    }));
    setOpen(false);
    setTitulo('');
    setDescripcion('');
    setHallazgoId('');
  };

  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <div className="audit-file-surface mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
              Cronología de investigación
            </div>
            <h1 className="font-display text-4xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
              {caso.titulo}
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              {caso.banco} / {caso.fechaInicio} - hoy / {caso.timeline.length} eventos
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-3">
            <HeaderFact label="Último registro" value={ultimoEvento ? formatTimelineStamp(ultimoEvento.fecha) : 'Sin eventos'} />
            <HeaderFact label="Entrevistas" value={String(caso.timeline.filter(e => e.tipo === 'entrevista').length)} />
            <HeaderFact label="Decisiones" value={String(reasoningLog.length)} />
            <button type="button" onClick={() => setOpen(v => !v)} className="border border-signal/45 bg-signal/10 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-signal">
              {open ? 'Cerrar captura' : 'Nuevo evento'}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="audit-file-surface mb-6 p-5">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            Registro de evento de auditoría
          </div>
          <div className="grid gap-3 lg:grid-cols-[0.9fr_0.7fr_0.55fr_1.2fr_1.6fr_0.8fr_auto]">
            <select aria-label="Tipo de evento" value={tipo} onChange={e => setTipo(e.target.value as TipoEvento)} className="field-input">
              {eventTypes.map(t => <option key={t} value={t}>{eventTypeLabels[t]}</option>)}
            </select>
            <input aria-label="Fecha del evento" type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="field-input" />
            <input aria-label="Hora del evento" type="time" value={hora} onChange={e => setHora(e.target.value)} className="field-input" />
            <input value={titulo} onChange={e => setTitulo(e.target.value)} className="field-input" placeholder="Título del evento" />
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} className="field-input" placeholder="Descripción breve" />
            <select aria-label="Hallazgo vinculado" value={hallazgoId} onChange={e => setHallazgoId(e.target.value)} className="field-input">
              <option value="">Sin hallazgo vinculado</option>
              {caso.hallazgos.filter(h => !h.descartado).map(h => <option key={h.id} value={h.id}>{h.numero}</option>)}
            </select>
            <button type="button" onClick={save} className="border border-signal/45 bg-signal/10 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-signal">
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Timeline eventos={eventosOrdenados} />
        <ReasoningLogPanel entries={reasoningLog} caseId={caso.id} />
      </div>
    </div>
  );
}

function HeaderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-32 border border-rule bg-[#0B0F15]/70 px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function ReasoningLogPanel({ entries, caseId }: { entries: RelationReasoningLogItem[]; caseId: string }) {
  return (
    <section className="audit-file-surface overflow-hidden">
      <div className="border-b border-rule px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
          Bitacora de razonamiento
        </div>
        <h2 className="mt-1 font-display text-lg font-semibold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
          Decisiones del tablero
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Justificaciones registradas en conexiones visuales. Sirven como provenance de decision, no como validacion automatica del hallazgo.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="m-5 border border-rule bg-[#0B0F15]/70 p-4 text-sm text-ink-muted">
          No hay decisiones de relacion registradas. Abre el tablero, selecciona una conexion y guarda una justificacion para alimentar esta bitacora.
        </div>
      ) : (
        <div className="max-h-[620px] divide-y divide-rule/60 overflow-auto">
          {entries.slice(0, 12).map(entry => (
            <article key={entry.id} className="px-5 py-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusTag label={entry.accion} tone={entry.accion === 'validada' ? 'ok' : entry.accion === 'requiere-revision' ? 'warning' : 'neutral'} />
                {entry.estado && <StatusTag label={entry.estado} tone={entry.estado === 'validada' ? 'ok' : entry.estado === 'requiere-revision' ? 'warning' : 'neutral'} />}
                <span className="font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatTimelineStamp(entry.fecha)}
                </span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                {entry.connection.id} / {entry.relationLabel}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{entry.detalle}</p>
              <div className="mt-3 grid gap-2 text-[11px] text-ink-muted">
                <RelationEndpoint label="Origen" value={entry.sourceLabel} />
                <RelationEndpoint label="Destino" value={entry.targetLabel} />
              </div>
              {entry.usuarioRol && (
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  Rol: {entry.usuarioRol}
                </div>
              )}
            </article>
          ))}
          {entries.length > 12 && (
            <div className="px-5 py-3 text-xs text-ink-muted">
              Se muestran 12 de {entries.length} decisiones registradas.
            </div>
          )}
        </div>
      )}

      <div className="border-t border-rule px-5 py-4">
        <Link href={`/casos/${caseId}/tablero`} className="inline-flex border border-signal/40 px-3 py-1.5 text-xs text-signal transition-colors hover:border-ink hover:text-ink">
          Abrir tablero de relaciones
        </Link>
      </div>
    </section>
  );
}

function RelationEndpoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-rule pl-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span className="ml-2 text-ink-soft">{value}</span>
    </div>
  );
}

function StatusTag({ label, tone }: { label: string; tone: 'ok' | 'warning' | 'neutral' }) {
  const className = tone === 'ok'
    ? 'border-olive/50 bg-olive/10 text-olive'
    : tone === 'warning'
      ? 'border-amber-signal/50 bg-amber-signal/10 text-amber-signal'
      : 'border-rule bg-[#0B0F15] text-ink-muted';

  return (
    <span className={`inline-flex whitespace-nowrap border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${className}`} style={{ fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
  );
}
