import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { forkJoin, Observable, finalize } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { CategoriaService } from '../../core/services/categoria';
import { SolicitudService } from '../../core/services/solicitud';
import { CotizacionService } from '../../core/services/cotizacion';
import { ContratacionService } from '../../core/services/contratacion';
import { CalificacionService } from '../../core/services/calificacion';

import {
  Categoria, Solicitud, SolicitudRequest, Cotizacion,
  Contratacion, CalificacionRequest
} from '../../core/models/api.models';

import { DashboardLayout, MenuItem } from '../../shared/components/dashboard-layout/dashboard-layout';
import { Notification } from '../../shared/components/notification/notification';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

import { Resumen } from './components/resumen/resumen';
import { Solicitudes } from './components/solicitudes/solicitudes';
import { Cotizaciones } from './components/cotizaciones/cotizaciones';
import { Contrataciones } from './components/contrataciones/contrataciones';

@Component({
  selector: 'app-cliente',
  imports: [
    DashboardLayout, Notification, ConfirmDialog,
    Resumen, Solicitudes, Cotizaciones, Contrataciones
  ],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss'
})
export class Cliente implements OnInit {
  readonly auth = inject(Auth);

  private categoriaService = inject(CategoriaService);
  private solicitudService = inject(SolicitudService);
  private cotizacionService = inject(CotizacionService);
  private contratacionService = inject(ContratacionService);
  private calificacionService = inject(CalificacionService);

  private dialogo = viewChild.required(ConfirmDialog);
  private panelSolicitudes = viewChild(Solicitudes);
  private panelContrataciones = viewChild(Contrataciones);

  readonly menu: MenuItem[] = [
    { id: 'resumen', nombre: 'Resumen' },
    { id: 'solicitudes', nombre: 'Mis solicitudes' },
    { id: 'cotizaciones', nombre: 'Cotizaciones' },
    { id: 'contrataciones', nombre: 'Mis contrataciones' }
  ];

  seccion = signal('resumen');
  categorias = signal<Categoria[]>([]);
  solicitudes = signal<Solicitud[]>([]);
  cotizaciones = signal<Cotizacion[]>([]);
  contrataciones = signal<Contratacion[]>([]);
  solicitudSeleccionada = signal<Solicitud | null>(null);

  cargando = signal(false);
  cargandoCotizaciones = signal(false);
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
      solicitudes: this.solicitudService.listarMisSolicitudes(),
      contrataciones: this.contratacionService.listarCliente()
    }).pipe(
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: datos => {
        this.categorias.set(datos.categorias);
        this.solicitudes.set(datos.solicitudes);
        this.contrataciones.set(datos.contrataciones);

        const id = this.solicitudSeleccionada()?.id;

        if (id !== undefined) {
          this.solicitudSeleccionada.set(
            datos.solicitudes.find(s => s.id === id) ?? null
          );
        }
      },
      error: error => this.mostrarError(error)
    });
  }

  cambiarSeccion(seccion: string): void {
    this.seccion.set(seccion);
  }

  guardarSolicitud(evento: {
    id: number | null;
    datos: SolicitudRequest;
  }): void {
    const operacion = evento.id === null
      ? this.solicitudService.registrar(evento.datos)
      : this.solicitudService.actualizar(evento.id, evento.datos);

    this.ejecutar(
      operacion,
      'Solicitud guardada correctamente.',
      () => this.panelSolicitudes()?.cerrarFormulario()
    );
  }

  cancelarSolicitud(solicitud: Solicitud): void {
    this.confirmar(
      `¿Deseas cancelar la solicitud "${solicitud.titulo}"?`,
      () => this.ejecutar(
        this.solicitudService.cancelar(solicitud.id),
        'Solicitud cancelada correctamente.'
      )
    );
  }

  verCotizaciones(solicitud: Solicitud): void {
    if (this.cargandoCotizaciones()) return;

    this.solicitudSeleccionada.set(solicitud);
    this.cotizaciones.set([]);
    this.seccion.set('cotizaciones');
    this.cargandoCotizaciones.set(true);

    this.cotizacionService.listarPorSolicitud(solicitud.id).pipe(
      finalize(() => this.cargandoCotizaciones.set(false))
    ).subscribe({
      next: datos => this.cotizaciones.set(datos),
      error: error => this.mostrarError(error)
    });
  }

  contratar(cotizacion: Cotizacion): void {
    this.confirmar(
      `¿Deseas contratar a ${cotizacion.profesionalNombre} por S/ ${cotizacion.monto.toFixed(2)}?`,
      () => this.ejecutar(
        this.contratacionService.contratar({
          cotizacionId: cotizacion.id
        }),
        'Profesional contratado correctamente.',
        () => {
          this.solicitudSeleccionada.set(null);
          this.cotizaciones.set([]);
          this.seccion.set('contrataciones');
        }
      )
    );
  }

  finalizarContratacion(contratacion: Contratacion): void {
    this.confirmar(
      '¿Confirmas que el profesional ha completado el servicio?',
      () => this.ejecutar(
        this.contratacionService.finalizar(contratacion.id),
        'Servicio finalizado correctamente.'
      )
    );
  }

  cancelarContratacion(contratacion: Contratacion): void {
    this.confirmar(
      '¿Deseas cancelar esta contratación?',
      () => this.ejecutar(
        this.contratacionService.cancelar(contratacion.id),
        'Contratación cancelada correctamente.'
      )
    );
  }

  calificar(datos: CalificacionRequest): void {
    this.ejecutar(
      this.calificacionService.registrar(datos),
      'Calificación registrada correctamente.',
      () => this.panelContrataciones()?.cerrarCalificacion()
    );
  }

  private confirmar(mensaje: string, accion: () => void): void {
    if (this.procesando()) return;

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
    despues?: () => void
  ): void {
    if (this.procesando()) return;

    this.procesando.set(true);
    this.mensaje.set('');

    operacion.pipe(
      finalize(() => this.procesando.set(false))
    ).subscribe({
      next: () => {
        despues?.();
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

  private mostrarError(error: any): void {
    const mensaje = error.status === 0
      ? 'No se pudo conectar con el servidor.'
      : error.error?.mensaje ?? (
        error.status === 401
          ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
          : error.status === 403
            ? 'No tienes permisos para realizar esta operación.'
            : 'No se pudo completar la operación.'
      );

    this.notificar(mensaje, 'error');
  }
}