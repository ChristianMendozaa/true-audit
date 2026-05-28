import { getCriterioById, todosLosCriterios } from '@/lib/frameworks';
import type {
  Caso,
  ConexionTablero,
  Criterio,
  Evidencia,
  Hallazgo,
  NivelRiesgo,
  NodoTablero,
  RespuestaAuditado,
} from '@/lib/types';

export type FindingSupportStatus = 'debil' | 'parcial' | 'defendible';
export type TraceabilityGapSeverity = 'critica' | 'advertencia' | 'informativa';
export type FrameworkCoverageStatus = 'sin-cubrir' | 'debil' | 'parcial' | 'cubierto';
export type TopologicalImpactLevel = 'bajo' | 'medio' | 'alto';

export interface FindingSupportItem {
  id: string;
  label: string;
  weight: number;
  present: boolean;
  action: string;
}

export interface FindingSupportResult {
  hallazgoId: string;
  numero: string;
  score: number;
  status: FindingSupportStatus;
  statusLabel: string;
  presentItems: FindingSupportItem[];
  missingItems: FindingSupportItem[];
  items: FindingSupportItem[];
}

export interface TraceabilityGap {
  id: string;
  tipo:
    | 'hallazgo'
    | 'evidencia'
    | 'criterio'
    | 'respuesta'
    | 'tablero'
    | 'riesgo';
  severidad: TraceabilityGapSeverity;
  entidadId: string;
  entidadLabel: string;
  mensaje: string;
  accionSugerida: string;
  hallazgoId?: string;
  evidenciaId?: string;
  criterioId?: string;
  conexionId?: string;
}

export interface FrameworkCoverageItem {
  criterio: Criterio;
  evidencias: Evidencia[];
  hallazgos: Hallazgo[];
  respuestas: RespuestaAuditado[];
  maxRisk: NivelRiesgo | null;
  avgSupportScore: number;
  status: FrameworkCoverageStatus;
  statusLabel: string;
}

export interface FrameworkCoverageSummary {
  total: number;
  covered: number;
  partial: number;
  weak: number;
  uncovered: number;
}

export interface FrameworkCoverageResult {
  items: FrameworkCoverageItem[];
  byMarco: Record<'COBIT' | 'COSO' | 'RGSI', FrameworkCoverageItem[]>;
  summary: FrameworkCoverageSummary;
}

export interface TopologicalNodeImpact {
  node: NodoTablero;
  degree: number;
  pathCount: number;
  connectionTypes: Record<string, number>;
  score: number;
  level: TopologicalImpactLevel;
  reasons: string[];
  isBridge: boolean;
}

export interface TopologicalImpactResult {
  nodes: TopologicalNodeImpact[];
  highImpactNodes: TopologicalNodeImpact[];
  bridgeNodes: TopologicalNodeImpact[];
  isolatedNodes: NodoTablero[];
  evidenceMultiFinding: Array<{ evidencia: Evidencia; hallazgos: Hallazgo[] }>;
  criteriaMultiFinding: Array<{ criterio: Criterio; hallazgos: Hallazgo[] }>;
  systemicFindings: Array<{ hallazgo: Hallazgo; impact: TopologicalNodeImpact | null; reasons: string[] }>;
}

export type AssistedSuggestionField =
  | 'titulo'
  | 'condicion'
  | 'criterio'
  | 'criterios'
  | 'causa'
  | 'efecto'
  | 'recomendacion'
  | 'probabilidad'
  | 'impacto'
  | 'evidencias';

export interface AssistedFindingSuggestion {
  field: AssistedSuggestionField;
  label: string;
  value: string | number | string[];
  reason: string;
  confidence: number;
  sourceTerms: string[];
}

export interface AssistedFindingDraft {
  description: string;
  matchedRules: string[];
  suggestions: AssistedFindingSuggestion[];
  disclaimer: string;
}

export interface FindingDefenseSheet {
  hallazgo: Hallazgo;
  support: FindingSupportResult;
  evidencias: Evidencia[];
  criterios: Criterio[];
  respuestas: RespuestaAuditado[];
  timelineEvents: Caso['timeline'];
  boardNodes: NodoTablero[];
  boardConnections: ConexionTablero[];
  decisionAuditor: string;
  decisionJustification: string;
  traceabilityText: string;
  boardUrl: string;
}

export interface RelationReasoningLogItem {
  id: string;
  connection: ConexionTablero;
  sourceNode: NodoTablero | null;
  targetNode: NodoTablero | null;
  fecha: string;
  accion: NonNullable<ConexionTablero['reasoningLog']>[number]['accion'];
  detalle: string;
  usuarioRol?: string;
  estado: ConexionTablero['estado'];
  relationLabel: string;
  sourceLabel: string;
  targetLabel: string;
}

function activeFindings(caso: Caso) {
  return caso.hallazgos.filter(hallazgo => !hallazgo.descartado && hallazgo.estado !== 'descartado');
}

