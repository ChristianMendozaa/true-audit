import type { NivelRiesgo, Severidad } from './types';

export function calculateRiskScore(probabilidad: number, impacto: number): number {
  const p = Math.min(Math.max(Number(probabilidad) || 1, 1), 5);
  const i = Math.min(Math.max(Number(impacto) || 1, 1), 5);
  return p * i;
}

export function calculateRiskLevel(probabilidad: number, impacto: number): NivelRiesgo {
  const score = calculateRiskScore(probabilidad, impacto);
  if (score >= 15) return 'alto';
  if (score >= 7) return 'medio';
  return 'bajo';
}

export function riskLevelToSeveridad(level: NivelRiesgo): Severidad {
  if (level === 'alto') return 'critico';
  if (level === 'medio') return 'medio';
  return 'bajo';
}

export function calculateSeveridad(probabilidad: number, impacto: number): Severidad {
  return riskLevelToSeveridad(calculateRiskLevel(probabilidad, impacto));
}
