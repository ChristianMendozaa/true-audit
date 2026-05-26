import { describe, expect, it } from 'vitest';
import { canRolePersistCaseChange, summarizeCaseChange } from '@/lib/cases/change-policy';
import { caso2026014 } from '@/lib/mock-data';
import type { Caso } from '@/lib/types';

function cloneCase(): Caso {
  return JSON.parse(JSON.stringify(caso2026014)) as Caso;
}

describe('politica de cambios por rol', () => {
  it('permite al auditor guardar cambios amplios del expediente', () => {
    const before = cloneCase();
    const after = { ...before, titulo: 'Titulo actualizado' };

    expect(canRolePersistCaseChange('auditor', before, after)).toBe(true);
    expect(canRolePersistCaseChange('auditor_lider', before, after)).toBe(true);
  });

  it('permite al auditado agregar una respuesta sin tocar evidencias o criterios', () => {
    const before = cloneCase();
    const after = cloneCase();
    after.respuestasAuditado = [
      ...after.respuestasAuditado,
      {
        id: 'RSP-TST',
        hallazgoId: after.hallazgos[0].id,
        fecha: '2026-05-26',
        postura: 'acepta-parcialmente',
        argumento: 'El banco presenta descargo parcial.',
        comentarioAuditor: '',
        decisionAuditor: 'pendiente',
      },
    ];
    after.hallazgos = after.hallazgos.map(hallazgo => hallazgo.id === after.hallazgos[0].id
      ? {
        ...hallazgo,
        respuestaBanco: 'El banco presenta descargo parcial.',
        estadoRespuesta: 'parcial',
        estado: 'respondido',
        respuestasAuditado: [...(hallazgo.respuestasAuditado ?? []), 'RSP-TST'],
      }
      : hallazgo);
    after.timeline = [
      ...after.timeline,
      {
        id: 'EVT-TST',
        tipo: 'respuesta-banco',
        fecha: '2026-05-26',
        titulo: 'Respuesta del auditado RSP-TST',
        descripcion: 'El banco presenta descargo parcial.',
        hallazgosVinculados: [after.hallazgos[0].id],
        respuestasVinculadas: ['RSP-TST'],
      },
    ];

    expect(canRolePersistCaseChange('auditado', before, after)).toBe(true);
  });

  it('bloquea al auditado si modifica hallazgos sustantivos', () => {
    const before = cloneCase();
    const after = cloneCase();
    after.hallazgos[0] = {
      ...after.hallazgos[0],
      condicion: 'Condicion alterada por el auditado',
    };

    expect(canRolePersistCaseChange('auditado', before, after)).toBe(false);
  });

  it('resume cambios principales para auditoria', () => {
    const before = cloneCase();
    const after = cloneCase();
    after.evidencias = after.evidencias.slice(1);
    after.hallazgos = after.hallazgos.slice(1);

    expect(summarizeCaseChange(before, after)).toContain('evidencias');
    expect(summarizeCaseChange(before, after)).toContain('hallazgos');
  });
});
