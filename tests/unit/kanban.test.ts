import { describe, expect, it } from 'vitest';
import { caso2026014 } from '@/lib/mock-data';
import {
  buildKanbanItems,
  evidenceColumn,
  evidenceStatusForColumn,
  findingColumn,
  findingStatusForColumn,
} from '@/lib/kanban';

describe('kanban del caso', () => {
  it('mapea evidencias, hallazgos y respuestas a columnas operativas', () => {
    expect(evidenceColumn('pendiente')).toBe('entrada-documental');
    expect(evidenceColumn('observado')).toBe('observado');
    expect(findingColumn('pendiente-respuesta')).toBe('pendiente-respuesta');
    expect(findingColumn('respondido')).toBe('respondido');

    const items = buildKanbanItems(caso2026014);
    expect(items.some(item => item.id === 'evidencia:EVD-001')).toBe(true);
    expect(items.some(item => item.id === 'hallazgo:H-001')).toBe(true);
    expect(items.some(item => item.id === 'respuesta:RSP-002' && item.locked)).toBe(true);
  });

  it('traduce movimientos del tablero a estados editables', () => {
    expect(evidenceStatusForColumn('cerrado-descartado')).toBe('descartada');
    expect(evidenceStatusForColumn('en-revision')).toBe('revisado');
    expect(findingStatusForColumn('entrada-documental')).toBe('abierto');
    expect(findingStatusForColumn('cerrado-descartado')).toBe('cerrado');
  });
});
