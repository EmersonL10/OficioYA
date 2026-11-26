export type Rol = 'CLIENTE' | 'PROFESIONAL' | 'ADMIN';

export type EstadoSolicitud =
  'ABIERTA' | 'CONTRATADA' | 'FINALIZADA' | 'CANCELADA';

export type EstadoCotizacion =
  'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export type EstadoContratacion =
  'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  fechaRegistro: string;
}

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  telefono: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  tipoToken: string;
  usuario: Usuario;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion: string;
}

export interface Profesional {
  id: number;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  categoriaId: number;
  categoriaNombre: string;
  descripcion: string;
  experienciaAnios: number;
  disponible: boolean;
}

export interface ProfesionalRequest {
  categoriaId: number;
  descripcion: string;
  experienciaAnios: number;
}

export interface Solicitud {
  id: number;
  clienteId: number | null;
  clienteNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  titulo: string;
  descripcion: string;
  direccion: string | null;
  presupuesto: number;
  estado: EstadoSolicitud;
  fechaCreacion: string;
}

export interface SolicitudRequest {
  categoriaId: number;
  titulo: string;
  descripcion: string;
  direccion: string;
  presupuesto: number;
}

export interface Cotizacion {
  id: number;
  solicitudId: number;
  solicitudTitulo: string;
  profesionalId: number;
  profesionalNombre: string;
  monto: number;
  descripcion: string;
  plazoDias: number;
  estado: EstadoCotizacion;
  fechaEnvio: string;
}

export interface CotizacionRequest {
  solicitudId: number;
  monto: number;
  descripcion: string;
  plazoDias: number;
}

export interface ContratacionRequest {
  cotizacionId: number;
}

export interface Contratacion {
  id: number;
  cotizacionId: number;
  solicitudId: number;
  solicitudTitulo: string;
  clienteId: number;
  clienteNombre: string;
  profesionalId: number;
  profesionalNombre: string;
  monto: number;
  estado: EstadoContratacion;
  fechaContratacion: string;
  fechaInicio: string | null;
  fechaFinalizacion: string | null;
}

export interface Calificacion {
  id: number;
  contratacionId: number;
  profesionalId: number;
  profesionalNombre: string;
  clienteNombre: string;
  puntuacion: number;
  comentario: string | null;
  fechaCalificacion: string;
}

export interface CalificacionRequest {
  contratacionId: number;
  puntuacion: number;
  comentario: string;
}

export interface ApiError {
  fecha: string;
  estado: number;
  error: string;
  mensaje: string;
  ruta: string;
  detalles: Record<string, string> | null;
}