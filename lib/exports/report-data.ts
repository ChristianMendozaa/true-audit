import { getCriterioById } from '@/lib/frameworks';
import { buildRelationReasoningLog, calculateFindingSupport, calculateFrameworkCoverage } from '@/lib/audit-analysis';
import type { Caso, Hallazgo } from '@/lib/types';

export function findingCriteriaText(hallazgo: Hallazgo): string {
  const criteria = hallazgo.criterios
    .map(id => getCriterioById(id))
    .filter(Boolean)
    .map(criterio => `${criterio?.marco} ${criterio?.codigo}`)
    .join('; ');
  return criteria || hallazgo.criterio;
}

export function findingEvidenceText(caso: Caso, hallazgo: Hallazgo): string {
  return hallazgo.evidencias
    .map(id => {
      const evidencia = caso.evidencias.find(item => item.id === id);
      return evidencia ? `${id} - ${evidencia.titulo}` : id;
    })
    .join('; ');
}

export function findingResponseText(caso: Caso, hallazgo: Hallazgo): string {
  const responses = caso.respuestasAuditado
    .filter(respuesta => respuesta.hallazgoId === hallazgo.id)
    .map(respuesta => `${respuesta.postura}: ${respuesta.argumento}`)
    .join('; ');
  return responses || hallazgo.respuestaBanco || 'Sin respuesta registrada.';
}

export function finalConclusion(caso: Caso): string {
  const critical = caso.hallazgos.filter(hallazgo => hallazgo.severidad === 'critico').length;
  const pending = caso.hallazgos.filter(hallazgo => hallazgo.estadoRespuesta === 'pendiente').length;
  return `Con base en el relevamiento, revision documental, pruebas y contraste normativo, el equipo auditor concluye que ${caso.banco} presenta ${critical} hallazgos criticos y ${pending} hallazgos pendientes de respuesta formal. La trazabilidad evidencia que las recomendaciones deben priorizar continuidad operativa, respaldo, contratos con terceros, gobierno TI y seguimiento de auditoria interna.`;
}

export function findingSupportText(caso: Caso, hallazgo: Hallazgo): string {
  const support = calculateFindingSupport(caso, hallazgo);
  const missing = support.missingItems.map(item => item.label).join(', ');
  return `${support.score}% - ${support.statusLabel}${missing ? `. Pendiente: ${missing}.` : '. Sin faltantes materiales.'}`;
}

export function assuranceSummaryText(caso: Caso): string {
  const activeFindings = caso.hallazgos.filter(hallazgo => !hallazgo.descartado && hallazgo.estado !== 'descartado');
  const support = activeFindings.map(hallazgo => calculateFindingSupport(caso, hallazgo));
  const avgSupport = support.length > 0
    ? Math.round(support.reduce((sum, item) => sum + item.score, 0) / support.length)
    : 0;
  const defendible = support.filter(item => item.status === 'defendible').length;
  const coverage = calculateFrameworkCoverage(caso);

  return `Aseguramiento del expediente: sustentacion media ${avgSupport}%, ${defendible} de ${support.length} hallazgos defendibles y ${coverage.summary.covered} de ${coverage.summary.total} criterios normativos cubiertos. Esta medicion evalua completitud, trazabilidad y cobertura documental; no reemplaza el juicio profesional del auditor.`;
}

export function relationReasoningText(caso: Caso, limit = 5): string {
  const entries = buildRelationReasoningLog(caso);
  if (entries.length === 0) {
    return 'Bitacora de razonamiento: no hay justificaciones de relaciones registradas en el tablero.';
  }

  const sample = entries
    .slice(0, limit)
    .map(entry => `${entry.connection.id} (${entry.relationLabel}) ${entry.sourceLabel} -> ${entry.targetLabel}: ${entry.detalle}`)
    .join(' | ');

  return `Bitacora de razonamiento del tablero: ${entries.length} decisiones registradas. ${sample}`;
}
