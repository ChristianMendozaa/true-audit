import { getCriterioById } from '@/lib/frameworks';
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
  return `Con base en el relevamiento, revisión documental, pruebas y contraste normativo, el equipo auditor concluye que ${caso.banco} presenta ${critical} hallazgos críticos y ${pending} hallazgos pendientes de respuesta formal. La trazabilidad evidencia que las recomendaciones deben priorizar continuidad operativa, respaldo, contratos con terceros, gobierno TI y seguimiento de auditoría interna.`;
}
