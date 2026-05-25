export type Severidad = 'critico' | 'medio' | 'bajo';
export type EstadoRespuesta = 'pendiente' | 'recibida' | 'aceptada' | 'parcial';
export type TipoEvidencia = 'documento' | 'evidencia-tecnica' | 'entrevista' | 'prueba' | 'contrato' | 'acta';
export type TipoNodo = 'documento' | 'evidencia' | 'entrevista' | 'prueba' | 'hallazgo' | 'criterio' | 'respuesta';
export type TipoEvento =
  | 'solicitud-info'
  | 'recepcion-evidencia'
  | 'entrevista'
  | 'prueba-aplicada'
  | 'hallazgo-emitido'
  | 'respuesta-banco'
  | 'cierre';
export type Marco = 'COBIT' | 'COSO' | 'RGSI';
export type EstadoCaso = 'en-curso' | 'cerrado' | 'pendiente-respuesta';

export interface Auditor {
  id: string;
  nombre: string;
  rol: string;
  email: string;
}

export interface Criterio {
  id: string;
  marco: Marco;
  dominio?: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface Evidencia {
  id: string;
  tipo: TipoEvidencia;
  titulo: string;
  descripcion: string;
  fecha: string;
  fuente: string;
  formato?: string;
  paginas?: number;
}

export interface Hallazgo {
  id: string;
  numero: string;
  titulo: string;
  severidad: Severidad;
  condicion: string;
  causa: string;
  efecto: string;
  recomendacion: string;
  respuestaBanco: string | null;
  estadoRespuesta: EstadoRespuesta;
  criterios: string[];
  evidencias: string[];
  fechaEmision: string;
}

export interface EventoTimeline {
  id: string;
  tipo: TipoEvento;
  fecha: string;
  titulo: string;
  descripcion: string;
  evidenciasVinculadas?: string[];
  hallazgosVinculados?: string[];
}

export interface NodoTablero {
  id: string;
  tipo: TipoNodo;
  titulo: string;
  subtitulo?: string;
  refId: string;
  x: number;
  y: number;
  severidad?: Severidad;
}

export interface ConexionTablero {
  id: string;
  desde: string;
  hacia: string;
  etiqueta?: string;
}

export interface Caso {
  id: string;
  numero: string;
  titulo: string;
  banco: string;
  periodo: string;
  fechaInicio: string;
  fechaCierre?: string;
  estado: EstadoCaso;
  auditores: Auditor[];
  objetivo: string;
  alcance: string;
  metodologia: string;
  evidencias: Evidencia[];
  hallazgos: Hallazgo[];
  timeline: EventoTimeline[];
  nodosTablero: NodoTablero[];
  conexionesTablero: ConexionTablero[];
}
