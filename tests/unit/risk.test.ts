import { describe, expect, it } from 'vitest';
import { calculateRiskLevel, calculateRiskScore, calculateSeveridad, riskLevelToSeveridad } from '@/lib/risk';

describe('risk helpers', () => {
  it('calcula el puntaje con probabilidad por impacto', () => {
    expect(calculateRiskScore(4, 5)).toBe(20);
    expect(calculateRiskScore(2, 3)).toBe(6);
  });

  it('normaliza valores fuera de escala 1..5', () => {
    expect(calculateRiskScore(0, 8)).toBe(5);
    expect(calculateRiskScore(Number.NaN, 2)).toBe(2);
  });

  it('clasifica nivel y severidad para los sellos visuales', () => {
    expect(calculateRiskLevel(5, 4)).toBe('alto');
    expect(calculateRiskLevel(3, 3)).toBe('medio');
    expect(calculateRiskLevel(1, 4)).toBe('bajo');
    expect(riskLevelToSeveridad('alto')).toBe('critico');
    expect(calculateSeveridad(3, 3)).toBe('medio');
  });
});
