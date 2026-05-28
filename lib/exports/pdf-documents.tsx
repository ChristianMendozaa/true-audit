import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { Caso, Hallazgo } from '@/lib/types';
import { assuranceSummaryText, finalConclusion, findingCriteriaText, findingEvidenceText, findingResponseText, findingSupportText, relationReasoningText } from './report-data';

const spanishMonths = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingRight: 42,
    paddingBottom: 38,
    paddingLeft: 42,
    backgroundColor: '#F7F2E8',
    color: '#1A1814',
    fontFamily: 'Helvetica',
    fontSize: 9.6,
    lineHeight: 1.42,
  },
  title: {
    fontSize: 23,
    fontWeight: 700,
    marginBottom: 5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#5F584D',
    textAlign: 'center',
    marginBottom: 18,
    textTransform: 'uppercase',
  },
  caseNumber: {
    fontSize: 10,
    color: '#B88A1C',
    textAlign: 'center',
    marginBottom: 18,
    textTransform: 'uppercase',
  },
  coverLine: {
    marginBottom: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#8E7D5A',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: 9,
    color: '#3D3830',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#8E7D5A',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  metaTable: {
    borderWidth: 1,
    borderColor: '#766E61',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C9C0AE',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  labelCell: {
    width: '32%',
    padding: 5,
    backgroundColor: '#E6DDCB',
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  valueCell: {
    width: '68%',
    padding: 5,
  },
  findingBox: {
    marginTop: 9,
    borderLeftWidth: 3,
    borderLeftColor: '#C8412C',
    paddingLeft: 8,
    paddingBottom: 6,
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 5,
  },
  riskLine: {
    marginTop: 3,
    marginBottom: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: '#B88A1C',
    backgroundColor: '#F1E7D1',
    fontSize: 8.6,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#6B6358',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  fieldText: {
    marginTop: 1,
    marginBottom: 2,
  },
  signatureTable: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#766E61',
  },
  signatureCell: {
    flex: 1,
    padding: 8,
    minHeight: 45,
    borderRightWidth: 1,
    borderRightColor: '#C9C0AE',
  },
  cardTable: {
    borderWidth: 1,
    borderColor: '#5F584D',
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    backgroundColor: '#D8D0BE',
    borderBottomWidth: 1,
    borderBottomColor: '#5F584D',
  },
  cardHeaderCell: {
    width: '76%',
    padding: 6,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  cardCode: {
    width: '24%',
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#5F584D',
    textAlign: 'center',
    fontWeight: 700,
  },
  cardLabel: {
    width: '26%',
    padding: 6,
    backgroundColor: '#E9E1D0',
    borderRightWidth: 1,
    borderRightColor: '#C9C0AE',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  cardValue: {
    width: '74%',
    padding: 6,
  },
  cardSectionLabel: {
    padding: 5,
    backgroundColor: '#D8D0BE',
    borderBottomWidth: 1,
    borderBottomColor: '#5F584D',
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 42,
    right: 42,
    bottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#C9C0AE',
    paddingTop: 4,
    color: '#766E61',
    fontSize: 7,
    textAlign: 'center',
  },
});

