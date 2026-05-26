import { describe, expect, it } from 'vitest';
import { todosLosCriterios } from '@/lib/frameworks';
import { caso2026014 } from '@/lib/mock-data';
import { calculateRiskLevel, calculateSeveridad } from '@/lib/risk';

const allowedCobit = ['PO1', 'PO2', 'PO3', 'PO4', 'PO7', 'ME2'];

describe('caso demo academico', () => {
  it('usa los marcos requeridos por la consigna', () => {
    const criterios = todosLosCriterios.map(criterio => criterio.codigo);

    expect(allowedCobit.every(code => criterios.includes(code))).toBe(true);
    expect(criterios).not.toContain('APO');
    expect(criterios).not.toContain('DSS');
    expect(criterios).not.toContain('MEA');
    expect(criterios).toEqual(expect.arrayContaining(['Ambiente de control', 'Evaluacion de riesgos', 'Actividades de control']));
    expect(criterios).toEqual(expect.arrayContaining(['Seccion 2', 'Seccion 6', 'Seccion 11', 'Seccion 12']));
  });

  it('mantiene hallazgos completos y riesgo calculable', () => {
    for (const hallazgo of caso2026014.hallazgos) {
      expect(hallazgo.numero).toMatch(/^H-\d{3}$/);
      expect(hallazgo.titulo).toBeTruthy();
      expect(hallazgo.condicion).toBeTruthy();
      expect(hallazgo.criterio).toBeTruthy();
      expect(hallazgo.causa).toBeTruthy();
      expect(hallazgo.efecto).toBeTruthy();
      expect(hallazgo.conclusion).toBeTruthy();
      expect(hallazgo.recomendacion).toBeTruthy();
      expect(hallazgo.evidencias.length).toBeGreaterThan(0);
      expect(hallazgo.nivelRiesgo).toBe(calculateRiskLevel(hallazgo.probabilidad, hallazgo.impacto));
      expect(hallazgo.severidad).toBe(calculateSeveridad(hallazgo.probabilidad, hallazgo.impacto));
    }
  });

  it('no deja relaciones rotas entre evidencias, hallazgos y tablero', () => {
    const evidenciaIds = new Set(caso2026014.evidencias.map(evidencia => evidencia.id));
    const hallazgoIds = new Set(caso2026014.hallazgos.map(hallazgo => hallazgo.id));
    const criterioIds = new Set(todosLosCriterios.map(criterio => criterio.id));
    const nodeIds = new Set(caso2026014.nodosTablero.map(nodo => nodo.id));

    for (const hallazgo of caso2026014.hallazgos) {
      expect(hallazgo.evidencias.every(id => evidenciaIds.has(id))).toBe(true);
      expect(hallazgo.criterios.every(id => criterioIds.has(id))).toBe(true);
    }

    for (const evidencia of caso2026014.evidencias) {
      expect((evidencia.hallazgos ?? []).every(id => hallazgoIds.has(id))).toBe(true);
      expect((evidencia.criterios ?? []).every(id => criterioIds.has(id))).toBe(true);
    }

    for (const conexion of caso2026014.conexionesTablero) {
      expect(nodeIds.has(conexion.desde)).toBe(true);
      expect(nodeIds.has(conexion.hacia)).toBe(true);
      expect(conexion.desde).not.toBe(conexion.hacia);
    }
  });
});
