import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { POST as postFichas } from '@/app/api/casos/[caseId]/exports/fichas-hallazgo/route';
import { POST as postInforme } from '@/app/api/casos/[caseId]/exports/informe-final/route';
import { POST as postMatriz } from '@/app/api/casos/[caseId]/exports/matriz-cobit/route';
import { renderMatrizCobitXlsx } from '@/lib/exports/matriz-cobit';
import { caso2026014 } from '@/lib/mock-data';

function exportRequest() {
  return new Request('http://localhost/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caso: caso2026014 }),
  });
}

function context() {
  return { params: Promise.resolve({ caseId: caso2026014.id }) };
}

describe('exportes academicos', () => {
  it('los endpoints devuelven content-types descargables', async () => {
    const informe = await postInforme(exportRequest(), context());
    expect(informe.headers.get('content-type')).toBe('application/pdf');
    expect((await informe.arrayBuffer()).byteLength).toBeGreaterThan(1000);

    const fichas = await postFichas(exportRequest(), context());
    expect(fichas.headers.get('content-type')).toBe('application/pdf');
    expect((await fichas.arrayBuffer()).byteLength).toBeGreaterThan(1000);

    const matriz = await postMatriz(exportRequest(), context());
    expect(matriz.headers.get('content-type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect((await matriz.arrayBuffer()).byteLength).toBeGreaterThan(1000);
  });

  it('la matriz COBIT conserva encabezados, merges y formulas de riesgo', async () => {
    const buffer = await renderMatrizCobitXlsx(caso2026014);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Grupo N');

    expect(sheet).toBeDefined();
    expect(sheet?.getCell('G4').value).toBe('EVALUACIÓN DE RIESGOS - MATRIZ DE HALLAZGOS DE AUDITORÍA INFORMÁTICA');
    expect(sheet?.getCell('B1').value).toBe('GRUPO No:');
    expect(sheet?.getCell('B7').value).toBe('HALLAZGO');
    expect(sheet?.getCell('G7').value).toBe('CRITERIO');
    expect(sheet?.getCell('L8').formula).toBe('J8*K8');
    expect(sheet?.getCell('M8').formula).toContain('IF(L8<=2');
    expect(sheet?.getCell('B8').isMerged).toBe(true);
    expect(sheet?.getCell('B8').note).toContain('Evidencias asociadas');
  });
});
