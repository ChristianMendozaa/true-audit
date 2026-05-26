export type Severidad = 'critico' | 'medio' | 'bajo';
export type NivelRiesgo = 'alto' | 'medio' | 'bajo';
export type EstadoRespuesta = 'pendiente' | 'recibida' | 'aceptada' | 'parcial' | 'rechazada';
export type DecisionAuditor = 'mantener' | 'ajustar' | 'descartar' | 'pendiente';
export type EstadoHallazgo = 'abierto' | 'en-revision' | 'pendiente-respuesta' | 'respondido' | 'cerrado' | 'descartado';
export type EstadoRevisionEvidencia = 'pendiente' | 'revisado' | 'observado' | 'descartada';
export type TipoEvidencia =
  | 'documento'
  | 'acta'
  | 'politica'
  | 'procedimiento'
  | 'inventario'
  | 'entrevista'
  | 'checklist'
  | 'captura'
  | 'fotografia'
  | 'registro-sistema'
  | 'ficha-prueba'
  | 'respuesta-auditado'
  | 'evidencia-tecnica'
  | 'prueba'
  | 'contrato';
export type TipoNodo = 'documento' | 'evidencia' | 'entrevista' | 'prueba' | 'hallazgo' | 'criterio' | 'respuesta' | 'observacion';
export type FiguraNodo = 'documento' | 'rectangulo' | 'rombo' | 'nota' | 'cilindro' | 'badge';
export type TipoRelacion =
  | 'respalda'
  | 'origina'
  | 'incumple'
  | 'relacionado con'
  | 'responde'
  | 'contradice'
  | 'mitiga'
  | 'requiere seguimiento';
export type TipoEvento =
  | 'solicitud-info'
  | 'recepcion-evidencia'
  | 'registro-evidencia'
  | 'entrevista'
  | 'prueba-aplicada'
  | 'observacion-identificada'
  | 'hallazgo-emitido'
  | 'respuesta-banco'
  | 'revision-auditor'
  | 'cierre';
export type Marco = 'COBIT' | 'COSO' | 'RGSI';
export type EstadoCaso = 'en-curso' | 'cerrado' | 'pendiente-respuesta';
export type RolUsuario = 'auditor' | 'auditado' | 'demo';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  rol: RolUsuario;
  organizacion: string;
}

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
  estadoRevision?: EstadoRevisionEvidencia;
  criterios?: string[];
  hallazgos?: string[];
  nombreArchivo?: string;
  archivoAdjunto?: ArchivoEvidencia;
  descartada?: boolean;
  enTablero?: boolean;
}

export interface ArchivoEvidencia {
  nombre: string;
  tipoMime: string;
  tamanoBytes: number;
  ultimaModificacion: string;
  almacenamiento: 'local-demo' | 'firebase';
  dataUrl?: string;
}

export interface RespuestaAuditado {
  id: string;
  hallazgoId: string;
  fecha: string;
  postura: 'acepta' | 'acepta-parcialmente' | 'no-acepta';
  argumento: string;
  evidenciaPresentada?: string;
  comentarioAuditor: string;
  decisionAuditor: DecisionAuditor;
}

export interface Hallazgo {
  id: string;
  numero: string;
  titulo: string;
  severidad: Severidad;
  nivelRiesgo: NivelRiesgo;
  condicion: string;
  criterio: string;
  causa: string;
  efecto: string;
  conclusion: string;
  probabilidad: number;
  impacto: number;
  recomendacion: string;
  respuestaBanco: string | null;
  estadoRespuesta: EstadoRespuesta;
  criterios: string[];
  evidencias: string[];
  respuestasAuditado?: string[];
  procesoCobit?: string;
  componenteCoso?: string;
  seccionRgsi?: string;
  estado: EstadoHallazgo;
  fechaEmision: string;
  descartado?: boolean;
}

export interface EventoTimeline {
  id: string;
  tipo: TipoEvento;
  fecha: string;
  titulo: string;
  descripcion: string;
  evidenciasVinculadas?: string[];
  hallazgosVinculados?: string[];
  respuestasVinculadas?: string[];
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
  shape?: FiguraNodo;
  locked?: boolean;
}

export interface ConexionTablero {
  id: string;
  desde: string;
  hacia: string;
  etiqueta?: TipoRelacion | string;
  estilo?: 'curva' | 'recta' | 'ortogonal';
  flecha?: boolean;
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
  respuestasAuditado: RespuestaAuditado[];
  timeline: EventoTimeline[];
  nodosTablero: NodoTablero[];
  conexionesTablero: ConexionTablero[];
}
