import type { Criterio } from './types';

export const criteriosCobit: Criterio[] = [
  // EDM - Evaluate, Direct and Monitor
  {
    id: 'COBIT-EDM01',
    marco: 'COBIT',
    dominio: 'EDM',
    codigo: 'EDM01',
    nombre: 'Asegurar el establecimiento y mantenimiento del marco de gobierno',
    descripcion: 'Analizar y articular los requisitos de gobierno corporativo de TI, implementar y mantener estructuras, procesos y prácticas que permitan el gobierno efectivo.',
  },
  {
    id: 'COBIT-EDM03',
    marco: 'COBIT',
    dominio: 'EDM',
    codigo: 'EDM03',
    nombre: 'Asegurar la optimización del riesgo',
    descripcion: 'Garantizar que el apetito y la tolerancia al riesgo de la empresa sean comprendidos, articulados y comunicados, y que el riesgo en el valor de TI sea identificado y gestionado.',
  },
  // APO - Align, Plan and Organize
  {
    id: 'COBIT-APO07-01',
    marco: 'COBIT',
    dominio: 'APO',
    codigo: 'APO07.01',
    nombre: 'Mantener la dotación de personal suficiente y apropiado',
    descripcion: 'Evaluar los requisitos de personal actuales y futuros. Incluye en los roles del personal las responsabilidades de TI, continuidad y recuperación.',
  },
  {
    id: 'COBIT-APO10-03',
    marco: 'COBIT',
    dominio: 'APO',
    codigo: 'APO10.03',
    nombre: 'Gestionar el riesgo de proveedores',
    descripcion: 'Identificar y gestionar los riesgos asociados a la capacidad de los proveedores para prestar servicio de manera continua. Incluir requisitos de continuidad y SLA en contratos.',
  },
  // BAI - Build, Acquire and Implement
  {
    id: 'COBIT-BAI09-01',
    marco: 'COBIT',
    dominio: 'BAI',
    codigo: 'BAI09.01',
    nombre: 'Identificar y registrar activos actuales',
    descripcion: 'Mantener un inventario actualizado de todos los activos de TI, incluyendo propiedad, valor y criticidad para las operaciones del negocio.',
  },
  {
    id: 'COBIT-BAI09-02',
    marco: 'COBIT',
    dominio: 'BAI',
    codigo: 'BAI09.02',
    nombre: 'Gestionar los activos críticos',
    descripcion: 'Garantizar que los activos que proporcionan una capacidad crítica cuenten con una atención especial para la vigilancia y supervisión del cumplimiento de requisitos.',
  },
  // DSS - Deliver, Service and Support
  {
    id: 'COBIT-DSS04-03',
    marco: 'COBIT',
    dominio: 'DSS',
    codigo: 'DSS04.03',
    nombre: 'Desarrollar e implementar una respuesta a la continuidad del negocio',
    descripcion: 'Desarrollar un plan de continuidad de negocio (BCP) basado en los resultados del análisis de impacto, probarlo periódicamente y actualizar según resultados.',
  },
  {
    id: 'COBIT-DSS04-07',
    marco: 'COBIT',
    dominio: 'DSS',
    codigo: 'DSS04.07',
    nombre: 'Gestionar acuerdos de respaldo',
    descripcion: 'Mantener disponibilidad de la información del negocio mediante procedimientos de respaldo y recuperación fiables. Verificar la integridad y usabilidad de los respaldos periódicamente.',
  },
  // MEA - Monitor, Evaluate and Assess
  {
    id: 'COBIT-MEA02',
    marco: 'COBIT',
    dominio: 'MEA',
    codigo: 'MEA02',
    nombre: 'Gestionar el sistema de control interno',
    descripcion: 'Mantener y evaluar continuamente el entorno de control interno, incluyendo actividades de autogestión y auditorías del sistema de control.',
  },
];