function activeEvidence(caso: Caso) {
  return caso.evidencias.filter(evidencia => !evidencia.descartada);
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function findingResponses(caso: Caso, hallazgo: Hallazgo) {
  const responseIds = new Set(hallazgo.respuestasAuditado ?? []);
  return caso.respuestasAuditado.filter(respuesta => respuesta.hallazgoId === hallazgo.id || responseIds.has(respuesta.id));
}

function latestResponse(responses: RespuestaAuditado[]) {
  return [...responses].sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;
}

function criterionObjects(ids: string[]) {
  return ids.map(id => getCriterioById(id)).filter(Boolean) as Criterio[];
}

function hasCriterionMarco(hallazgo: Hallazgo, marco: Criterio['marco']) {
  const criteria = criterionObjects(hallazgo.criterios);
  if (criteria.some(criterio => criterio.marco === marco)) return true;
  if (marco === 'COBIT') return hasText(hallazgo.procesoCobit);
  if (marco === 'COSO') return hasText(hallazgo.componenteCoso);
  return hasText(hallazgo.seccionRgsi);
}

function findingNodeIds(caso: Caso, hallazgo: Hallazgo) {
  return caso.nodosTablero
    .filter(nodo => nodo.tipo === 'hallazgo' && nodo.refId === hallazgo.id)
    .map(nodo => nodo.id);
}

function hasBoardConnection(caso: Caso, hallazgo: Hallazgo) {
  const nodeIds = new Set(findingNodeIds(caso, hallazgo));
  if (nodeIds.size === 0) return false;
  return caso.conexionesTablero.some(conexion => nodeIds.has(conexion.desde) || nodeIds.has(conexion.hacia));
}

function hasTimelineEvent(caso: Caso, hallazgo: Hallazgo) {
  return caso.timeline.some(evento => evento.hallazgosVinculados?.includes(hallazgo.id));
}

function hasFinalDecision(caso: Caso, hallazgo: Hallazgo) {
  if (hallazgo.estado === 'cerrado' || hallazgo.estado === 'descartado') return true;
  return findingResponses(caso, hallazgo).some(respuesta => respuesta.decisionAuditor !== 'pendiente');
}

function riskRank(risk: NivelRiesgo | null | undefined) {
  if (risk === 'alto') return 3;
  if (risk === 'medio') return 2;
  if (risk === 'bajo') return 1;
  return 0;
}

function riskFromRank(rank: number): NivelRiesgo | null {
  if (rank >= 3) return 'alto';
  if (rank === 2) return 'medio';
  if (rank === 1) return 'bajo';
  return null;
}

function supportStatus(score: number): FindingSupportStatus {
  if (score >= 80) return 'defendible';
  if (score >= 50) return 'parcial';
  return 'debil';
}

export function supportStatusLabel(status: FindingSupportStatus) {
  if (status === 'defendible') return 'Defendible';
  if (status === 'parcial') return 'Parcial';
  return 'Debil';
}

export function coverageStatusLabel(status: FrameworkCoverageStatus) {
  if (status === 'cubierto') return 'Cubierto';
  if (status === 'parcial') return 'Parcial';
  if (status === 'debil') return 'Debil';
  return 'Sin cubrir';
}

export function calculateFindingSupport(caso: Caso, hallazgo: Hallazgo): FindingSupportResult {
  const responses = findingResponses(caso, hallazgo);
  const hasResponse = hallazgo.estadoRespuesta !== 'pendiente' || hasText(hallazgo.respuestaBanco) || responses.length > 0;

  const items: FindingSupportItem[] = [
    {
      id: 'titulo',
      label: 'Titulo',
      weight: 5,
      present: hasText(hallazgo.titulo),
      action: 'Registrar un titulo tecnico y defendible.',
    },
    {
      id: 'condicion',
      label: 'Condicion',
      weight: 10,
      present: hasText(hallazgo.condicion),
      action: 'Describir la situacion observada con alcance y periodo.',
    },
    {
      id: 'criterio',
      label: 'Criterio',
      weight: 8,
      present: hasText(hallazgo.criterio) || hallazgo.criterios.length > 0,
      action: 'Vincular el criterio normativo o de control aplicado.',
    },
    {
      id: 'causa',
      label: 'Causa',
      weight: 8,
      present: hasText(hallazgo.causa),
      action: 'Explicar la causa probable documentada.',
    },
    {
      id: 'efecto',
      label: 'Efecto',
      weight: 8,
      present: hasText(hallazgo.efecto),
      action: 'Explicar el efecto o riesgo para el proceso auditado.',
    },
    {
      id: 'conclusion',
      label: 'Conclusion',
      weight: 7,
      present: hasText(hallazgo.conclusion),
      action: 'Registrar la conclusion del auditor.',
    },
    {
      id: 'riesgo',
      label: 'Riesgo',
      weight: 8,
      present: riskRank(hallazgo.nivelRiesgo) > 0 && hallazgo.probabilidad > 0 && hallazgo.impacto > 0,
      action: 'Calificar probabilidad, impacto y nivel de riesgo.',
    },
    {
      id: 'recomendacion',
      label: 'Recomendacion',
      weight: 10,
      present: hasText(hallazgo.recomendacion),
      action: 'Agregar una recomendacion trazable al riesgo.',
    },
    {
      id: 'evidencias',
      label: 'Evidencias vinculadas',
      weight: 10,
      present: hallazgo.evidencias.length > 0,
      action: 'Vincular al menos una evidencia revisada.',
    },
    {
      id: 'cobit',
      label: 'Criterio COBIT',
      weight: 4,
      present: hasCriterionMarco(hallazgo, 'COBIT'),
      action: 'Relacionar el hallazgo con un criterio COBIT del alcance.',
    },
    {
      id: 'coso',
      label: 'Criterio COSO',
      weight: 4,
      present: hasCriterionMarco(hallazgo, 'COSO'),
      action: 'Relacionar el hallazgo con un componente COSO.',
    },
    {
      id: 'rgsi',
      label: 'Criterio RGSI',
      weight: 4,
      present: hasCriterionMarco(hallazgo, 'RGSI'),
      action: 'Relacionar el hallazgo con una seccion RGSI cuando aplique.',
    },
    {
      id: 'respuesta',
      label: 'Respuesta del auditado',
      weight: 4,
      present: hasResponse,
      action: 'Registrar respuesta, descargo o constancia de falta de respuesta.',
    },
    {
      id: 'tablero',
      label: 'Conexion en tablero',
      weight: 4,
      present: hasBoardConnection(caso, hallazgo),
      action: 'Conectar el hallazgo en el tablero de trazabilidad.',
    },
    {
      id: 'timeline',
      label: 'Evento en linea de tiempo',
      weight: 4,
      present: hasTimelineEvent(caso, hallazgo),
      action: 'Vincular el hallazgo a un evento de la cronologia.',
    },
    {
      id: 'decision',
      label: 'Decision del auditor',
      weight: 3,
      present: hasFinalDecision(caso, hallazgo),
      action: 'Registrar decision de mantener, ajustar o descartar.',
    },
  ];

  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const earned = items.filter(item => item.present).reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round((earned / total) * 100);
  const status = supportStatus(score);

  return {
    hallazgoId: hallazgo.id,
    numero: hallazgo.numero,
    score,
    status,
    statusLabel: supportStatusLabel(status),
    presentItems: items.filter(item => item.present),
    missingItems: items.filter(item => !item.present),
    items,
  };
}

export function detectTraceabilityGaps(caso: Caso): TraceabilityGap[] {
  const gaps: TraceabilityGap[] = [];
  const findings = activeFindings(caso);
  const evidences = activeEvidence(caso);
  const evidenceIdsLinkedFromFindings = new Set(findings.flatMap(hallazgo => hallazgo.evidencias));
  const nodeIds = new Set(caso.nodosTablero.map(nodo => nodo.id));
  const connectedNodeIds = new Set(caso.conexionesTablero.flatMap(conexion => [conexion.desde, conexion.hacia]));

  for (const hallazgo of findings) {
    const support = calculateFindingSupport(caso, hallazgo);
    const addFindingGap = (id: string, severidad: TraceabilityGapSeverity, mensaje: string, accionSugerida: string) => {
      gaps.push({
        id: `${hallazgo.id}-${id}`,
        tipo: 'hallazgo',
        severidad,
        entidadId: hallazgo.id,
        entidadLabel: `${hallazgo.numero} - ${hallazgo.titulo}`,
        mensaje,
        accionSugerida,
        hallazgoId: hallazgo.id,
      });
    };

    if (hallazgo.evidencias.length === 0) addFindingGap('sin-evidencia', 'critica', `${hallazgo.numero} no tiene evidencias vinculadas.`, 'Vincular evidencia revisada al hallazgo.');
    if (hallazgo.criterios.length === 0 && !hasText(hallazgo.criterio)) addFindingGap('sin-criterio', 'critica', `${hallazgo.numero} no tiene criterio normativo.`, 'Relacionar COBIT, COSO o RGSI segun corresponda.');
    if (!hasText(hallazgo.causa)) addFindingGap('sin-causa', 'advertencia', `${hallazgo.numero} no documenta causa.`, 'Completar causa probable del hallazgo.');
    if (!hasText(hallazgo.efecto)) addFindingGap('sin-efecto', 'advertencia', `${hallazgo.numero} no documenta efecto o riesgo.`, 'Completar efecto o riesgo asociado.');
    if (!hasText(hallazgo.recomendacion)) addFindingGap('sin-recomendacion', 'critica', `${hallazgo.numero} no tiene recomendacion.`, 'Agregar recomendacion trazable al riesgo.');
    if (hallazgo.estadoRespuesta === 'pendiente' && findingResponses(caso, hallazgo).length === 0) {
      addFindingGap('sin-respuesta', hallazgo.nivelRiesgo === 'alto' ? 'critica' : 'advertencia', `${hallazgo.numero} no tiene respuesta del auditado.`, 'Solicitar o registrar respuesta formal del auditado.');
    }
    if (!hasTimelineEvent(caso, hallazgo)) addFindingGap('sin-timeline', 'informativa', `${hallazgo.numero} no aparece en la linea de tiempo.`, 'Vincularlo a un evento del expediente.');
    if (!hasBoardConnection(caso, hallazgo)) addFindingGap('sin-tablero', 'advertencia', `${hallazgo.numero} no tiene conexion en el tablero.`, 'Conectarlo con evidencias, criterios o respuesta.');
    if (hallazgo.nivelRiesgo === 'alto' && support.score < 80) {
      gaps.push({
        id: `${hallazgo.id}-riesgo-alto-sustento-${support.score}`,
        tipo: 'riesgo',
        severidad: 'critica',
        entidadId: hallazgo.id,
        entidadLabel: `${hallazgo.numero} - ${hallazgo.titulo}`,
        mensaje: `${hallazgo.numero} tiene riesgo alto con sustentacion ${support.score}%.`,
        accionSugerida: 'Completar los elementos faltantes antes de emitir informe.',
        hallazgoId: hallazgo.id,
      });
    }
  }

  for (const evidencia of evidences) {
    const linked = evidenceIdsLinkedFromFindings.has(evidencia.id) || (evidencia.hallazgos ?? []).some(id => findings.some(hallazgo => hallazgo.id === id));
    if (!linked) {
      gaps.push({
        id: `${evidencia.id}-huerfana`,
        tipo: 'evidencia',
        severidad: 'advertencia',
        entidadId: evidencia.id,
        entidadLabel: evidencia.titulo,
        mensaje: `${evidencia.id} esta registrada, pero no sustenta ningun hallazgo.`,
        accionSugerida: 'Vincularla a un hallazgo, observacion o descartarla con justificacion.',
        evidenciaId: evidencia.id,
      });
    }
    if ((evidencia.estadoRevision ?? 'pendiente') === 'pendiente') {
      gaps.push({
        id: `${evidencia.id}-no-revisada`,
        tipo: 'evidencia',
        severidad: 'informativa',
        entidadId: evidencia.id,
        entidadLabel: evidencia.titulo,
        mensaje: `${evidencia.id} esta registrada, pero no figura como revisada.`,
        accionSugerida: 'Marcarla como revisada, observada o descartada.',
        evidenciaId: evidencia.id,
      });
    }
  }

  for (const criterio of todosLosCriterios) {
    const relatedFindings = findings.filter(hallazgo => hallazgo.criterios.includes(criterio.id));
    const relatedEvidence = evidences.filter(evidencia => (evidencia.criterios ?? []).includes(criterio.id));
    if (relatedEvidence.length === 0) {
      gaps.push({
        id: `${criterio.id}-sin-evidencia`,
        tipo: 'criterio',
        severidad: 'advertencia',
        entidadId: criterio.id,
        entidadLabel: `${criterio.marco} ${criterio.codigo}`,
        mensaje: `${criterio.marco} ${criterio.codigo} esta dentro del alcance, pero no tiene evidencias asociadas.`,
        accionSugerida: 'Vincular evidencia documental o explicar que no aplica en el informe.',
        criterioId: criterio.id,
      });
    }
    if (relatedFindings.length === 0) {
      gaps.push({
        id: `${criterio.id}-sin-hallazgo`,
        tipo: 'criterio',
        severidad: 'informativa',
        entidadId: criterio.id,
        entidadLabel: `${criterio.marco} ${criterio.codigo}`,
        mensaje: `${criterio.marco} ${criterio.codigo} no tiene hallazgo o conclusion asociada.`,
        accionSugerida: 'Registrar conclusion de cobertura, aun si no existe hallazgo.',
        criterioId: criterio.id,
      });
    }
  }

  for (const respuesta of caso.respuestasAuditado) {
    if (!hasText(respuesta.evidenciaPresentada)) {
      gaps.push({
        id: `${respuesta.id}-sin-evidencia-respaldo`,
        tipo: 'respuesta',
        severidad: 'informativa',
        entidadId: respuesta.id,
        entidadLabel: `Respuesta ${respuesta.id}`,
        mensaje: `${respuesta.id} no declara evidencia de respaldo del auditado.`,
        accionSugerida: 'Registrar el descargo documental o dejar constancia de que no fue presentado.',
        hallazgoId: respuesta.hallazgoId,
      });
    }
  }

  for (const conexion of caso.conexionesTablero) {
    if (!nodeIds.has(conexion.desde) || !nodeIds.has(conexion.hacia)) {
      gaps.push({
        id: `${conexion.id}-nodos-rotos`,
        tipo: 'tablero',
        severidad: 'critica',
        entidadId: conexion.id,
        entidadLabel: `Relacion ${conexion.id}`,
        mensaje: `${conexion.id} apunta a un nodo inexistente.`,
        accionSugerida: 'Eliminar o reconstruir la relacion visual.',
        conexionId: conexion.id,
      });
    }
    if (!hasText(conexion.justificacion)) {
      gaps.push({
        id: `${conexion.id}-sin-justificacion`,
        tipo: 'tablero',
        severidad: 'advertencia',
        entidadId: conexion.id,
        entidadLabel: `Relacion ${conexion.id}`,
        mensaje: `${conexion.id} no tiene justificacion auditable.`,
        accionSugerida: 'Registrar por que esta relacion sustenta el razonamiento.',
        conexionId: conexion.id,
      });
    }
  }

  for (const nodo of caso.nodosTablero) {
    if (!connectedNodeIds.has(nodo.id)) {
      gaps.push({
        id: `${nodo.id}-aislado`,
        tipo: 'tablero',
        severidad: 'informativa',
        entidadId: nodo.id,
        entidadLabel: nodo.titulo,
        mensaje: `${nodo.refId} esta aislado en el tablero.`,
        accionSugerida: 'Conectarlo con una evidencia, hallazgo, criterio o respuesta.',
      });
    }
  }

  return gaps;
}

export function calculateFrameworkCoverage(caso: Caso): FrameworkCoverageResult {
  const findings = activeFindings(caso);
  const evidences = activeEvidence(caso);
  const items = todosLosCriterios.map(criterio => {
    const relatedFindings = findings.filter(hallazgo => hallazgo.criterios.includes(criterio.id));
    const findingEvidenceIds = new Set(relatedFindings.flatMap(hallazgo => hallazgo.evidencias));
    const relatedEvidence = evidences.filter(evidencia => (evidencia.criterios ?? []).includes(criterio.id) || findingEvidenceIds.has(evidencia.id));
    const relatedResponses = caso.respuestasAuditado.filter(respuesta => relatedFindings.some(hallazgo => hallazgo.id === respuesta.hallazgoId));
    const maxRisk = riskFromRank(Math.max(0, ...relatedFindings.map(hallazgo => riskRank(hallazgo.nivelRiesgo))));
    const supportScores = relatedFindings.map(hallazgo => calculateFindingSupport(caso, hallazgo).score);
    const avgSupportScore = supportScores.length > 0
      ? Math.round(supportScores.reduce((sum, score) => sum + score, 0) / supportScores.length)
      : 0;

    let status: FrameworkCoverageStatus = 'sin-cubrir';
    if (relatedFindings.length === 0 && relatedEvidence.length === 0) status = 'sin-cubrir';
    else if (relatedFindings.length === 0 || relatedEvidence.length === 0 || avgSupportScore < 65) status = 'debil';
    else if (avgSupportScore < 85 || (riskRank(maxRisk) >= 3 && relatedResponses.length === 0)) status = 'parcial';
    else status = 'cubierto';

    return {
      criterio,
      evidencias: relatedEvidence,
      hallazgos: relatedFindings,
      respuestas: relatedResponses,
      maxRisk,
      avgSupportScore,
      status,
      statusLabel: coverageStatusLabel(status),
    };
  });

  const byMarco = {
    COBIT: items.filter(item => item.criterio.marco === 'COBIT'),
    COSO: items.filter(item => item.criterio.marco === 'COSO'),
    RGSI: items.filter(item => item.criterio.marco === 'RGSI'),
  };

  return {
    items,
    byMarco,
    summary: {
      total: items.length,
      covered: items.filter(item => item.status === 'cubierto').length,
      partial: items.filter(item => item.status === 'parcial').length,
      weak: items.filter(item => item.status === 'debil').length,
      uncovered: items.filter(item => item.status === 'sin-cubrir').length,
    },
  };
}

function normalizeRelation(label?: string) {
  return (label ?? 'relacion').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function adjacentNodeIds(nodeId: string, connections: ConexionTablero[]) {
  return connections.reduce<string[]>((ids, conexion) => {
    if (conexion.desde === nodeId) ids.push(conexion.hacia);
    if (conexion.hacia === nodeId) ids.push(conexion.desde);
    return ids;
  }, []);
}

export function calculateTopologicalImpact(caso: Caso): TopologicalImpactResult {
  const nodeById = new Map(caso.nodosTablero.map(nodo => [nodo.id, nodo]));
  const findings = activeFindings(caso);
  const evidences = activeEvidence(caso);

  const nodes = caso.nodosTablero.map(node => {
    const directConnections = caso.conexionesTablero.filter(conexion => conexion.desde === node.id || conexion.hacia === node.id);
    const directAdjacent = new Set(adjacentNodeIds(node.id, caso.conexionesTablero));
    const secondOrder = new Set<string>();
    for (const adjacent of directAdjacent) {
      for (const next of adjacentNodeIds(adjacent, caso.conexionesTablero)) {
        if (next !== node.id) secondOrder.add(next);
      }
    }

    const connectionTypes = directConnections.reduce<Record<string, number>>((counts, conexion) => {
      const key = normalizeRelation(conexion.etiqueta);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});

    const connectedTypes = new Set(
      [...directAdjacent]
        .map(id => nodeById.get(id)?.tipo)
        .filter(Boolean)
    );

    let score = directConnections.length * 12 + secondOrder.size * 3;
    const reasons: string[] = [];
    if (directConnections.length > 0) reasons.push(`Conecta ${directConnections.length} relaciones del expediente.`);

    if (node.tipo === 'hallazgo') {
      const hallazgo = findings.find(item => item.id === node.refId);
      if (hallazgo) {
        score += hallazgo.evidencias.length * 5 + hallazgo.criterios.length * 4 + findingResponses(caso, hallazgo).length * 4;
        reasons.push(`Relaciona ${hallazgo.evidencias.length} evidencias, ${hallazgo.criterios.length} criterios y ${findingResponses(caso, hallazgo).length} respuestas.`);
      }
    }

    if (['documento', 'evidencia', 'entrevista', 'prueba'].includes(node.tipo)) {
      const evidencia = evidences.find(item => item.id === node.refId);
      if (evidencia && (evidencia.hallazgos ?? []).length > 1) {
        score += evidencia.hallazgos?.length ? evidencia.hallazgos.length * 8 : 0;
        reasons.push(`Sustenta ${(evidencia.hallazgos ?? []).length} hallazgos.`);
      }
    }

    if (node.tipo === 'criterio') {
      const relatedFindings = findings.filter(hallazgo => hallazgo.criterios.includes(node.refId));
      if (relatedFindings.length > 1) {
        score += relatedFindings.length * 7;
        reasons.push(`Afecta ${relatedFindings.length} hallazgos.`);
      }
    }

    const isBridge = directConnections.length >= 3 && connectedTypes.size >= 2;
    if (isBridge) reasons.push('Actua como nodo puente entre piezas distintas del expediente.');

    const cappedScore = Math.min(100, Math.round(score));
    const level: TopologicalImpactLevel = cappedScore >= 70 ? 'alto' : cappedScore >= 35 ? 'medio' : 'bajo';

    return {
      node,
      degree: directConnections.length,
      pathCount: directAdjacent.size + secondOrder.size,
      connectionTypes,
      score: cappedScore,
      level,
      reasons: reasons.length > 0 ? reasons : ['No tiene impacto relacional significativo.'],
      isBridge,
    };
  }).sort((a, b) => b.score - a.score);

  const impactByRef = new Map(nodes.map(impact => [impact.node.refId, impact]));
  const evidenceMultiFinding = evidences
    .map(evidencia => ({
      evidencia,
      hallazgos: findings.filter(hallazgo => (evidencia.hallazgos ?? []).includes(hallazgo.id) || hallazgo.evidencias.includes(evidencia.id)),
    }))
    .filter(item => item.hallazgos.length > 1);

  const criteriaMultiFinding = todosLosCriterios
    .map(criterio => ({
      criterio,
      hallazgos: findings.filter(hallazgo => hallazgo.criterios.includes(criterio.id)),
    }))
    .filter(item => item.hallazgos.length > 1);

  const systemicFindings = findings
    .map(hallazgo => {
      const impact = impactByRef.get(hallazgo.id) ?? null;
      const reasons = [
        hallazgo.evidencias.length >= 3 ? `Conecta ${hallazgo.evidencias.length} evidencias.` : '',
        hallazgo.criterios.length >= 3 ? `Afecta ${hallazgo.criterios.length} criterios.` : '',
        impact && impact.level !== 'bajo' ? `Tiene impacto topologico ${impact.level} (${impact.score}%).` : '',
      ].filter(Boolean);
      return { hallazgo, impact, reasons };
    })
    .filter(item => item.reasons.length > 0);

  return {
    nodes,
    highImpactNodes: nodes.filter(item => item.level === 'alto'),
    bridgeNodes: nodes.filter(item => item.isBridge),
    isolatedNodes: caso.nodosTablero.filter(nodo => !caso.conexionesTablero.some(conexion => conexion.desde === nodo.id || conexion.hacia === nodo.id)),
    evidenceMultiFinding,
    criteriaMultiFinding,
    systemicFindings,
  };
}

interface AssistedRule {
  id: string;
  terms: string[];
  title: string;
  criteriaIds: string[];
  criterio: string;
  causa: string;
  efecto: string;
  recomendacion: string;
  probabilidad: number;
  impacto: number;
}

const assistedRules: AssistedRule[] = [
  {
    id: 'backup-restauracion',
    terms: ['backup', 'respaldo', 'respaldos', 'restauracion', 'restaurar', 'recuperacion'],
    title: 'Respaldos sin evidencia suficiente de restauracion',
    criteriaIds: ['RGSI-S6', 'COBIT-PO2', 'COBIT-ME2', 'COSO-ACTIVIDADES-CONTROL'],
    criterio: 'COBIT PO2/ME2 y RGSI Seccion 6 requieren controles verificables sobre respaldo, integridad y recuperacion.',
    causa: 'El procedimiento de respaldo no evidencia verificacion periodica de restauracion o integridad.',
    efecto: 'Riesgo de respaldos inutilizables o recuperacion fallida ante un incidente.',
    recomendacion: 'Formalizar pruebas periodicas de restauracion, documentar resultados y reportar excepciones a operaciones TI.',
    probabilidad: 4,
    impacto: 5,
  },
  {
    id: 'terceros-sla',
    terms: ['proveedor', 'sla', 'contrato', 'tercero', 'cloud', 'servicio externo'],
    title: 'Gestion de terceros con clausulas de continuidad insuficientes',
    criteriaIds: ['RGSI-S11', 'COBIT-PO3', 'COSO-EVALUACION-RIESGOS'],
    criterio: 'RGSI Seccion 11 y COBIT PO3 requieren gestion formal de terceros criticos y condiciones de continuidad.',
    causa: 'La contratacion no evidencia revision especializada de riesgos TI ni clausulas de continuidad suficientes.',
    efecto: 'Exposicion a interrupciones sin niveles de servicio, seguimiento o derecho de auditoria adecuados.',
    recomendacion: 'Actualizar condiciones contractuales con SLA, continuidad, notificacion de incidentes y derecho de auditoria.',
    probabilidad: 3,
    impacto: 5,
  },
  {
    id: 'gobierno-ti',
    terms: ['comite ti', 'actas', 'estructura', 'organigrama', 'roles', 'responsabilidades', 'gobierno'],
    title: 'Gobierno de TI con trazabilidad documental incompleta',
    criteriaIds: ['RGSI-S2', 'COBIT-PO4', 'COSO-INFORMACION-COMUNICACION', 'COSO-AMBIENTE-CONTROL'],
    criterio: 'COBIT PO4, COSO y RGSI Seccion 2 requieren roles, responsabilidades y decisiones formalmente documentadas.',
    causa: 'No existe control suficiente para formalizar, aprobar y dar seguimiento a decisiones de gobierno TI.',
    efecto: 'Perdida de trazabilidad sobre responsables, acuerdos y acciones correctivas.',
    recomendacion: 'Formalizar actas, responsables, plazos de aprobacion y seguimiento periodico de acuerdos.',
    probabilidad: 3,
    impacto: 4,
  },
  {
    id: 'auditoria-seguimiento',
    terms: ['auditoria interna', 'seguimiento', 'observaciones', 'monitoreo', 'control interno'],
    title: 'Seguimiento de observaciones con evidencia insuficiente',
    criteriaIds: ['RGSI-S12', 'COBIT-ME2', 'COSO-SUPERVISION'],
    criterio: 'COBIT ME2, COSO Supervision y RGSI Seccion 12 requieren seguimiento formal de observaciones de auditoria.',
    causa: 'El proceso de seguimiento no demuestra responsables, plazos o evidencia de cierre.',
    efecto: 'Persistencia de debilidades de control y dificultad para demostrar correccion efectiva.',
    recomendacion: 'Implementar matriz de seguimiento con responsables, fechas compromiso, evidencia y validacion del auditor.',
    probabilidad: 3,
    impacto: 4,
  },
  {
    id: 'inventario-activos',
    terms: ['inventario', 'activos', 'clasificacion', 'informacion critica', 'propietario'],
    title: 'Inventario de activos criticos incompleto o desactualizado',
    criteriaIds: ['COBIT-PO2', 'COBIT-ME2', 'COSO-SUPERVISION'],
    criterio: 'COBIT PO2/ME2 y COSO Supervision requieren informacion critica identificada y controlada.',
    causa: 'El mantenimiento del inventario depende de controles manuales sin alertas o revision periodica suficiente.',
    efecto: 'Decisiones de continuidad y seguridad pueden basarse en informacion incompleta.',
    recomendacion: 'Definir responsables, periodicidad de revision, alertas de vencimiento y evidencia de actualizacion.',
    probabilidad: 2,
    impacto: 3,
  },
  {
    id: 'estrategia-peti',
    terms: ['estrategia', 'plan estrategico', 'peti', 'plan de ti', 'direccion tecnologica'],
    title: 'Planificacion estrategica de TI sin evidencia completa de seguimiento',
    criteriaIds: ['COBIT-PO1', 'COBIT-PO3', 'COSO-EVALUACION-RIESGOS'],
    criterio: 'COBIT PO1/PO3 requieren direccion tecnologica y planes de TI alineados al negocio.',
    causa: 'La planificacion no evidencia responsables, aprobacion o seguimiento periodico suficiente.',
    efecto: 'Riesgo de iniciativas de TI no alineadas a continuidad, control interno o prioridades del negocio.',
    recomendacion: 'Actualizar el plan de TI, aprobarlo formalmente y documentar seguimiento periodico.',
    probabilidad: 3,
    impacto: 4,
  },
  {
    id: 'personal-competencias',
    terms: ['personal', 'competencias', 'capacitacion', 'recursos humanos', 'rrhh'],
    title: 'Competencias o asignaciones de personal TI no actualizadas',
    criteriaIds: ['COBIT-PO7', 'COSO-AMBIENTE-CONTROL', 'RGSI-S2'],
    criterio: 'COBIT PO7, COSO Ambiente de control y RGSI Seccion 2 requieren responsabilidades y competencias vigentes.',
    causa: 'No se evidencia integracion suficiente entre cambios de personal, capacitacion y actualizacion documental.',
    efecto: 'Riesgo de confusion operativa o ejecucion incorrecta de controles criticos.',
    recomendacion: 'Actualizar roles, capacitar responsables y dejar evidencia de revision periodica.',
    probabilidad: 3,
    impacto: 4,
  },
];

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function matchedTerms(rule: AssistedRule, normalizedDescription: string) {
  return rule.terms.filter(term => normalizedDescription.includes(normalizeText(term)));
}

function suggestion(field: AssistedSuggestionField, label: string, value: string | number | string[], reason: string, sourceTerms: string[], confidence: number): AssistedFindingSuggestion {
  return { field, label, value, reason, sourceTerms, confidence };
}

export function generateAssistedFindingDraft(description: string, caso: Caso): AssistedFindingDraft {
  const normalized = normalizeText(description);
  const matched = assistedRules
    .map(rule => ({ rule, terms: matchedTerms(rule, normalized) }))
    .filter(item => item.terms.length > 0)
    .sort((a, b) => b.terms.length - a.terms.length);

  const primary = matched[0]?.rule;
  const sourceTerms = matched.flatMap(item => item.terms);
  const criteriaIds = Array.from(new Set(matched.flatMap(item => item.rule.criteriaIds)));
  const evidenceIds = activeEvidence(caso)
    .filter(evidencia => {
      const evidenceText = normalizeText(`${evidencia.titulo} ${evidencia.descripcion} ${evidencia.fuente}`);
      return sourceTerms.some(term => evidenceText.includes(normalizeText(term)));
    })
    .slice(0, 5)
    .map(evidencia => evidencia.id);

  const baseConfidence = Math.min(95, 45 + sourceTerms.length * 12);
  const suggestions: AssistedFindingSuggestion[] = [
    suggestion(
      'condicion',
      'Condicion',
      description.trim(),
      'Se usa la descripcion inicial como condicion observada para que el auditor la depure.',
      sourceTerms,
      80,
    ),
  ];

  if (primary) {
    suggestions.push(
      suggestion('titulo', 'Titulo', primary.title, 'Titulo preliminar basado en palabras clave detectadas.', sourceTerms, baseConfidence),
      suggestion('criterio', 'Criterio posible', primary.criterio, 'Criterio sugerido por reglas locales, no definitivo.', sourceTerms, baseConfidence),
      suggestion('criterios', 'Criterios COBIT/COSO/RGSI', criteriaIds, 'Criterios sugeridos por coincidencia de dominio.', sourceTerms, baseConfidence),
      suggestion('causa', 'Causa probable', primary.causa, 'Causa tipo para estructurar el borrador.', sourceTerms, Math.max(45, baseConfidence - 15)),
      suggestion('efecto', 'Efecto o riesgo', primary.efecto, 'Efecto sugerido segun el patron observado.', sourceTerms, baseConfidence),
      suggestion('recomendacion', 'Recomendacion sugerida', primary.recomendacion, 'Recomendacion inicial editable por el auditor.', sourceTerms, baseConfidence),
      suggestion('probabilidad', 'Probabilidad preliminar', primary.probabilidad, 'Valor preliminar; debe validarlo el auditor.', sourceTerms, Math.max(40, baseConfidence - 20)),
      suggestion('impacto', 'Impacto preliminar', primary.impacto, 'Valor preliminar; debe validarlo el auditor.', sourceTerms, Math.max(40, baseConfidence - 20)),
    );
  } else {
    suggestions.push(
      suggestion('titulo', 'Titulo', 'Hallazgo preliminar sobre control de TI', 'No se detecto una regla especifica; se propone un titulo generico editable.', [], 35),
      suggestion('criterio', 'Criterio posible', 'Seleccionar criterio COBIT, COSO o RGSI segun el objetivo de auditoria.', 'No hay coincidencia suficiente para proponer un criterio especifico.', [], 30),
    );
  }

  if (evidenceIds.length > 0) {
    suggestions.push(
      suggestion('evidencias', 'Evidencias relacionadas', evidenceIds, 'Evidencias existentes contienen terminos similares a la descripcion.', sourceTerms, Math.min(90, 50 + evidenceIds.length * 8)),
    );
  }

  return {
    description,
    matchedRules: matched.map(item => item.rule.id),
    suggestions,
    disclaimer: 'Borrador asistido por reglas locales. True Audit no inventa hallazgos y no reemplaza el juicio profesional del auditor.',
  };
}

export function buildFindingDefenseSheet(caso: Caso, hallazgoId: string): FindingDefenseSheet | null {
  const hallazgo = caso.hallazgos.find(item => item.id === hallazgoId);
  if (!hallazgo) return null;

  const evidencias = hallazgo.evidencias
    .map(id => caso.evidencias.find(evidencia => evidencia.id === id))
    .filter(Boolean) as Evidencia[];
  const criterios = criterionObjects(hallazgo.criterios);
  const respuestas = findingResponses(caso, hallazgo);
  const latest = latestResponse(respuestas);
  const timelineEvents = caso.timeline.filter(evento => evento.hallazgosVinculados?.includes(hallazgo.id));
  const nodeIds = new Set(findingNodeIds(caso, hallazgo));
  const boardConnections = caso.conexionesTablero.filter(conexion => nodeIds.has(conexion.desde) || nodeIds.has(conexion.hacia));
  const boardNodeIds = new Set(boardConnections.flatMap(conexion => [conexion.desde, conexion.hacia]));
  const boardNodes = caso.nodosTablero.filter(nodo => boardNodeIds.has(nodo.id) || nodeIds.has(nodo.id));
  const support = calculateFindingSupport(caso, hallazgo);
  const criteriaText = criterios.length > 0
    ? criterios.map(criterio => `${criterio.marco} ${criterio.codigo}`).join(', ')
    : hallazgo.criterio;

  return {
    hallazgo,
    support,
    evidencias,
    criterios,
    respuestas,
    timelineEvents,
    boardNodes,
    boardConnections,
    decisionAuditor: latest?.decisionAuditor ?? (hallazgo.estado === 'cerrado' ? 'cerrado' : 'pendiente'),
    decisionJustification: latest?.comentarioAuditor || hallazgo.conclusion || 'Sin justificacion final registrada.',
    traceabilityText: `${hallazgo.numero} se sustenta en ${evidencias.length} evidencias, se contrasta contra ${criteriaText}, expone el riesgo "${hallazgo.efecto}" y deriva en la recomendacion "${hallazgo.recomendacion}".`,
    boardUrl: `/casos/${caso.id}/tablero`,
  };
}

export function buildRelationReasoningLog(caso: Caso): RelationReasoningLogItem[] {
  const nodeById = new Map(caso.nodosTablero.map(node => [node.id, node]));

  return caso.conexionesTablero
    .flatMap(connection => {
      const sourceNode = nodeById.get(connection.desde) ?? null;
      const targetNode = nodeById.get(connection.hacia) ?? null;
      const relationLabel = connection.etiqueta ?? 'relacion';
      const sourceLabel = sourceNode ? `${sourceNode.refId} - ${sourceNode.titulo}` : connection.desde;
      const targetLabel = targetNode ? `${targetNode.refId} - ${targetNode.titulo}` : connection.hacia;
      const entries = connection.reasoningLog?.length
        ? connection.reasoningLog
        : connection.justificacion?.trim()
          ? [
              {
                id: `${connection.id}-LOG-001`,
                fecha: connection.updatedAt ?? connection.createdAt ?? '1970-01-01T00:00:00.000Z',
                accion: connection.estado === 'validada'
                  ? 'validada' as const
                  : connection.estado === 'requiere-revision'
                    ? 'requiere-revision' as const
                    : 'justificada' as const,
                detalle: connection.justificacion.trim(),
                usuarioRol: connection.createdBy,
              },
            ]
          : [];

      return entries.map(entry => ({
        id: entry.id,
        connection,
        sourceNode,
        targetNode,
        fecha: entry.fecha,
        accion: entry.accion,
        detalle: entry.detalle,
        usuarioRol: entry.usuarioRol,
        estado: connection.estado,
        relationLabel,
        sourceLabel,
        targetLabel,
      }));
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}
