import type {
  Caso,
  EstadoHallazgo,
  EstadoRevisionEvidencia,
  Evidencia,
  Hallazgo,
  NivelRiesgo,
  RespuestaAuditado,
} from './types';

export type KanbanColumnId =
  | 'entrada-documental'
  | 'en-revision'
  | 'observado'
  | 'pendiente-respuesta'
  | 'respondido'
  | 'cerrado-descartado';

export type KanbanItemTipo = 'evidencia' | 'hallazgo' | 'respuesta';

export interface KanbanColumn {
  id: KanbanColumnId;
  label: string;
  caption: string;
}

export interface KanbanItem {
  id: string;
  refId: string;
  tipo: KanbanItemTipo;
  titulo: string;
  estado: string;
  fecha: string;
  columnId: KanbanColumnId;
  riesgo?: NivelRiesgo;
  relaciones: string[];
  locked?: boolean;
}

export const kanbanColumns: KanbanColumn[] = [
  { id: 'entrada-documental', label: 'Entrada documental', caption: 'Nuevos soportes y registros por clasificar' },
  { id: 'en-revision', label: 'En revision', caption: 'Trabajo activo del equipo auditor' },
  { id: 'observado', label: 'Observado', caption: 'Elementos con debilidad o excepcion' },
  { id: 'pendiente-respuesta', label: 'Pendiente respuesta', caption: 'Hallazgos enviados al auditado' },
  { id: 'respondido', label: 'Respondido', caption: 'Descargos o aceptaciones recibidas' },
  { id: 'cerrado-descartado', label: 'Cerrado / descartado', caption: 'Sin accion operativa inmediata' },
];

export function evidenceColumn(estado?: EstadoRevisionEvidencia): KanbanColumnId {
  if (estado === 'observado') return 'observado';
  if (estado === 'descartada') return 'cerrado-descartado';
  if (estado === 'revisado') return 'en-revision';
  return 'entrada-documental';
}

export function findingColumn(estado: EstadoHallazgo): KanbanColumnId {
  if (estado === 'pendiente-respuesta') return 'pendiente-respuesta';
  if (estado === 'respondido') return 'respondido';
  if (estado === 'cerrado' || estado === 'descartado') return 'cerrado-descartado';
  return 'en-revision';
}

export function responseColumn(respuesta: RespuestaAuditado): KanbanColumnId {
  if (respuesta.decisionAuditor === 'descartar') return 'cerrado-descartado';
  if (respuesta.decisionAuditor === 'pendiente') return 'pendiente-respuesta';
  return 'respondido';
}

export function evidenceStatusForColumn(columnId: KanbanColumnId): EstadoRevisionEvidencia {
  if (columnId === 'cerrado-descartado') return 'descartada';
  if (columnId === 'observado' || columnId === 'pendiente-respuesta') return 'observado';
  if (columnId === 'en-revision' || columnId === 'respondido') return 'revisado';
  return 'pendiente';
}

export function findingStatusForColumn(columnId: KanbanColumnId): EstadoHallazgo {
  if (columnId === 'pendiente-respuesta') return 'pendiente-respuesta';
  if (columnId === 'respondido') return 'respondido';
  if (columnId === 'cerrado-descartado') return 'cerrado';
  if (columnId === 'entrada-documental') return 'abierto';
  return 'en-revision';
}

export function toEvidenceKanbanItem(evidencia: Evidencia): KanbanItem {
  return {
    id: `evidencia:${evidencia.id}`,
    refId: evidencia.id,
    tipo: 'evidencia',
    titulo: evidencia.titulo,
    estado: evidencia.estadoRevision ?? 'pendiente',
    fecha: evidencia.fecha,
    columnId: evidenceColumn(evidencia.estadoRevision),
    relaciones: [
      `${evidencia.hallazgos?.length ?? 0} hallazgos`,
      `${evidencia.criterios?.length ?? 0} criterios`,
    ],
  };
}

export function toFindingKanbanItem(hallazgo: Hallazgo): KanbanItem {
  return {
    id: `hallazgo:${hallazgo.id}`,
    refId: hallazgo.id,
    tipo: 'hallazgo',
    titulo: hallazgo.titulo,
    estado: hallazgo.estado,
    fecha: hallazgo.fechaEmision,
    columnId: findingColumn(hallazgo.estado),
    riesgo: hallazgo.nivelRiesgo,
    relaciones: [
      `${hallazgo.evidencias.length} evidencias`,
      `${hallazgo.criterios.length} criterios`,
      `${hallazgo.respuestasAuditado?.length ?? 0} respuestas`,
    ],
  };
}

export function toResponseKanbanItem(respuesta: RespuestaAuditado, caso: Caso): KanbanItem {
  const hallazgo = caso.hallazgos.find(item => item.id === respuesta.hallazgoId);
  return {
    id: `respuesta:${respuesta.id}`,
    refId: respuesta.id,
    tipo: 'respuesta',
    titulo: hallazgo ? `${hallazgo.numero}: ${respuesta.postura}` : respuesta.postura,
    estado: respuesta.decisionAuditor,
    fecha: respuesta.fecha,
    columnId: responseColumn(respuesta),
    relaciones: [hallazgo ? `Hallazgo ${hallazgo.numero}` : respuesta.hallazgoId],
    locked: true,
  };
}

export function buildKanbanItems(caso: Caso): KanbanItem[] {
  return [
    ...caso.evidencias.map(toEvidenceKanbanItem),
    ...caso.hallazgos.map(toFindingKanbanItem),
    ...caso.respuestasAuditado.map(respuesta => toResponseKanbanItem(respuesta, caso)),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha));
}