export const criteriosCoso: Criterio[] = [
  // Componente 1: Entorno de Control
  {
    id: 'COSO-AC1',
    marco: 'COSO',
    dominio: 'Ambiente de Control',
    codigo: 'AC.1',
    nombre: 'La organización demuestra compromiso con la integridad y los valores éticos',
    descripcion: 'Existencia de un código de conducta, políticas y procedimientos que reflejan los valores éticos de la organización y su aplicación en TI.',
  },
  {
    id: 'COSO-AC4',
    marco: 'COSO',
    dominio: 'Ambiente de Control',
    codigo: 'AC.4',
    nombre: 'La organización demuestra compromiso para reclutar, desarrollar y retener individuos competentes',
    descripcion: 'Políticas y prácticas de recursos humanos que garantizan la competencia del personal de TI, incluidos roles de continuidad y recuperación.',
  },
  // Componente 2: Evaluación de Riesgos
  {
    id: 'COSO-ER2',
    marco: 'COSO',
    dominio: 'Evaluación de Riesgos',
    codigo: 'ER.2',
    nombre: 'La organización identifica los riesgos para el logro de sus objetivos',
    descripcion: 'Proceso formal de identificación de riesgos de TI, incluyendo riesgos de continuidad operativa, proveedores y pérdida de datos.',
  },
  {
    id: 'COSO-ER4',
    marco: 'COSO',
    dominio: 'Evaluación de Riesgos',
    codigo: 'ER.4',
    nombre: 'La organización considera la posibilidad de fraude al evaluar los riesgos',
    descripcion: 'Evaluación explícita de riesgos de fraude relacionados con sistemas TI en el proceso de evaluación de riesgos.',
  },
  // Componente 3: Actividades de Control
  {
    id: 'COSO-AC3-1',
    marco: 'COSO',
    dominio: 'Actividades de Control',
    codigo: 'ACT.1',
    nombre: 'La organización selecciona y desarrolla actividades de control',
    descripcion: 'Definición de controles generales de TI y controles de aplicaciones que mitiguen los riesgos identificados en la evaluación de riesgos.',
  },
  // Componente 4: Información y Comunicación
  {
    id: 'COSO-IC3',
    marco: 'COSO',
    dominio: 'Información y Comunicación',
    codigo: 'IC.3',
    nombre: 'La organización comunica con partes externas sobre asuntos que afectan el funcionamiento del control interno',
    descripcion: 'Existencia de canales de comunicación formal con partes externas relevantes, incluyendo comités y organismos de gobierno de TI. Documentación de acuerdos y actas.',
  },
  // Componente 5: Actividades de Supervisión
  {
    id: 'COSO-MON1',
    marco: 'COSO',
    dominio: 'Supervisión y Monitoreo',
    codigo: 'MON.1',
    nombre: 'La organización selecciona, desarrolla y realiza evaluaciones continuas',
    descripcion: 'Evaluaciones periódicas (continuas o independientes) del sistema de control interno de TI, incluyendo revisiones de continuidad, respaldos y controles críticos.',
  },
];

export const criteriosRgsi: Criterio[] = [
  {
    id: 'RGSI-ART12',
    marco: 'RGSI',
    dominio: 'Gobierno de TI',
    codigo: 'Art. 12',
    nombre: 'Comité de TI y gobierno de sistemas de información',
    descripcion: 'Las instituciones financieras deben contar con un Comité de Tecnología que sesione periódicamente y documente formalmente sus acuerdos, decisiones y seguimiento.',
  },
  {
    id: 'RGSI-ART25',
    marco: 'RGSI',
    dominio: 'Planificación de TI',
    codigo: 'Art. 25',
    nombre: 'Plan estratégico de tecnología de la información',
    descripcion: 'Existencia de un plan estratégico de TI alineado con el plan de negocio, aprobado por la alta dirección y revisado periódicamente.',
  },
  {
    id: 'RGSI-ART47',
    marco: 'RGSI',
    dominio: 'Continuidad Operativa',
    codigo: 'Art. 47',
    nombre: 'Plan de continuidad del negocio y recuperación ante desastres',
    descripcion: 'Las instituciones deben mantener un BCP y DRP actualizados, aprobados por la alta dirección y probados al menos una vez al año mediante ejercicios documentados.',
  },
  {
    id: 'RGSI-ART51',
    marco: 'RGSI',
    dominio: 'Continuidad Operativa',
    codigo: 'Art. 51',
    nombre: 'Respaldos de información',
    descripcion: 'Los respaldos de información crítica deben realizarse según procedimientos formales, incluyendo verificación de integridad, almacenamiento seguro y pruebas periódicas de restauración.',
  },
  {
    id: 'RGSI-ART58',
    marco: 'RGSI',
    dominio: 'Gestión de Proveedores',
    codigo: 'Art. 58',
    nombre: 'Contratos con proveedores de servicios tecnológicos críticos',
    descripcion: 'Los contratos con proveedores de servicios TI críticos deben incluir niveles de servicio (SLA), cláusulas de continuidad, procedimientos de notificación de incidentes y derechos de auditoría.',
  },
  {
    id: 'RGSI-ART63',
    marco: 'RGSI',
    dominio: 'Gestión de Proveedores',
    codigo: 'Art. 63',
    nombre: 'Monitoreo y evaluación de proveedores',
    descripcion: 'Las instituciones deben monitorear periódicamente el desempeño de proveedores críticos contra los niveles de servicio acordados y mantener un registro de incidentes.',
  },
  {
    id: 'RGSI-ART72',
    marco: 'RGSI',
    dominio: 'Auditoría Interna de TI',
    codigo: 'Art. 72',
    nombre: 'Auditoría interna de tecnología de la información',
    descripcion: 'Existencia de un área o función de auditoría interna con capacidad para evaluar los controles de TI, incluidas pruebas periódicas de continuidad y seguridad.',
  },
];

export const todosLosCriterios: Criterio[] = [
  ...criteriosCobit,
  ...criteriosCoso,
  ...criteriosRgsi,
];

export function getCriterioById(id: string): Criterio | undefined {
  return todosLosCriterios.find(c => c.id === id);
}

export function getCriteriosByMarco(marco: string): Criterio[] {
  return todosLosCriterios.filter(c => c.marco === marco);
}
