import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, forkJoin, Observable, of, switchMap, throwError } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { CategoriaService } from '../../core/services/categoria';
import { ProfesionalService } from '../../core/services/profesional';
import { SolicitudService } from '../../core/services/solicitud';
import { CotizacionService } from '../../core/services/cotizacion';
import { ContratacionService } from '../../core/services/contratacion';
import { CalificacionService } from '../../core/services/calificacion';

import {
  Categoria, Profesional as PerfilProfesional, ProfesionalRequest,
  Solicitud, Cotizacion, CotizacionRequest, Contratacion, Calificacion
} from '../../core/models/api.models';

import { DashboardLayout, MenuItem } from '../../shared/components/dashboard-layout/dashboard-layout';
import { Notification } from '../../shared/components/notification/notification';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

import { Resumen } from './components/resumen/resumen';
import { Perfil } from './components/perfil/perfil';
import { Oportunidades } from './components/oportunidades/oportunidades';
import { Cotizaciones } from './components/cotizaciones/cotizaciones';
import { Contrataciones } from './components/contrataciones/contrataciones';
import { Reputacion } from './components/reputacion/reputacion';

@Component({
  selector: 'app-profesional',
  imports: [
    DashboardLayout, Notification, ConfirmDialog,
    Resumen, Perfil, Oportunidades, Cotizaciones,
    Contrataciones, Reputacion
  ],
  templateUrl: './profesional.html',
  styleUrl: './profesional.scss'
})
export class Profesional implements OnInit {
  readonly auth = inject(Auth);

  private categoriaService = inject(CategoriaService);
  private profesionalService = inject(ProfesionalService);
  private solicitudService = inject(SolicitudService);
  private cotizacionService = inject(CotizacionService);
  private contratacionService = inject(ContratacionService);
  private calificacionService = inject(CalificacionService);

  private dialogo = viewChild.required(ConfirmDialog);
  private panelOportunidades = viewChild(Oportunidades);

  readonly menu: MenuItem[] = [
    { id: 'resumen', nombre: 'Resumen' },
    { id: 'perfil', nombre: 'Mi perfil' },
    { id: 'oportunidades', nombre: 'Oportunidades' },
    { id: 'cotizaciones', nombre: 'Mis cotizaciones' },
    { id: 'contrataciones', nombre: 'Mis contrataciones' },
    { id: 'reputacion', nombre: 'Mi reputación' }
  ];

  seccion = signal('resumen');
  perfil = signal<PerfilProfesional | null>(null);
  categorias = signal<Categoria[]>([]);
  solicitudes = signal<Solicitud[]>([]);
  cotizaciones = signal<Cotizacion[]>([]);
  contrataciones = signal<Contratacion[]>([]);
  calificaciones = signal<Calificacion[]>([]);

  cargando = signal(false);
  procesando = signal(false);
  mensaje = signal('');
  tipoMensaje = signal<'success' | 'error' | 'info'>('info');
  mensajeConfirmacion = signal('');

  private accionPendiente: (() => void) | null = null;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    if (this.cargando()) return;

    this.cargando.set(true);

    forkJoin({
      categorias: this.categoriaService.listarActivas(),
      perfil: this.profesionalService.obtenerPerfil().pipe(
        catchError((error: HttpErrorResponse) =>
          error.status === 404 ? of(null) : throwError(() => error)
        )
      )
    }).pipe(
      switchMap(({ categorias, perfil }) => {
        this.categorias.set(categorias);
        this.perfil.set(perfil);

        if (!perfil) {
          return of({
            solicitudes: [] as Solicitud[],
            cotizaciones: [] as Cotizacion[],
            contrataciones: [] as Contratacion[],
            calificaciones: [] as Calificacion[]
          });
        }

        return forkJoin({
          solicitudes: this.solicitudService.listarDisponibles(),
          cotizaciones: this.cotizacionService.listarMisCotizaciones(),
          contrataciones: this.contratacionService.listarProfesional(),
          calificaciones: this.calificacionService.listarPorProfesional(perfil.id)
        });
      }),
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: datos => {
        this.solicitudes.set(datos.solicitudes);
        this.cotizaciones.set(datos.cotizaciones);
        this.contrataciones.set(datos.contrataciones);
        this.calificaciones.set(datos.calificaciones);
      },
      error: error => this.mostrarError(error)
    });
  }

  cambiarSeccion(seccion: string): void {
    if (this.menu.some(item => item.id === seccion)) {
      this.seccion.set(seccion);
    }
  }

  guardarPerfil(datos: ProfesionalRequest): void {
    const operacion = this.perfil()
      ? this.profesionalService.actualizarPerfil(datos)
      : this.profesionalService.registrarPerfil(datos);

    this.ejecutar(
      operacion,
      'Perfil profesional guardado correctamente.',
      perfil => this.perfil.set(perfil)
    );
  }

  cambiarDisponibilidad(disponible: boolean): void {
    this.confirmar(
      disponible
        ? '¿Deseas activar tu disponibilidad laboral?'
        : '¿Deseas desactivar tu disponibilidad laboral?',
      () => this.ejecutar(
        this.profesionalService.cambiarDisponibilidad(disponible),
        'Disponibilidad actualizada correctamente.'
      )
    );
  }

  enviarCotizacion(datos: CotizacionRequest): void {
    this.ejecutar(
      this.cotizacionService.registrar(datos),
      'Cotización enviada correctamente.',
      () => {
        this.panelOportunidades()?.cerrarFormulario();
        this.seccion.set('cotizaciones');
      }
    );
  }

  iniciarContratacion(contratacion: Contratacion): void {
    this.confirmar(
      `¿Confirmas el inicio del servicio "${contratacion.solicitudTitulo}"?`,
      () => this.ejecutar(
        this.contratacionService.iniciar(contratacion.id),
        'Servicio iniciado correctamente.'
      )
    );
  }

  private confirmar(mensaje: string, accion: () => void): void {
    if (this.procesando() || this.cargando()) return;

    this.mensajeConfirmacion.set(mensaje);
    this.accionPendiente = accion;
    this.dialogo().abrir();
  }

  ejecutarConfirmacion(): void {
    const accion = this.accionPendiente;
    this.accionPendiente = null;
    accion?.();
  }

  cancelarConfirmacion(): void {
    this.accionPendiente = null;
  }

  private ejecutar<T>(
    operacion: Observable<T>,
    mensaje: string,
    despues?: (resultado: T) => void
  ): void {
    if (this.procesando() || this.cargando()) return;

    this.procesando.set(true);
    this.mensaje.set('');

    operacion.pipe(
      finalize(() => this.procesando.set(false))
    ).subscribe({
      next: resultado => {
        despues?.(resultado);
        this.notificar(mensaje, 'success');
        this.cargarDatos();
      },
      error: error => this.mostrarError(error)
    });
  }

  private notificar(
    mensaje: string,
    tipo: 'success' | 'error' | 'info'
  ): void {
    this.tipoMensaje.set(tipo);
    this.mensaje.set(mensaje);
  }

  private mostrarError(error: HttpErrorResponse): void {
    const mensajes: Record<number, string> = {
      0: 'No se pudo conectar con el servidor.',
      400: 'Revisa los datos ingresados.',
      401: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
      403: 'No tienes permisos para realizar esta operación.',
      404: 'No se encontró el recurso solicitado.',
      409: 'La operación presenta un conflicto con los datos existentes.'
    };

    this.notificar(
      error.error?.mensaje ??
      mensajes[error.status] ??
      'No se pudo completar la operación.',
      'error'
    );
  }
}