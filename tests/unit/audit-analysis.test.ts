import { describe, expect, it } from 'vitest';
import {
  calculateFindingSupport,
  calculateFrameworkCoverage,
  calculateTopologicalImpact,
  buildRelationReasoningLog,
  detectTraceabilityGaps,
  generateAssistedFindingDraft,
} from '@/lib/audit-analysis';
import { caso2026014 } from '@/lib/mock-data';
import type { Caso } from '@/lib/types';

function cloneCase(caso: Caso): Caso {
  return JSON.parse(JSON.stringify(caso)) as Caso;
}

describe('motor de aseguramiento del expediente', () => {
  it('calcula semaforo de sustentacion sin persistir datos derivados', () => {
    const hallazgo = caso2026014.hallazgos.find(item => item.id === 'H-002');
    expect(hallazgo).toBeDefined();

    const support = calculateFindingSupport(caso2026014, hallazgo!);
    expect(support.score).toBeGreaterThanOrEqual(90);
    expect(support.status).toBe('defendible');
    expect(support.missingItems).toHaveLength(0);
  });

  it('marca como debil un hallazgo incompleto', () => {
    const caso = cloneCase(caso2026014);
    const hallazgo = {
      ...caso.hallazgos[0],
      id: 'H-999',
      numero: 'H-999',
      titulo: 'Hallazgo incompleto',
      condicion: '',
      criterio: '',
      causa: '',
      efecto: '',
      conclusion: '',
      recomendacion: '',
      criterios: [],
      evidencias: [],
      respuestasAuditado: [],
      respuestaBanco: null,
      estadoRespuesta: 'pendiente' as const,
    };

    const support = calculateFindingSupport(caso, hallazgo);
    expect(support.status).toBe('debil');
    expect(support.missingItems.map(item => item.id)).toEqual(expect.arrayContaining(['condicion', 'criterio', 'evidencias', 'recomendacion']));
  });

  it('detecta huecos de trazabilidad y relaciones sin justificacion', () => {
    const gaps = detectTraceabilityGaps(caso2026014);

    expect(gaps.some(gap => gap.criterioId === 'RGSI-S12' && gap.id.includes('sin-hallazgo'))).toBe(true);
    expect(gaps.some(gap => gap.conexionId === 'C-001' && gap.id.endsWith('sin-justificacion'))).toBe(true);
    expect(gaps.some(gap => gap.hallazgoId === 'H-001' && gap.id.includes('sin-respuesta'))).toBe(true);
  });

  it('calcula cobertura normativa por criterio', () => {
    const coverage = calculateFrameworkCoverage(caso2026014);
    const rgsi12 = coverage.items.find(item => item.criterio.id === 'RGSI-S12');
    const rgsi6 = coverage.items.find(item => item.criterio.id === 'RGSI-S6');

    expect(coverage.summary.total).toBeGreaterThan(0);
    expect(rgsi12?.status).toBe('sin-cubrir');
    expect(rgsi6?.hallazgos.length).toBeGreaterThan(0);
    expect(rgsi6?.evidencias.length).toBeGreaterThan(0);
  });

  it('calcula impacto topologico explicable', () => {
    const topology = calculateTopologicalImpact(caso2026014);

    expect(topology.highImpactNodes.length).toBeGreaterThan(0);
    expect(topology.nodes[0].reasons.join(' ')).toMatch(/Conecta|Relaciona|Afecta/);
    expect(topology.evidenceMultiFinding.some(item => item.evidencia.id === 'EVD-013')).toBe(true);
  });

  it('consolida bitacora de razonamiento de conexiones', () => {
    const caso = cloneCase(caso2026014);
    caso.conexionesTablero = caso.conexionesTablero.map(connection => connection.id === 'C-001'
      ? {
          ...connection,
          estado: 'validada',
          reasoningLog: [
            {
              id: 'C-001-LOG-001',
              fecha: '2026-04-01T10:30:00.000Z',
              accion: 'validada',
              detalle: 'La evidencia sustenta el hallazgo por la politica formal revisada.',
              usuarioRol: 'auditor',
            },
          ],
        }
      : connection.id === 'C-002'
        ? {
            ...connection,
            justificacion: 'Justificacion migrada sin historial previo.',
            updatedAt: '2026-04-02T10:30:00.000Z',
          }
      : connection);

    const log = buildRelationReasoningLog(caso);

    expect(log).toHaveLength(2);
    expect(log[0].connection.id).toBe('C-002');
    expect(log[0].detalle).toContain('migrada');
    expect(log[1].connection.id).toBe('C-001');
    expect(log[1].sourceLabel).toContain('EVD-001');
    expect(log[0].targetLabel).toContain('H-001');
    expect(log[1].detalle).toContain('sustenta');
  });

  it('genera borrador asistido por reglas locales', () => {
    const draft = generateAssistedFindingDraft(
      'Se revisaron los registros de respaldo y no existe evidencia de pruebas periodicas de restauracion.',
      caso2026014,
    );

    const criteriaSuggestion = draft.suggestions.find(item => item.field === 'criterios');
    expect(draft.matchedRules).toContain('backup-restauracion');
    expect(criteriaSuggestion?.value).toContain('RGSI-S6');
    expect(draft.disclaimer).toContain('no reemplaza');
  });
});
