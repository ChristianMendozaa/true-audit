import ExcelJS from 'exceljs';
import type { Caso } from '@/lib/types';
import { findingCriteriaText, findingEvidenceText, findingResponseText } from './report-data';

const widths = [4, 30, 9, 7, 8, 9, 36, 36, 31, 4, 4, 9, 13, 32];

export async function renderMatrizCobitXlsx(caso: Caso): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'True Audit';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Grupo N', {
    pageSetup: { paperSize: 9 as ExcelJS.PaperSize, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ state: 'frozen', ySplit: 7 }],
  });

  sheet.columns = widths.map(width => ({ width }));
  sheet.getColumn('B').alignment = { wrapText: true, vertical: 'top' };
  for (const column of ['G', 'H', 'I', 'N']) {
    sheet.getColumn(column).alignment = { wrapText: true, vertical: 'top' };
  }

  sheet.mergeCells('C2:F2');
  sheet.mergeCells('C3:F3');
  sheet.mergeCells('G4:N4');
  sheet.mergeCells('G5:N5');
  sheet.mergeCells('B7:F7');

  sheet.getCell('B1').value = 'GRUPO No:';
  sheet.getCell('C1').value = 'Grupo True Audit';
  sheet.getCell('B2').value = 'Nombres y Apellidos:';
  sheet.getCell('C2').value = caso.auditores.map(auditor => auditor.nombre).join(', ');
  sheet.getCell('B3').value = 'Alcance:';
  sheet.getCell('C3').value = caso.alcance;
  sheet.getCell('G4').value = 'EVALUACIÓN DE RIESGOS - MATRIZ DE HALLAZGOS DE AUDITORÍA INFORMÁTICA';
  sheet.getCell('G5').value = 'Documento generado por True Audit a partir del expediente editable del caso. La matriz conserva fórmulas para riesgo y nivel de riesgo.';

  for (const rowNumber of [1, 2, 3]) {
    sheet.getRow(rowNumber).height = rowNumber === 3 ? 42 : 22;
    sheet.getCell(`B${rowNumber}`).font = { bold: true, size: 11, color: { argb: 'FF1A1814' } };
    sheet.getCell(`C${rowNumber}`).font = { size: 11, color: { argb: 'FF1A1814' } };
    sheet.getCell(`B${rowNumber}`).alignment = { wrapText: true, vertical: 'middle' };
    sheet.getCell(`C${rowNumber}`).alignment = { wrapText: true, vertical: 'middle' };
  }

  sheet.getRow(4).height = 28;
  sheet.getCell('G4').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('G4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1814' } };
  sheet.getCell('G4').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(5).height = 24;
  sheet.getCell('G5').font = { italic: true, size: 9, color: { argb: 'FF5F584D' } };
  sheet.getCell('G5').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  const headers = [
    'No.',
    'HALLAZGO',
    '',
    '',
    '',
    '',
    'CRITERIO',
    'CAUSA / EFECTO',
    'CONCLUSIÓN',
    'P',
    'I',
    'RIESGO',
    'NIVEL RIESGO',
    'RECOMENDACIÓN',
  ];
  sheet.getRow(7).values = headers;
  sheet.getRow(7).height = 34;

  for (let col = 1; col <= 14; col += 1) {
    const cell = sheet.getRow(7).getCell(col);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3D3830' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = border('FF766E61');
  }

  const findings = caso.hallazgos.filter(hallazgo => !hallazgo.descartado);
  findings.forEach((hallazgo, index) => {
    const rowNumber = 8 + index;
    sheet.mergeCells(`B${rowNumber}:F${rowNumber}`);
    const row = sheet.getRow(rowNumber);
    row.height = 78;
    row.getCell('A').value = index + 1;
    row.getCell('B').value = `${hallazgo.numero} - ${hallazgo.titulo}\n${hallazgo.condicion}`;
    row.getCell('B').note = `Evidencias asociadas: ${findingEvidenceText(caso, hallazgo)}\nRespuesta del auditado: ${findingResponseText(caso, hallazgo)}`;
    row.getCell('G').value = `${findingCriteriaText(hallazgo)}\n${hallazgo.criterio}`;
    row.getCell('H').value = `Causa: ${hallazgo.causa}\nEfecto: ${hallazgo.efecto}`;
    row.getCell('I').value = hallazgo.conclusion;
    row.getCell('J').value = hallazgo.probabilidad;
    row.getCell('K').value = hallazgo.impacto;
    row.getCell('L').value = { formula: `J${rowNumber}*K${rowNumber}` };
    row.getCell('M').value = {
      formula: `IF(L${rowNumber}<=2,"Muy Bajo",IF(AND(L${rowNumber}>=3,L${rowNumber}<=4),"Bajo",IF(AND(L${rowNumber}>=5,L${rowNumber}<=9),"Medio",IF(AND(L${rowNumber}>9,L${rowNumber}<20),"Alto",IF(L${rowNumber}>=20,"Extremo","Valores errados")))))`,
    };
    row.getCell('N').value = hallazgo.recomendacion;

    for (let col = 1; col <= 14; col += 1) {
      const cell = row.getCell(col);
      cell.border = border('FFC9C0AE');
      cell.alignment = {
        vertical: 'top',
        horizontal: col >= 10 && col <= 13 ? 'center' : 'left',
        wrapText: true,
      };
      if (col === 12 || col === 13) {
        cell.font = { bold: true };
      }
    }
  });

  const noteRow = 9 + findings.length;
  sheet.mergeCells(`A${noteRow}:N${noteRow}`);
  sheet.getCell(`A${noteRow}`).value = 'Nota: La columna RIESGO se calcula como Probabilidad por Impacto. El nivel se clasifica mediante formula IF con rangos Muy Bajo, Bajo, Medio, Alto y Extremo.';
  sheet.getCell(`A${noteRow}`).alignment = { wrapText: true, vertical: 'middle' };
  sheet.getCell(`A${noteRow}`).font = { italic: true, color: { argb: 'FF5F584D' } };
  sheet.getRow(noteRow).height = 30;

  sheet.autoFilter = { from: 'A7', to: `N${7 + findings.length}` };
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function border(argb: string): Partial<ExcelJS.Borders> {
  return {
    top: { style: 'thin', color: { argb } },
    left: { style: 'thin', color: { argb } },
    bottom: { style: 'thin', color: { argb } },
    right: { style: 'thin', color: { argb } },
  };
}