function monthYear(value?: string) {
  if (!value) return 'Mayo 2026';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${spanishMonths[date.getMonth()]} ${date.getFullYear()}`;
}

function cobitDomain(hallazgo: Hallazgo) {
  const process = hallazgo.procesoCobit ?? findingCriteriaText(hallazgo);
  if (process.includes('ME')) return 'Monitorear y Evaluar (ME)';
  if (process.includes('PO')) return 'Planeación y Organización (PO)';
  return 'COBIT / COSO / RGSI';
}

function controlObjective(hallazgo: Hallazgo) {
  return [hallazgo.componenteCoso, hallazgo.seccionRgsi].filter(Boolean).join(' / ') || hallazgo.criterio;
}

function riskScore(hallazgo: Hallazgo) {
  return hallazgo.probabilidad * hallazgo.impacto;
}

function Footer({ caso }: { caso: Caso }) {
  return (
    <Text style={styles.footer} fixed>
      True Audit - Expediente {caso.numero} - {caso.banco}
    </Text>
  );
}

function MetaRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? [styles.row, styles.lastRow] : styles.row}>
      <Text style={styles.labelCell}>{label}</Text>
      <Text style={styles.valueCell}>{value}</Text>
    </View>
  );
}

function FindingField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldText}>{String(value ?? '')}</Text>
    </View>
  );
}

function InformeFinalPdf({ caso }: { caso: Caso }) {
  return (
    <Document title={`Informe Final ${caso.numero}`} author="True Audit">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Informe Final</Text>
        <Text style={styles.subtitle}>Auditoría de Sistemas - True Audit</Text>
        <Text style={styles.caseNumber}>Expediente {caso.numero}</Text>
        <Text style={styles.coverLine}>Para: {caso.banco}</Text>

        <View style={styles.metaTable}>
          <MetaRow label="Líder de Auditoría" value={caso.auditores[0]?.nombre ?? 'Equipo auditor'} />
          <MetaRow label="Auditor de Sistemas" value={caso.auditores[1]?.nombre ?? 'Equipo auditor'} />
          <MetaRow label="Objetivo" value={caso.objetivo} />
          <MetaRow label="Tipo de Informe" value="Final" />
          <MetaRow label="Periodo auditado" value={caso.periodo} />
          <MetaRow label="Fecha de apertura" value={monthYear(caso.fechaInicio)} />
          <MetaRow label="Fecha de presentación" value={monthYear(caso.fechaCierre ?? caso.fechaInicio)} last />
        </View>

        <Text style={styles.sectionTitle}>I. Alcance</Text>
        <Text style={styles.paragraph}>{caso.alcance}</Text>

        <Text style={styles.sectionTitle}>II. Metodología de Evaluación</Text>
        <Text style={styles.paragraph}>{caso.metodologia}</Text>

        <Text style={styles.sectionTitle}>III. Aspectos Relevantes</Text>
        <Text style={styles.paragraph}>
          Se registraron {caso.evidencias.length} evidencias, {caso.hallazgos.length} hallazgos y {caso.respuestasAuditado.length} respuestas del auditado. La evaluación se sustenta en COBIT, COSO y RGSI.
        </Text>
        <Text style={styles.paragraph}>{assuranceSummaryText(caso)}</Text>

        <Text style={styles.sectionTitle}>IV. Hallazgos de Auditoría</Text>
        {caso.hallazgos.map((hallazgo, index) => (
          <FindingSummary key={hallazgo.id} hallazgo={hallazgo} index={index + 1} caso={caso} />
        ))}

        <Text style={styles.sectionTitle}>V. Bitacora de Razonamiento</Text>
        <Text style={styles.paragraph}>{relationReasoningText(caso)}</Text>

        <Text style={styles.sectionTitle}>VI. Conclusiones</Text>
        <Text style={styles.paragraph}>{finalConclusion(caso)}</Text>

        <View style={styles.signatureTable}>
          <View style={[styles.row, styles.lastRow]}>
            {caso.auditores.map((auditor, index) => (
              <View key={auditor.id} style={index === caso.auditores.length - 1 ? [styles.signatureCell, { borderRightWidth: 0 }] : styles.signatureCell}>
                <Text style={styles.fieldLabel}>Nombre completo</Text>
                <Text>{auditor.nombre}</Text>
                <Text style={styles.fieldLabel}>Responsabilidad</Text>
                <Text>{auditor.rol}</Text>
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Firma</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer caso={caso} />
      </Page>
    </Document>
  );
}

function FindingSummary({ hallazgo, index, caso }: { hallazgo: Hallazgo; index: number; caso: Caso }) {
  return (
    <View style={styles.findingBox} wrap={false}>
      <Text style={styles.findingTitle}>Hallazgo No. {index}: {hallazgo.titulo}</Text>
      <FindingField label="Código" value={hallazgo.numero} />
      <FindingField label="Condición" value={hallazgo.condicion} />
      <FindingField label="Criterio" value={hallazgo.criterio} />
      <FindingField label="Causa" value={hallazgo.causa} />
      <FindingField label="Efecto" value={hallazgo.efecto} />
      <FindingField label="Conclusión" value={hallazgo.conclusion} />
      <Text style={styles.riskLine}>Nivel de Riesgo: Probabilidad {hallazgo.probabilidad}; Impacto {hallazgo.impacto}; Riesgo {riskScore(hallazgo)}; Nivel {hallazgo.nivelRiesgo}</Text>
      <FindingField label="Recomendación" value={hallazgo.recomendacion} />
      <FindingField label="Evidencia documental" value={findingEvidenceText(caso, hallazgo)} />
      <FindingField label="Respuesta del auditado" value={findingResponseText(caso, hallazgo)} />
      <FindingField label="Sustentacion True Audit" value={findingSupportText(caso, hallazgo)} />
    </View>
  );
}

function CardRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.row}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{String(value ?? '')}</Text>
    </View>
  );
}

function FichasHallazgoPdf({ caso }: { caso: Caso }) {
  return (
    <Document title={`Fichas Hallazgo ${caso.numero}`} author="True Audit">
      {caso.hallazgos.map(hallazgo => (
        <Page key={hallazgo.id} size="LETTER" style={styles.page}>
          <Text style={styles.title}>Fichas de Hallazgos y Controles COBIT</Text>
          <Text style={styles.subtitle}>{caso.banco} - Expediente {caso.numero}</Text>
          <View style={styles.cardTable}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderCell}>{caso.banco} / {caso.auditores[0]?.rol ?? 'Equipo auditor'}</Text>
              <Text style={styles.cardCode}>R/PT: {hallazgo.numero.replace('H-', 'P')}</Text>
            </View>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderCell}>Hallazgos de la Auditoría</Text>
              <Text style={styles.cardCode}>{hallazgo.numero}</Text>
            </View>
            <CardRow label="Dominio" value={cobitDomain(hallazgo)} />
            <CardRow label="Proceso" value={hallazgo.procesoCobit ?? ''} />
            <CardRow label="Objetivo de Control" value={controlObjective(hallazgo)} />
            <CardRow label="Riesgos Asociados" value={hallazgo.efecto} />
            <Text style={styles.cardSectionLabel}>Descripción</Text>
            <CardRow label="Descripción" value={hallazgo.condicion} />
            <Text style={styles.cardSectionLabel}>Recomendación</Text>
            <CardRow label="Recomendación" value={hallazgo.recomendacion} />
            <CardRow label="Causa" value={hallazgo.causa} />
            <CardRow label="Pruebas / Evidencia" value={findingEvidenceText(caso, hallazgo)} />
            <CardRow label="Respuesta auditado" value={findingResponseText(caso, hallazgo)} />
            <CardRow label="Sustentacion" value={findingSupportText(caso, hallazgo)} />
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.cardLabel}>Nivel del Riesgo</Text>
              <Text style={styles.cardValue}>{hallazgo.nivelRiesgo.toUpperCase()} - Probabilidad {hallazgo.probabilidad}; Impacto {hallazgo.impacto}; Riesgo {riskScore(hallazgo)}</Text>
            </View>
          </View>
          <Footer caso={caso} />
        </Page>
      ))}
    </Document>
  );
}

export async function renderInformeFinalPdf(caso: Caso): Promise<Buffer> {
  return renderToBuffer(<InformeFinalPdf caso={caso} />);
}

export async function renderFichasHallazgoPdf(caso: Caso): Promise<Buffer> {
  return renderToBuffer(<FichasHallazgoPdf caso={caso} />);
}
