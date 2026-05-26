import type { Caso, Hallazgo, RolCaso } from '@/lib/types';
import { canRoleEditAuditWork } from '@/lib/auth/permissions';

const AUDITADO_HALLAZGO_FIELDS = new Set<keyof Hallazgo>([
  'respuestaBanco',
  'estadoRespuesta',
  'estado',
  'respuestasAuditado',
]);

function stable(value: unknown) {
  return JSON.stringify(value ?? null);
}

function sameExcept<T extends Record<string, unknown>>(before: T, after: T, allowed: Set<keyof T>) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)] as Array<keyof T>);
  for (const key of keys) {
    if (allowed.has(key)) continue;
    if (stable(before[key]) !== stable(after[key])) return false;
  }
  return true;
}

function auditadoOnlyChangedResponses(before: Caso, after: Caso) {
  if (stable(before.evidencias) !== stable(after.evidencias)) return false;
  if (stable(before.nodosTablero) !== stable(after.nodosTablero)) return false;
  if (stable(before.conexionesTablero) !== stable(after.conexionesTablero)) return false;

  const beforeWithoutAllowed = {
    ...before,
    hallazgos: undefined,
    respuestasAuditado: undefined,
    timeline: undefined,
    revision: undefined,
    updatedAt: undefined,
    updatedBy: undefined,
  };
  const afterWithoutAllowed = {
    ...after,
    hallazgos: undefined,
    respuestasAuditado: undefined,
    timeline: undefined,
    revision: undefined,
    updatedAt: undefined,
    updatedBy: undefined,
  };
  if (stable(beforeWithoutAllowed) !== stable(afterWithoutAllowed)) return false;

  if (after.respuestasAuditado.length < before.respuestasAuditado.length) return false;
  if (!before.respuestasAuditado.every(response => after.respuestasAuditado.some(next => next.id === response.id))) {
    return false;
  }

  if (before.hallazgos.length !== after.hallazgos.length) return false;
  for (const previousFinding of before.hallazgos) {
    const nextFinding = after.hallazgos.find(finding => finding.id === previousFinding.id);
    if (!nextFinding) return false;
    if (!sameExcept(previousFinding as unknown as Record<string, unknown>, nextFinding as unknown as Record<string, unknown>, AUDITADO_HALLAZGO_FIELDS as Set<string> as Set<keyof Record<string, unknown>>)) {
      return false;
    }
    if (nextFinding.estado !== previousFinding.estado && nextFinding.estado !== 'respondido') {
      return false;
    }
  }

  if (after.timeline.length < before.timeline.length) return false;
  const existingTimelineUnchanged = before.timeline.every(event => {
    const nextEvent = after.timeline.find(next => next.id === event.id);
    return nextEvent && stable(nextEvent) === stable(event);
  });
  if (!existingTimelineUnchanged) return false;

  const newEvents = after.timeline.filter(event => !before.timeline.some(previous => previous.id === event.id));
  return newEvents.every(event => event.tipo === 'respuesta-banco');
}

export function canRolePersistCaseChange(rol: RolCaso, before: Caso | null, after: Caso) {
  if (canRoleEditAuditWork(rol)) return true;
  if (rol === 'auditado' && before) return auditadoOnlyChangedResponses(before, after);
  return false;
}

export function summarizeCaseChange(before: Caso | null, after: Caso) {
  if (!before) return `Creacion de expediente ${after.numero}`;

  const parts: string[] = [];
  if (before.evidencias.length !== after.evidencias.length) parts.push('evidencias');
  if (before.hallazgos.length !== after.hallazgos.length) parts.push('hallazgos');
  if (before.respuestasAuditado.length !== after.respuestasAuditado.length) parts.push('respuestas');
  if (before.nodosTablero.length !== after.nodosTablero.length || before.conexionesTablero.length !== after.conexionesTablero.length) {
    parts.push('tablero');
  }
  if (before.timeline.length !== after.timeline.length) parts.push('linea de tiempo');

  return parts.length > 0
    ? `Actualizacion de ${parts.join(', ')}`
    : `Actualizacion del expediente ${after.numero}`;
}
