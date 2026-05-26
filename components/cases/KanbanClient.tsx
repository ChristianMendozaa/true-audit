'use client';

import { DndContext, type DragEndEvent, PointerSensor, pointerWithin, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo } from 'react';
import { useCaseData } from '@/components/data/CaseDataProvider';
import {
  buildKanbanItems,
  evidenceStatusForColumn,
  findingStatusForColumn,
  kanbanColumns,
  type KanbanColumnId,
  type KanbanItem,
} from '@/lib/kanban';

const columnTone: Record<KanbanColumnId, string> = {
  'entrada-documental': '#6FA8D8',
  'en-revision': '#D8AD4C',
  observado: '#F06A49',
  'pendiente-respuesta': '#C8951A',
  respondido: '#70C9AC',
  'cerrado-descartado': '#6F7C91',
};

export default function KanbanClient() {
  const { caso, updateEvidenciaStatus, updateHallazgoStatus } = useCaseData();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const items = useMemo(() => buildKanbanItems(caso), [caso]);

  const handleDragEnd = (event: DragEndEvent) => {
    const item = items.find(current => current.id === event.active.id);
    const targetColumn = event.over?.id as KanbanColumnId | undefined;
    if (!item || !targetColumn || item.locked || item.columnId === targetColumn) return;

    if (item.tipo === 'evidencia') {
      updateEvidenciaStatus(item.refId, evidenceStatusForColumn(targetColumn));
    }
    if (item.tipo === 'hallazgo') {
      updateHallazgoStatus(item.refId, findingStatusForColumn(targetColumn));
    }
  };

  return (
    <div className="min-h-full bg-[#0B0F15] p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-signal"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Control operativo del expediente
          </div>
          <h1
            className="font-display text-4xl font-bold text-ink"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}
          >
            Kanban del caso / {caso.numero}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
            Organiza documentos, evidencias, hallazgos y respuestas del auditado por estado de trabajo. Las respuestas son tarjetas de referencia y no alteran la postura del auditado al arrastrar.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <HeaderMetric label="Evidencias" value={caso.evidencias.length} />
          <HeaderMetric label="Hallazgos" value={caso.hallazgos.length} />
          <HeaderMetric label="Respuestas" value={caso.respuestasAuditado.length} />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
        <div className="grid min-h-[640px] grid-cols-[repeat(6,minmax(220px,1fr))] gap-3 overflow-x-auto pb-4">
          {kanbanColumns.map(column => {
            const columnItems = items.filter(item => item.columnId === column.id);
            return (
              <KanbanColumnView
                key={column.id}
                columnId={column.id}
                label={column.label}
                caption={column.caption}
                items={columnItems}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 border border-rule bg-[#101721] px-3 py-2 text-right">
      <div className="font-mono text-sm font-bold text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
    </div>
  );
}

function KanbanColumnView({
  columnId,
  label,
  caption,
  items,
}: {
  columnId: KanbanColumnId;
  label: string;
  caption: string;
  items: KanbanItem[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });
  const accent = columnTone[columnId];

  return (
    <section
      ref={setNodeRef}
      className="flex min-h-[620px] min-w-[220px] flex-col border bg-[#101721]/86"
      style={{
        borderColor: isOver ? accent : 'rgba(48,56,71,0.86)',
        boxShadow: isOver ? `0 0 0 1px ${accent}66, 0 18px 40px rgba(0,0,0,0.28)` : 'none',
      }}
      data-testid={`kanban-column-${columnId}`}
    >
      <div className="border-b border-rule/80 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-ink">{label}</h2>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-muted">{caption}</p>
          </div>
          <span
            className="border px-2 py-1 font-mono text-[9px] font-semibold"
            style={{ borderColor: accent, color: accent, fontFamily: 'var(--font-mono)' }}
          >
            {items.length}
          </span>
        </div>
      </div>

      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 p-2">
          {items.length === 0 ? (
            <div className="border border-dashed border-rule/80 p-4 text-center text-xs text-ink-muted">
              Sin tarjetas en esta etapa.
            </div>
          ) : (
            items.map(item => <KanbanCard key={item.id} item={item} />)
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function KanbanCard({ item }: { item: KanbanItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: item.locked,
    data: { refId: item.refId, tipo: item.tipo },
  });
  const accent = item.tipo === 'hallazgo'
    ? '#F06A49'
    : item.tipo === 'respuesta'
      ? '#70C9AC'
      : '#6FA8D8';

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border bg-[#0B0F15]/95 p-3 shadow-[0_12px_26px_rgba(0,0,0,0.24)] transition-opacity"
      style={{
        borderColor: `${accent}66`,
        opacity: isDragging ? 0.45 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        cursor: item.locked ? 'default' : 'grab',
      }}
      data-testid={`kanban-card-${item.refId}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className="font-mono text-[9px] uppercase tracking-[0.12em]"
            style={{ color: accent, fontFamily: 'var(--font-mono)' }}
          >
            {item.refId} / {item.tipo}
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink">{item.titulo}</h3>
        </div>
        {item.locked && (
          <span className="border border-rule px-1.5 py-1 font-mono text-[8px] uppercase text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            fijo
          </span>
        )}
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <KanbanBadge label={item.estado} tone={item.tipo === 'respuesta' ? 'success' : item.tipo === 'hallazgo' ? 'warning' : 'neutral'} />
        {item.riesgo && <KanbanBadge label={`Riesgo ${item.riesgo}`} tone={item.riesgo === 'alto' ? 'risk' : item.riesgo === 'medio' ? 'warning' : 'success'} />}
      </div>
      <div className="font-mono text-[9px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{item.fecha}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {item.relaciones.map(relation => (
          <span key={relation} className="border border-rule/80 px-1.5 py-1 text-[10px] text-ink-muted">
            {relation}
          </span>
        ))}
      </div>
    </article>
  );
}

function KanbanBadge({ label, tone }: { label: string; tone: 'neutral' | 'success' | 'warning' | 'risk' }) {
  const toneClasses = {
    neutral: 'border-node-doc/45 bg-node-doc/10 text-node-doc',
    success: 'border-olive/55 bg-olive/15 text-olive',
    warning: 'border-amber-signal/55 bg-amber-signal/15 text-amber-signal',
    risk: 'border-vermilion/55 bg-vermilion/15 text-vermilion',
  }[tone];

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${toneClasses}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {label}
    </span>
  );
}
