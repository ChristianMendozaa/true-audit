import type { Criterio } from './types';

export const criteriosCobit: Criterio[] = [
  {
    id: 'COBIT-PO1',
    marco: 'COBIT',
    dominio: 'Planificar y Organizar',
    codigo: 'PO1',
    nombre: 'Definir un plan estrategico de TI',
    descripcion:
      'Verifica que la estrategia de TI este alineada al negocio, aprobada por la direccion y traducida en planes, responsables, presupuesto y seguimiento.',
  },
  {
    id: 'COBIT-PO2',
    marco: 'COBIT',
    dominio: 'Planificar y Organizar',
    codigo: 'PO2',
    nombre: 'Definir la arquitectura de informacion',
    descripcion:
      'Evalua que la informacion critica, sus propietarios, dependencias y reglas de proteccion esten identificadas para soportar confidencialidad, integridad y disponibilidad.',
  },
  {
    id: 'COBIT-PO3',
    marco: 'COBIT',
    dominio: 'Planificar y Organizar',
    codigo: 'PO3',
    nombre: 'Determinar la direccion tecnologica',
    descripcion:
      'Revisa que las decisiones tecnologicas, plataformas criticas y controles de continuidad respondan a una direccion formal y gestionada.',
  },
  {
    id: 'COBIT-PO4',
    marco: 'COBIT',
    dominio: 'Planificar y Organizar',
    codigo: 'PO4',
    nombre: 'Definir procesos, organizacion y relaciones de TI',
    descripcion:
      'Evalua la estructura de gobierno de TI, roles, comites, responsabilidades y formalizacion de decisiones relevantes para el control interno.',
  },
  {
    id: 'COBIT-PO7',
    marco: 'COBIT',
    dominio: 'Planificar y Organizar',
    codigo: 'PO7',
    nombre: 'Administrar recursos humanos de TI',
    descripcion:
      'Revisa que el personal de TI cuente con competencias, responsabilidades y asignaciones vigentes para operar y recuperar servicios criticos.',
  },
  {
    id: 'COBIT-ME2',
    marco: 'COBIT',
    dominio: 'Monitorear y Evaluar',
    codigo: 'ME2',
    nombre: 'Monitorear y evaluar el control interno',
    descripcion:
      'Evalua que existan revisiones, pruebas, seguimiento de hallazgos y monitoreo formal del sistema de control interno de TI.',
  },
];

export const criteriosCoso: Criterio[] = [
  {
    id: 'COSO-AMBIENTE-CONTROL',
    marco: 'COSO',
    dominio: 'Ambiente de control',
    codigo: 'Ambiente de control',
    nombre: 'Compromiso, estructura y responsabilidades de control',
    descripcion:
      'Evalua tono de la direccion, estructura organizacional, responsabilidades y autoridad para ejecutar controles de TI.',
  },
  {
    id: 'COSO-EVALUACION-RIESGOS',
    marco: 'COSO',
    dominio: 'Evaluacion de riesgos',
    codigo: 'Evaluacion de riesgos',
    nombre: 'Identificacion y valoracion de riesgos de TI',
    descripcion:
      'Revisa que la entidad identifique y valore riesgos que afectan objetivos, continuidad, cumplimiento y confiabilidad de la informacion.',
  },
  {
    id: 'COSO-ACTIVIDADES-CONTROL',
    marco: 'COSO',
    dominio: 'Actividades de control',
    codigo: 'Actividades de control',
    nombre: 'Controles que mitigan riesgos identificados',
    descripcion:
      'Evalua politicas, procedimientos, validaciones, aprobaciones, revisiones y controles tecnicos aplicados a procesos de TI.',
  },
  {
    id: 'COSO-INFORMACION-COMUNICACION',
    marco: 'COSO',
    dominio: 'Informacion y comunicacion',
    codigo: 'Informacion y comunicacion',
    nombre: 'Comunicacion interna y externa sobre controles',
    descripcion:
      'Verifica que informacion relevante de controles, incidentes, comites y respuestas sea comunicada y documentada oportunamente.',
  },
  {
    id: 'COSO-SUPERVISION',
    marco: 'COSO',
    dominio: 'Supervision',
    codigo: 'Supervision',
    nombre: 'Seguimiento y evaluaciones del control interno',
    descripcion:
      'Revisa evaluaciones continuas o independientes y seguimiento de deficiencias hasta su correccion o aceptacion formal.',
  },
];

export const criteriosRgsi: Criterio[] = [
  {
    id: 'RGSI-S2',
    marco: 'RGSI',
    dominio: 'Seccion 2',
    codigo: 'Seccion 2',
    nombre: 'Planificacion y organizacion de TI',
    descripcion:
      'Criterios normativos sobre planificacion, gobierno, comites, roles, responsabilidades y organizacion de la funcion de tecnologia.',
  },
  {
    id: 'RGSI-S6',
    marco: 'RGSI',
    dominio: 'Seccion 6',
    codigo: 'Seccion 6',
    nombre: 'Operaciones de TI',
    descripcion:
      'Criterios normativos sobre operacion, continuidad, respaldos, recuperacion, monitoreo y procesamiento confiable de servicios tecnologicos.',
  },
  {
    id: 'RGSI-S11',
    marco: 'RGSI',
    dominio: 'Seccion 11',
    codigo: 'Seccion 11',
    nombre: 'Servicios y contratos con terceros',
    descripcion:
      'Criterios normativos sobre contratacion, niveles de servicio, continuidad, confidencialidad, seguimiento y derecho de auditoria sobre terceros.',
  },
  {
    id: 'RGSI-S12',
    marco: 'RGSI',
    dominio: 'Seccion 12',
    codigo: 'Seccion 12',
    nombre: 'Rol de auditoria interna',
    descripcion:
      'Criterios normativos sobre revision independiente de sistemas de informacion, seguimiento de observaciones y reporte de deficiencias de control.',
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
