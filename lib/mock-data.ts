import type { Caso } from './types';

export const caso2026014: Caso = {
  id: '2026-014',
  numero: '2026-014',
  titulo: 'Auditoría de Continuidad Operativa de TI',
  banco: 'Banco Cordillera S.A.',
  periodo: 'Q2 2026 — Abril a Junio 2026',
  fechaInicio: '2026-03-12',
  estado: 'en-curso',
  objetivo:
    'Evaluar la suficiencia y efectividad de los controles implementados por Banco Cordillera S.A. en materia de continuidad operativa de tecnología de la información, considerando los marcos COBIT, COSO y el Reglamento de Gestión de Sistemas de Información (RGSI) del sector financiero.',
  alcance:
    'El alcance comprende los procesos de: gestión del plan de continuidad de negocio (BCP), gestión de respaldos de información crítica, contratos con proveedores de servicios cloud, gobierno del Comité TI, y gestión de activos tecnológicos críticos. Período auditado: 1 de enero de 2025 al 25 de mayo de 2026.',
  metodologia:
    'La auditoría se llevó a cabo mediante revisión documental, entrevistas con personal clave, aplicación de fichas de prueba (walkthroughs y pruebas de detalle), y validación cruzada de evidencias. Se aplicaron los marcos de referencia COBIT 2019 (dominio DSS04, APO07, BAI09, APO10), COSO 2013 (componentes Ambiente de Control, Evaluación de Riesgos, Información y Comunicación) y el Reglamento de Gestión de Sistemas de Información (RGSI), artículos 12, 47, 51 y 58.',

  auditores: [
    {
      id: 'AUD-01',
      nombre: 'Valentina Cruz',
      rol: 'Auditora Senior / Líder de Proyecto',
      email: 'v.cruz@auditoria.cl',
    },
    {
      id: 'AUD-02',
      nombre: 'Felipe Morales',
      rol: 'Auditor de Sistemas',
      email: 'f.morales@auditoria.cl',
    },
    {
      id: 'AUD-03',
      nombre: 'Andrea Riquelme',
      rol: 'Especialista en Riesgos TI',
      email: 'a.riquelme@auditoria.cl',
    },
  ],

  evidencias: [
    {
      id: 'EVD-001',
      tipo: 'documento',
      titulo: 'Política de Continuidad de Negocios v3.1',
      descripcion: 'Documento corporativo que establece el marco para la gestión de continuidad de negocios. Incluye BCP, DRP y procedimientos de activación.',
      fecha: '2025-08-14',
      fuente: 'Gerencia de Riesgos TI — Banco Cordillera',
      formato: 'PDF',
      paginas: 48,
    },
    {
      id: 'EVD-002',
      tipo: 'evidencia-tecnica',
      titulo: 'Log de ejecución de respaldos (ene 2025 — may 2026)',
      descripcion: 'Registros de ejecución de trabajos de respaldo automatizados para sistemas críticos: core bancario, base de datos de clientes y plataforma transaccional.',
      fecha: '2026-05-20',
      fuente: 'Plataforma de monitoreo — Banco Cordillera',
      formato: 'CSV',
    },
    {
      id: 'EVD-003',
      tipo: 'acta',
      titulo: 'Acta de Comité TI — Q3 2025',
      descripcion: 'Registro de la sesión del Comité de Tecnología correspondiente al tercer trimestre 2025. Formalizada con firmas.',
      fecha: '2025-09-30',
      fuente: 'Secretaría del Comité TI — Banco Cordillera',
      formato: 'PDF',
      paginas: 6,
    },
    {
      id: 'EVD-004',
      tipo: 'acta',
      titulo: 'Acta de Comité TI — Q4 2025',
      descripcion: 'Registro de sesión Q4 2025. Solo existe un borrador informal sin firmas. No cumple los procedimientos institucionales de formalización.',
      fecha: '2025-12-31',
      fuente: 'Secretaría del Comité TI — Banco Cordillera',
      formato: 'PDF',
      paginas: 3,
    },
    {
      id: 'EVD-005',
      tipo: 'contrato',
      titulo: 'Contrato de servicios cloud — AWS (vigente)',
      descripcion: 'Contrato marco de servicios Amazon Web Services para infraestructura cloud del banco. Incluye servicios EC2, S3, RDS.',
      fecha: '2024-01-15',
      fuente: 'Gerencia de Contratos — Banco Cordillera',
      formato: 'PDF',
      paginas: 34,
    },
    {
      id: 'EVD-006',
      tipo: 'documento',
      titulo: 'Resultados ejercicio prueba de restauración 2024',
      descripcion: 'Informe de la prueba de restauración parcial ejecutada en agosto 2024. La última prueba registrada antes del período auditado.',
      fecha: '2024-08-23',
      fuente: 'Equipo de Continuidad TI — Banco Cordillera',
      formato: 'PDF',
      paginas: 12,
    },
    {
      id: 'EVD-007',
      tipo: 'documento',
      titulo: 'Organigrama y roles TI vigente',
      descripcion: 'Descripción de cargos y roles de la Gerencia de TI, incluyendo responsabilidades en continuidad y recuperación.',
      fecha: '2024-11-30',
      fuente: 'Gerencia de Recursos Humanos / TI — Banco Cordillera',
      formato: 'PDF',
      paginas: 18,
    },
    {
      id: 'EVD-008',
      tipo: 'evidencia-tecnica',
      titulo: 'Inventario de activos TI críticos — Q1 2026',
      descripcion: 'Inventario de activos tecnológicos clasificados como críticos para la operación del banco. Incluye fecha de última actualización por activo.',
      fecha: '2026-03-31',
      fuente: 'Gerencia de TI — Banco Cordillera',
      formato: 'XLSX',
    },
    {
      id: 'EVD-009',
      tipo: 'evidencia-tecnica',
      titulo: 'Screenshots — Monitoreo de respaldos (panel Veeam)',
      descripcion: 'Capturas del panel de monitoreo Veeam Backup mostrando historial de trabajos. Confirma ausencia de verificación automática de integridad.',
      fecha: '2026-04-29',
      fuente: 'Equipo de Continuidad TI — captura en sitio',
      formato: 'PNG',
    },
    {
      id: 'EVD-010',
      tipo: 'entrevista',
      titulo: 'Acta de entrevista — Felipe Díaz, CIO',
      descripcion: 'Entrevista al Director de Tecnología. Abarcó estado del BCP, gobernanza TI, relación con proveedores y planes de mejora.',
      fecha: '2026-03-27',
      fuente: 'Trabajo de campo — Banco Cordillera',
      formato: 'PDF',
      paginas: 8,
    },
    {
      id: 'EVD-011',
      tipo: 'entrevista',
      titulo: 'Acta de entrevista — Alejandra Vega, Jefa de Continuidad',
      descripcion: 'Entrevista a la Jefa del Departamento de Continuidad Operativa. Confirmó que no existen ejercicios BCP ejecutados en 2025-2026.',
      fecha: '2026-04-10',
      fuente: 'Trabajo de campo — Banco Cordillera',
      formato: 'PDF',
      paginas: 6,
    },
    {
      id: 'EVD-012',
      tipo: 'entrevista',
      titulo: 'Acta de entrevista — Carlos Rojas, Representante AWS',
      descripcion: 'Entrevista al ejecutivo de cuenta AWS. Confirmó que el contrato vigente no incluye SLA de continuidad ni cláusulas de notificación de incidentes.',
      fecha: '2026-04-15',
      fuente: 'Trabajo de campo — Reunión remota',
      formato: 'PDF',
      paginas: 5,
    },
    {
      id: 'EVD-013',
      tipo: 'prueba',
      titulo: 'Ficha de prueba — Walkthrough del BCP',
      descripcion: 'Prueba de tipo walkthrough que recorre los procedimientos del BCP verificando su aplicabilidad. Identificó 3 roles asignados a personal que ya no ocupa esos cargos.',
      fecha: '2026-04-22',
      fuente: 'Equipo auditor — Banco Cordillera',
      formato: 'PDF',
      paginas: 14,
    },
    {
      id: 'EVD-014',
      tipo: 'prueba',
      titulo: 'Ficha de prueba — Revisión integridad de respaldos',
      descripcion: 'Prueba de detalle que verificó el proceso completo de respaldo y restauración. Confirma ausencia de verificación automática de integridad.',
      fecha: '2026-04-29',
      fuente: 'Equipo auditor — Banco Cordillera',
      formato: 'PDF',
      paginas: 10,
    },
  ],

  hallazgos: [
    {
      id: 'H-001',
      numero: 'H-001',
      titulo: 'Plan de Continuidad de Negocio no ha sido sometido a prueba integral en los últimos 12 meses',
      severidad: 'critico',
      condicion:
        'El Plan de Continuidad de Negocio (BCP) versión 3.1, vigente al período auditado, no registra la ejecución de ningún ejercicio de prueba integral durante 2025 ni en el período enero–mayo 2026. La última prueba registrada corresponde a agosto de 2024, superando los 20 meses sin ejercicio. Esto fue confirmado tanto en la entrevista con la Jefa de Continuidad (EVD-011) como mediante la revisión de la documentación de registros de ejercicios (EVD-001 y EVD-013).',
      causa:
        'No existe un calendario formal de ejercicios de continuidad aprobado por la alta gerencia para el período auditado. El Comité TI no ha calendarizado ni presupuestado las pruebas del BCP para 2025–2026, según las actas disponibles (EVD-003 y EVD-004). La ausencia de un responsable designado con autoridad para exigir la ejecución de ejercicios contribuye a la brecha.',
      efecto:
        'Alta probabilidad de que el banco no pueda recuperar las operaciones críticas dentro de los tiempos de recuperación comprometidos (RTO ≤ 4 horas / RPO ≤ 2 horas) ante un evento disruptivo real. El RGSI Art. 47 exige pruebas anuales; el incumplimiento expone al banco a sanciones regulatorias y a una recuperación no validada.',
      recomendacion:
        'Establecer un calendario anual de ejercicios BCP, aprobado formalmente por el Comité TI, que incluya al menos: (1) una prueba integral con simulacro completo de activación, y (2) dos ejercicios de escritorio por año. Designar un responsable de continuidad con autoridad y métricas de desempeño asociadas. Documentar formalmente los resultados y las acciones de mejora con seguimiento trimestral en el Comité TI.',
      respuestaBanco: null,
      estadoRespuesta: 'pendiente',
      criterios: ['COBIT-DSS04-03', 'RGSI-ART47'],
      evidencias: ['EVD-001', 'EVD-003', 'EVD-004', 'EVD-011', 'EVD-013'],
      fechaEmision: '2026-05-14',
    },
    {
      id: 'H-002',
      numero: 'H-002',
      titulo: 'Respaldos de información crítica sin verificación automática de integridad',
      severidad: 'critico',
      condicion:
        'Los registros de ejecución de respaldos analizados (EVD-002, período enero 2025–mayo 2026) y las capturas del panel Veeam Backup (EVD-009) no evidencian la existencia de un proceso automatizado de verificación de integridad posterior a la ejecución de los respaldos. La ficha de prueba aplicada (EVD-014) confirma que únicamente se verifica el estado de finalización del trabajo (OK/Error), sin validar la integridad real del contenido respaldado.',
      causa:
        'El procedimiento de gestión de respaldos vigente no contempla la verificación automática de integridad post-ejecución. Esta deficiencia fue identificada como práctica pendiente de implementación en el plan de trabajo de continuidad de 2024 y no fue subsanada en el período. No existe un responsable técnico designado para implementar esta mejora.',
      efecto:
        'Riesgo alto de pérdida irrecuperable de datos ante un incidente o desastre, dado que los respaldos podrían contener errores silenciosos no detectados. El RGSI Art. 51 exige verificación de integridad de respaldos como control obligatorio. La falta de este control invalida la garantía de recuperabilidad ante cualquier escenario de desastre.',
      recomendacion:
        'Implementar verificación automática de integridad (hash checksum o equivalente) posterior a cada ejecución de respaldo, con alertas automáticas al equipo de operaciones ante cualquier discrepancia. Complementar con pruebas de restauración muestral mensual de archivos aleatorios de sistemas críticos. Actualizar el procedimiento formal de respaldos para incluir estos controles y establecer métricas de cumplimiento.',
      respuestaBanco:
        'El banco reconoce la observación y ha iniciado un proyecto de mejora de la gestión de respaldos programado para Q3 2026. Se ha designado al Jefe de Infraestructura como responsable y se ha asignado presupuesto inicial. Se entregará un plan de implementación detallado antes del 30 de junio de 2026.',
      estadoRespuesta: 'aceptada',
      criterios: ['COBIT-DSS04-07', 'COBIT-BAI09-02', 'RGSI-ART51'],
      evidencias: ['EVD-002', 'EVD-009', 'EVD-014'],
      fechaEmision: '2026-05-14',
    },
    {
      id: 'H-003',
      numero: 'H-003',
      titulo: 'Contrato con proveedor cloud sin cláusulas de continuidad y niveles de servicio adecuados',
      severidad: 'critico',
      condicion:
        'El contrato marco de servicios Amazon Web Services (EVD-005) analizado por el equipo auditor no incluye cláusulas específicas de continuidad operativa, tiempos de recuperación garantizados (RTO/RPO), ni procedimientos formales de notificación al banco ante incidentes que afecten la disponibilidad de los servicios. Esta situación fue confirmada en la entrevista con el representante AWS (EVD-012).',
      causa:
        'El contrato fue negociado bajo condiciones comerciales estándar sin incorporar los requerimientos específicos del RGSI en materia de gestión de proveedores tecnológicos críticos. No existe un procedimiento de revisión contractual con criterios normativos previo a la firma de contratos con proveedores TI críticos.',
      efecto:
        'El banco carece de respaldo legal y contractual para exigir tiempos de recuperación específicos al proveedor en caso de incidente. Esta brecha expone al banco a riesgo regulatorio ante el RGSI Art. 58 y a riesgo operacional ante interrupciones del servicio cloud sin garantías de recuperación. AWS provee infraestructura crítica al core bancario transaccional.',
      recomendacion:
        'Iniciar negociación para enmendar el contrato vigente o celebrar un addendum que incorpore: (1) SLA de disponibilidad ≥ 99.9%; (2) RTO/RPO comprometidos por servicio; (3) obligación de notificación al banco en ≤ 2 horas ante incidentes; (4) derecho de auditoría del banco al proveedor; y (5) procedimiento de continuidad del proveedor ante desastre. Implementar un procedimiento de revisión contractual con checklist normativo (RGSI) obligatorio antes de la firma de contratos con proveedores críticos.',
      respuestaBanco: null,
      estadoRespuesta: 'pendiente',
      criterios: ['RGSI-ART58', 'COBIT-APO10-03'],
      evidencias: ['EVD-005', 'EVD-012'],
      fechaEmision: '2026-05-14',
    },
    {
      id: 'H-004',
      numero: 'H-004',
      titulo: 'Comité de TI sin actas formales en los últimos dos trimestres',
      severidad: 'medio',
      condicion:
        'No existen actas formalizadas de sesiones del Comité de Tecnología (Comité TI) correspondientes a Q4 2025 y Q1 2026. La revisión de los registros (EVD-003, EVD-004) confirma que el Comité sesionó en ambos trimestres, pero los acuerdos y decisiones no fueron documentados mediante actas formales con firmas de los participantes, según lo exige el procedimiento institucional de gobierno TI.',
      causa:
        'La secretaría del Comité TI no ha contado con los recursos y el tiempo suficientes para formalizar las actas durante el período. Se identifica una brecha entre el procedimiento formal establecido y su aplicación práctica. No existe un mecanismo de alerta o escalamiento ante el incumplimiento de plazos de formalización de actas.',
      efecto:
        'Pérdida de trazabilidad formal en las decisiones de TI del período afectado. Riesgo regulatorio ante una fiscalización del RGSI, dado que el Art. 12 exige el registro formal de acuerdos de los comités de TI. Adicionalmente, varios acuerdos relevantes del período (incluyendo discusiones sobre continuidad) no tienen respaldo documental formal.',
      recomendacion:
        'Formalizar retroactivamente, dentro de los próximos 30 días, las actas de las sesiones Q4 2025 y Q1 2026 basándose en las minutas informales y correos disponibles, con firma de los participantes que corresponda. Designar un responsable permanente de la secretaría del Comité TI con dedicación horaria asignada. Establecer un plazo máximo de formalización de actas de 5 días hábiles post-sesión y un mecanismo de escalamiento si no se cumple.',
      respuestaBanco:
        'Se ha designado un nuevo secretario permanente del Comité TI con dedicación exclusiva. Las actas retroactivas de Q4 2025 y Q1 2026 están en proceso de elaboración y se entregarán formalizadas antes del 10 de junio de 2026. Se implementará un procedimiento con plazo máximo de 5 días hábiles para la formalización de futuras actas.',
      estadoRespuesta: 'aceptada',
      criterios: ['COSO-IC3', 'RGSI-ART12'],
      evidencias: ['EVD-003', 'EVD-004', 'EVD-010'],
      fechaEmision: '2026-05-14',
    },
    {
      id: 'H-005',
      numero: 'H-005',
      titulo: 'Roles y responsabilidades en continuidad operativa desactualizados',
      severidad: 'medio',
      condicion:
        'El organigrama y descripción de roles TI vigente (EVD-007, versión noviembre 2024) no refleja las responsabilidades actuales en materia de continuidad operativa. El walkthrough del BCP (EVD-013) confirmó que tres posiciones clave del plan de continuidad (Coordinador de Recuperación, Responsable de Comunicaciones en Crisis y Líder de Recuperación de Sistemas) están asignadas a empleados que ya no ocupan esos cargos en el banco.',
      causa:
        'La última actualización formal de los roles TI data de 18 meses y el BCP no ha sido actualizado desde agosto 2024. No existe un proceso establecido de revisión periódica de los roles y responsabilidades vinculados al BCP ante cambios de personal. RRHH y TI no tienen un proceso de notificación automática para actualizar el BCP ante salidas o cambios de cargo relevantes.',
      efecto:
        'En caso de necesitar activar el BCP ante un incidente real, existiría confusión crítica sobre responsabilidades y cadena de mando, comprometiendo seriamente la efectividad y los tiempos de la respuesta. Adicionalmente, el personal designado actualmente en el BCP no ha sido capacitado para los roles que formalmente les asigna el plan.',
      recomendacion:
        'Actualizar el BCP y el organigrama TI de forma inmediata para reflejar los roles y responsables actuales correctos. Establecer un proceso de revisión semestral de los roles de continuidad, con un responsable designado en la intersección de RRHH y TI. Implementar una notificación automática al área de Continuidad ante cambios de personal en cargos vinculados al BCP. Realizar una sesión de inducción para los nuevos responsables designados.',
      respuestaBanco: null,
      estadoRespuesta: 'pendiente',
      criterios: ['COBIT-APO07-01', 'COSO-AC4'],
      evidencias: ['EVD-007', 'EVD-011', 'EVD-013'],
      fechaEmision: '2026-05-14',
    },
    {
      id: 'H-006',
      numero: 'H-006',
      titulo: 'Inventario de activos TI críticos con actualizaciones parcialmente atrasadas',
      severidad: 'bajo',
      condicion:
        'El inventario de activos TI críticos correspondiente a Q1 2026 (EVD-008) presenta 12 activos catalogados como críticos con fecha de última actualización anterior a los 90 días desde la fecha de corte, lo que representa el 18% del total de activos de categoría crítica (66 activos). De estos 12, 4 no registran actualización desde hace más de 180 días.',
      causa:
        'El proceso de actualización del inventario de activos es manual y depende de la iniciativa del responsable de cada activo, sin que existan alertas automáticas por inactividad de registros. La herramienta de gestión de activos en uso (ServiceNow) no está configurada para enviar recordatorios o alertas a los responsables de activos críticos con registros desactualizados.',
      efecto:
        'Riesgo bajo-moderado de que las decisiones de continuidad o recuperación se basen en información desactualizada sobre activos críticos, lo que podría impactar negativamente en la priorización y efectividad del BCP. COBIT BAI09 exige el mantenimiento actualizado del inventario de activos.',
      recomendacion:
        'Configurar alertas automáticas en ServiceNow para notificar a los responsables de activos críticos cuando un registro no ha sido actualizado en más de 60 días. Asignar la responsabilidad de la revisión mensual del inventario de activos críticos a un cargo específico en la Gerencia TI. Definir un SLA interno de actualización de registros de activos críticos y reportarlo trimestralmente al Comité TI.',
      respuestaBanco:
        'Se ha iniciado una revisión completa del inventario de activos. Estimado de completitud al 100%: 30 de junio de 2026. Se está evaluando la configuración de alertas automáticas en ServiceNow como parte del proyecto de mejora.',
      estadoRespuesta: 'parcial',
      criterios: ['COBIT-BAI09-01', 'COBIT-BAI09-02'],
      evidencias: ['EVD-008'],
      fechaEmision: '2026-05-14',
    },
  ],

  timeline: [
    {
      id: 'EVT-001',
      tipo: 'solicitud-info',
      fecha: '2026-03-12',
      titulo: 'Solicitud formal de información',
      descripcion: 'Se envió la carta formal de inicio de auditoría y el listado de requerimientos de información (42 ítems) a la Gerencia General y a la Gerencia TI del banco.',
      hallazgosVinculados: [],
    },
    {
      id: 'EVT-002',
      tipo: 'recepcion-evidencia',
      fecha: '2026-03-19',
      titulo: 'Recepción de documentos iniciales',
      descripcion: 'El banco entregó la política BCP v3.1, organigrama TI y el inventario de activos Q1 2026. Pendiente recepción de logs de respaldo y contratos.',
      evidenciasVinculadas: ['EVD-001', 'EVD-007', 'EVD-008'],
    },
    {
      id: 'EVT-003',
      tipo: 'entrevista',
      fecha: '2026-03-27',
      titulo: 'Entrevista con CIO — Felipe Díaz',
      descripcion: 'Sesión de 2.5 horas con el Director de Tecnología. Se abordó el estado del BCP, gobernanza del Comité TI, relación con proveedor cloud y planes de mejora para 2026.',
      evidenciasVinculadas: ['EVD-010'],
    },
    {
      id: 'EVT-004',
      tipo: 'recepcion-evidencia',
      fecha: '2026-04-03',
      titulo: 'Recepción de evidencias técnicas y contractuales',
      descripcion: 'El banco entregó los logs de respaldo del período 2025–2026, el contrato AWS vigente y las actas del Comité TI Q3 y Q4 2025.',
      evidenciasVinculadas: ['EVD-002', 'EVD-003', 'EVD-004', 'EVD-005'],
    },
    {
      id: 'EVT-005',
      tipo: 'entrevista',
      fecha: '2026-04-10',
      titulo: 'Entrevista con Jefa de Continuidad — Alejandra Vega',
      descripcion: 'Sesión de 2 horas. La entrevistada confirmó la ausencia de ejercicios BCP en 2025–2026 y la desactualización de roles de continuidad en el plan vigente.',
      evidenciasVinculadas: ['EVD-011'],
    },
    {
      id: 'EVT-006',
      tipo: 'entrevista',
      fecha: '2026-04-15',
      titulo: 'Entrevista con representante AWS — Carlos Rojas',
      descripcion: 'Reunión remota con el ejecutivo de cuenta de Amazon Web Services. Confirmó que el contrato estándar no incluye SLA de continuidad ni procedimientos de notificación de incidentes.',
      evidenciasVinculadas: ['EVD-012'],
    },
    {
      id: 'EVT-007',
      tipo: 'prueba-aplicada',
      fecha: '2026-04-22',
      titulo: 'Walkthrough del Plan de Continuidad de Negocio',
      descripcion: 'Aplicación de ficha de prueba recorriendo los procedimientos del BCP v3.1. Se identificaron 3 roles asignados a personal que ya no ocupa esos cargos y la ausencia de registros de ejercicios en 2025–2026.',
      evidenciasVinculadas: ['EVD-013'],
      hallazgosVinculados: ['H-001', 'H-005'],
    },
    {
      id: 'EVT-008',
      tipo: 'prueba-aplicada',
      fecha: '2026-04-29',
      titulo: 'Prueba de revisión de integridad de respaldos',
      descripcion: 'Prueba de detalle verificando el proceso completo de respaldo, monitoreo y restauración. Confirma ausencia de verificación automática de integridad post-respaldo.',
      evidenciasVinculadas: ['EVD-009', 'EVD-014'],
      hallazgosVinculados: ['H-002'],
    },
    {
      id: 'EVT-009',
      tipo: 'recepcion-evidencia',
      fecha: '2026-05-07',
      titulo: 'Revisión de actas del Comité TI',
      descripcion: 'Análisis de las actas recibidas. Se confirma que el acta Q4 2025 es un borrador sin formalizar y que no existe acta del Q1 2026.',
      evidenciasVinculadas: ['EVD-003', 'EVD-004'],
      hallazgosVinculados: ['H-004'],
    },
    {
      id: 'EVT-010',
      tipo: 'hallazgo-emitido',
      fecha: '2026-05-14',
      titulo: 'Comunicación preliminar de hallazgos',
      descripcion: 'Se enviaron al banco los 6 hallazgos preliminares para revisión y preparación de respuesta. Plazo otorgado: 10 días hábiles.',
      hallazgosVinculados: ['H-001', 'H-002', 'H-003', 'H-004', 'H-005', 'H-006'],
    },
    {
      id: 'EVT-011',
      tipo: 'respuesta-banco',
      fecha: '2026-05-21',
      titulo: 'Respuesta parcial del banco',
      descripcion: 'El banco entregó respuesta formal a los hallazgos H-002, H-004 y H-006. Pendiente respuesta a H-001 (BCP), H-003 (contrato cloud) y H-005 (roles).',
      hallazgosVinculados: ['H-002', 'H-004', 'H-006'],
    },
    {
      id: 'EVT-012',
      tipo: 'cierre',
      fecha: '2026-05-25',
      titulo: 'Cierre del trabajo de campo',
      descripcion: 'Se cierra el trabajo de campo de la auditoría. Tres hallazgos críticos/medios (H-001, H-003, H-005) permanecen sin respuesta formal del banco al momento del cierre.',
      hallazgosVinculados: ['H-001', 'H-003', 'H-005'],
    },
  ],

  nodosTablero: [
    // Documentos / Evidencias (izquierda)
    { id: 'N-EVD-001', tipo: 'documento', titulo: 'Política BCP v3.1', subtitulo: 'EVD-001', refId: 'EVD-001', x: 80, y: 100 },
    { id: 'N-EVD-007', tipo: 'documento', titulo: 'Organigrama TI', subtitulo: 'EVD-007', refId: 'EVD-007', x: 80, y: 260 },
    { id: 'N-EVD-008', tipo: 'documento', titulo: 'Inventario Activos', subtitulo: 'EVD-008', refId: 'EVD-008', x: 80, y: 420 },
    { id: 'N-EVD-005', tipo: 'documento', titulo: 'Contrato AWS', subtitulo: 'EVD-005', refId: 'EVD-005', x: 80, y: 580 },

    // Evidencias técnicas
    { id: 'N-EVD-002', tipo: 'evidencia', titulo: 'Logs de Respaldo', subtitulo: 'EVD-002', refId: 'EVD-002', x: 80, y: 740 },
    { id: 'N-EVD-009', tipo: 'evidencia', titulo: 'Screenshots Veeam', subtitulo: 'EVD-009', refId: 'EVD-009', x: 80, y: 900 },

    // Actas
    { id: 'N-EVD-003', tipo: 'documento', titulo: 'Acta Comité Q3', subtitulo: 'EVD-003', refId: 'EVD-003', x: 300, y: 100 },
    { id: 'N-EVD-004', tipo: 'documento', titulo: 'Acta Comité Q4', subtitulo: 'EVD-004', refId: 'EVD-004', x: 300, y: 260 },

    // Entrevistas
    { id: 'N-EVD-010', tipo: 'entrevista', titulo: 'Entrevista CIO', subtitulo: 'EVD-010', refId: 'EVD-010', x: 300, y: 420 },
    { id: 'N-EVD-011', tipo: 'entrevista', titulo: 'Entrevista J.Continuidad', subtitulo: 'EVD-011', refId: 'EVD-011', x: 300, y: 580 },
    { id: 'N-EVD-012', tipo: 'entrevista', titulo: 'Entrevista AWS', subtitulo: 'EVD-012', refId: 'EVD-012', x: 300, y: 740 },

    // Pruebas
    { id: 'N-EVD-013', tipo: 'prueba', titulo: 'Walkthrough BCP', subtitulo: 'EVD-013', refId: 'EVD-013', x: 300, y: 900 },
    { id: 'N-EVD-014', tipo: 'prueba', titulo: 'Prueba Integridad', subtitulo: 'EVD-014', refId: 'EVD-014', x: 300, y: 1060 },

    // Hallazgos (centro)
    { id: 'N-H-001', tipo: 'hallazgo', titulo: 'H-001: BCP no probado', subtitulo: 'Crítico', refId: 'H-001', x: 620, y: 100, severidad: 'critico' },
    { id: 'N-H-002', tipo: 'hallazgo', titulo: 'H-002: Integridad respaldos', subtitulo: 'Crítico', refId: 'H-002', x: 620, y: 300, severidad: 'critico' },
    { id: 'N-H-003', tipo: 'hallazgo', titulo: 'H-003: Contrato cloud', subtitulo: 'Crítico', refId: 'H-003', x: 620, y: 500, severidad: 'critico' },
    { id: 'N-H-004', tipo: 'hallazgo', titulo: 'H-004: Actas Comité TI', subtitulo: 'Medio', refId: 'H-004', x: 620, y: 700, severidad: 'medio' },
    { id: 'N-H-005', tipo: 'hallazgo', titulo: 'H-005: Roles desactualizados', subtitulo: 'Medio', refId: 'H-005', x: 620, y: 900, severidad: 'medio' },
    { id: 'N-H-006', tipo: 'hallazgo', titulo: 'H-006: Inventario activos', subtitulo: 'Bajo', refId: 'H-006', x: 620, y: 1060, severidad: 'bajo' },

    // Criterios (derecha)
    { id: 'N-C-DSS04-03', tipo: 'criterio', titulo: 'COBIT DSS04.03', subtitulo: 'Continuidad TI', refId: 'COBIT-DSS04-03', x: 900, y: 60 },
    { id: 'N-C-RGSI-47', tipo: 'criterio', titulo: 'RGSI Art. 47', subtitulo: 'Continuidad operativa', refId: 'RGSI-ART47', x: 900, y: 200 },
    { id: 'N-C-DSS04-07', tipo: 'criterio', titulo: 'COBIT DSS04.07', subtitulo: 'Gestión de respaldos', refId: 'COBIT-DSS04-07', x: 900, y: 340 },
    { id: 'N-C-RGSI-51', tipo: 'criterio', titulo: 'RGSI Art. 51', subtitulo: 'Respaldos de información', refId: 'RGSI-ART51', x: 900, y: 480 },
    { id: 'N-C-RGSI-58', tipo: 'criterio', titulo: 'RGSI Art. 58', subtitulo: 'Proveedores TI', refId: 'RGSI-ART58', x: 900, y: 620 },
    { id: 'N-C-APO10', tipo: 'criterio', titulo: 'COBIT APO10.03', subtitulo: 'Riesgo proveedores', refId: 'COBIT-APO10-03', x: 900, y: 760 },
    { id: 'N-C-IC3', tipo: 'criterio', titulo: 'COSO IC.3', subtitulo: 'Comunicación externa', refId: 'COSO-IC3', x: 900, y: 900 },
    { id: 'N-C-APO07', tipo: 'criterio', titulo: 'COBIT APO07.01', subtitulo: 'Personal TI', refId: 'COBIT-APO07-01', x: 900, y: 1040 },
    { id: 'N-C-BAI09', tipo: 'criterio', titulo: 'COBIT BAI09.01', subtitulo: 'Inventario activos', refId: 'COBIT-BAI09-01', x: 900, y: 1180 },

    // Respuestas banco
    { id: 'N-R-002', tipo: 'respuesta', titulo: 'Respuesta H-002', subtitulo: 'Aceptada', refId: 'H-002', x: 1140, y: 300 },
    { id: 'N-R-004', tipo: 'respuesta', titulo: 'Respuesta H-004', subtitulo: 'Aceptada', refId: 'H-004', x: 1140, y: 700 },
    { id: 'N-R-006', tipo: 'respuesta', titulo: 'Respuesta H-006', subtitulo: 'Parcial', refId: 'H-006', x: 1140, y: 1060 },
  ],

  conexionesTablero: [
    // Evidencias → H-001
    { id: 'C-001', desde: 'N-EVD-001', hacia: 'N-H-001', etiqueta: 'sustenta' },
    { id: 'C-002', desde: 'N-EVD-011', hacia: 'N-H-001', etiqueta: 'confirma' },
    { id: 'C-003', desde: 'N-EVD-013', hacia: 'N-H-001', etiqueta: 'prueba' },
    { id: 'C-004', desde: 'N-EVD-003', hacia: 'N-H-001', etiqueta: 'sustenta' },
    // H-001 → Criterios
    { id: 'C-005', desde: 'N-H-001', hacia: 'N-C-DSS04-03', etiqueta: 'evalúa' },
    { id: 'C-006', desde: 'N-H-001', hacia: 'N-C-RGSI-47', etiqueta: 'incumple' },

    // Evidencias → H-002
    { id: 'C-007', desde: 'N-EVD-002', hacia: 'N-H-002', etiqueta: 'sustenta' },
    { id: 'C-008', desde: 'N-EVD-009', hacia: 'N-H-002', etiqueta: 'confirma' },
    { id: 'C-009', desde: 'N-EVD-014', hacia: 'N-H-002', etiqueta: 'prueba' },
    // H-002 → Criterios
    { id: 'C-010', desde: 'N-H-002', hacia: 'N-C-DSS04-07', etiqueta: 'evalúa' },
    { id: 'C-011', desde: 'N-H-002', hacia: 'N-C-RGSI-51', etiqueta: 'incumple' },
    // H-002 → Respuesta
    { id: 'C-012', desde: 'N-H-002', hacia: 'N-R-002', etiqueta: 'responde' },

    // Evidencias → H-003
    { id: 'C-013', desde: 'N-EVD-005', hacia: 'N-H-003', etiqueta: 'sustenta' },
    { id: 'C-014', desde: 'N-EVD-012', hacia: 'N-H-003', etiqueta: 'confirma' },
    // H-003 → Criterios
    { id: 'C-015', desde: 'N-H-003', hacia: 'N-C-RGSI-58', etiqueta: 'incumple' },
    { id: 'C-016', desde: 'N-H-003', hacia: 'N-C-APO10', etiqueta: 'evalúa' },

    // Evidencias → H-004
    { id: 'C-017', desde: 'N-EVD-003', hacia: 'N-H-004', etiqueta: 'sustenta' },
    { id: 'C-018', desde: 'N-EVD-004', hacia: 'N-H-004', etiqueta: 'sustenta' },
    { id: 'C-019', desde: 'N-EVD-010', hacia: 'N-H-004', etiqueta: 'confirma' },
    // H-004 → Criterios
    { id: 'C-020', desde: 'N-H-004', hacia: 'N-C-IC3', etiqueta: 'evalúa' },
    // H-004 → Respuesta
    { id: 'C-021', desde: 'N-H-004', hacia: 'N-R-004', etiqueta: 'responde' },

    // Evidencias → H-005
    { id: 'C-022', desde: 'N-EVD-007', hacia: 'N-H-005', etiqueta: 'sustenta' },
    { id: 'C-023', desde: 'N-EVD-011', hacia: 'N-H-005', etiqueta: 'confirma' },
    { id: 'C-024', desde: 'N-EVD-013', hacia: 'N-H-005', etiqueta: 'prueba' },
    // H-005 → Criterios
    { id: 'C-025', desde: 'N-H-005', hacia: 'N-C-APO07', etiqueta: 'evalúa' },

    // Evidencias → H-006
    { id: 'C-026', desde: 'N-EVD-008', hacia: 'N-H-006', etiqueta: 'sustenta' },
    // H-006 → Criterios
    { id: 'C-027', desde: 'N-H-006', hacia: 'N-C-BAI09', etiqueta: 'evalúa' },
    // H-006 → Respuesta
    { id: 'C-028', desde: 'N-H-006', hacia: 'N-R-006', etiqueta: 'responde' },
  ],
};

export const casosList = [caso2026014];

export function getCasoById(id: string): Caso | undefined {
  return casosList.find(c => c.id === id);
}

export function getHallazgoById(casoId: string, hallazgoId: string) {
  const caso = getCasoById(casoId);
  return caso?.hallazgos.find(h => h.id === hallazgoId);
}

export function getEvidenciaById(casoId: string, evidenciaId: string) {
  const caso = getCasoById(casoId);
  return caso?.evidencias.find(e => e.id === evidenciaId);
}
