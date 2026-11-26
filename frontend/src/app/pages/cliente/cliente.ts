import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { CategoriaService } from '../../core/services/categoria';
import { SolicitudService } from '../../core/services/solicitud';
import { CotizacionService } from '../../core/services/cotizacion';
import { ContratacionService } from '../../core/services/contratacion';
import { CalificacionService } from '../../core/services/calificacion';

import {
  Categoria,
  Solicitud,
  Cotizacion,
  Contratacion
} from '../../core/models/api.models';

type Seccion = 'resumen' | 'solicitudes' | 'contrataciones';

@Component({
  selector: 'app-cliente',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss',
})
export class Cliente implements OnInit {

  // Inyección de dependencias
  readonly auth = inject(Auth);

  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly cotizacionService = inject(CotizacionService);
  private readonly contratacionService = inject(ContratacionService);
  private readonly calificacionService = inject(CalificacionService);

  // Estado de navegación
  readonly seccion = signal<Seccion>('resumen');

  // Datos obtenidos del backend
  readonly categorias = signal<Categoria[]>([]);
  readonly solicitudes = signal<Solicitud[]>([]);
  readonly cotizaciones = signal<Cotizacion[]>([]);
  readonly contrataciones = signal<Contratacion[]>([]);

  // Estados de operación
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly cargandoCotizaciones = signal(false);

  readonly error = signal('');
  readonly exito = signal('');

  // Control de formularios
  readonly mostrarFormulario = signal(false);
  readonly solicitudEditada = signal<number | null>(null);
  readonly solicitudSeleccionada = signal<Solicitud | null>(null);
  readonly contratacionSeleccionada = signal<number | null>(null);

  // Confirmación de operaciones
  readonly confirmacion = signal<{
    mensaje: string;
    ejecutar: () => void;
  } | null>(null);

  // Indicadores del panel
  readonly totalSolicitudes = computed(
    () => this.solicitudes().length
  );

  readonly solicitudesAbiertas = computed(
    () => this.solicitudes().filter(
      solicitud => solicitud.estado === 'ABIERTA'
    ).length
  );

  readonly serviciosActivos = computed(
    () => this.contrataciones().filter(
      contratacion =>
        contratacion.estado === 'PENDIENTE' ||
        contratacion.estado === 'EN_PROCESO'
    ).length
  );

  readonly serviciosFinalizados = computed(
    () => this.contrataciones().filter(
      contratacion => contratacion.estado === 'FINALIZADA'
    ).length
  );

  // Formulario de solicitudes
  readonly formularioSolicitud = this.fb.group({

    categoriaId: this.fb.control<number | null>(
      null,
      [Validators.required, Validators.min(1)]
    ),

    titulo: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(150),
      Validators.pattern(/\S/)
    ]),

    descripcion: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(2000),
      Validators.pattern(/\S/)
    ]),

    direccion: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(255),
      Validators.pattern(/\S/)
    ]),

    presupuesto: this.fb.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(99999999.99)
      ]
    )

  });

  // Formulario de calificaciones
  readonly formularioCalificacion = this.fb.nonNullable.group({

    puntuacion: [
      5,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]
    ],

    comentario: [
      '',
      Validators.maxLength(1000)
    ]

  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar información del cliente
  cargarDatos(): void {

    this.cargando.set(true);

    forkJoin({
      categorias: this.categoriaService.listarActivas(),
      solicitudes: this.solicitudService.listarMisSolicitudes(),
      contrataciones: this.contratacionService.listarCliente()
    }).subscribe({

      next: datos => {

        this.categorias.set(datos.categorias);
        this.solicitudes.set(datos.solicitudes);
        this.contrataciones.set(datos.contrataciones);

        this.cargando.set(false);

      },

      error: respuesta => {

        this.cargando.set(false);
        this.error.set(this.obtenerMensajeError(respuesta));

      }

    });
  }

  // Navegación interna
  cambiarSeccion(seccion: Seccion): void {

    this.seccion.set(seccion);
    this.limpiarMensajes();

    this.mostrarFormulario.set(false);
    this.solicitudSeleccionada.set(null);
    this.contratacionSeleccionada.set(null);

  }

  // Abrir formulario de nueva solicitud
  nuevaSolicitud(): void {

    this.cambiarSeccion('solicitudes');

    this.solicitudEditada.set(null);
    this.formularioSolicitud.reset();
    this.mostrarFormulario.set(true);

  }

  // Cargar una solicitud para editarla
  editarSolicitud(solicitud: Solicitud): void {

    this.limpiarMensajes();

    if (solicitud.estado !== 'ABIERTA') {

      this.error.set(
        'Solo puedes editar solicitudes que se encuentren abiertas.'
      );

      return;
    }

    this.solicitudEditada.set(solicitud.id);

    this.formularioSolicitud.reset({
      categoriaId: solicitud.categoriaId,
      titulo: solicitud.titulo,
      descripcion: solicitud.descripcion,
      direccion: solicitud.direccion ?? '',
      presupuesto: solicitud.presupuesto
    });

    this.solicitudSeleccionada.set(null);
    this.mostrarFormulario.set(true);

  }

  // Registrar o actualizar solicitud
  guardarSolicitud(): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();

    if (this.formularioSolicitud.invalid) {

      this.formularioSolicitud.markAllAsTouched();

      this.error.set(
        'Completa correctamente los campos de la solicitud.'
      );

      return;
    }

    const valores = this.formularioSolicitud.getRawValue();

    const datos = {
      categoriaId: valores.categoriaId!,
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      direccion: valores.direccion.trim(),
      presupuesto: valores.presupuesto!
    };

    if (datos.titulo.length < 5 || datos.descripcion.length < 10) {

      this.error.set(
        'El título debe tener al menos 5 caracteres y la descripción 10.'
      );

      return;
    }

    if (
      Math.abs(
        datos.presupuesto * 100 -
        Math.round(datos.presupuesto * 100)
      ) > 0.000001
    ) {

      this.error.set(
        'El presupuesto debe tener como máximo dos decimales.'
      );

      return;
    }

    const id = this.solicitudEditada();

    const peticion = id === null
      ? this.solicitudService.registrar(datos)
      : this.solicitudService.actualizar(id, datos);

    this.ejecutarOperacion(
      peticion,
      id === null
        ? 'Solicitud publicada correctamente.'
        : 'Solicitud actualizada correctamente.',
      () => this.cerrarFormulario()
    );

  }

  cerrarFormulario(): void {

    this.mostrarFormulario.set(false);
    this.solicitudEditada.set(null);
    this.formularioSolicitud.reset();

  }

  // Cancelar solicitud
  cancelarSolicitud(solicitud: Solicitud): void {

    this.solicitarConfirmacion(
      '¿Estás seguro de que deseas cancelar esta solicitud?',
      () => this.ejecutarOperacion(
        this.solicitudService.cancelar(solicitud.id),
        'Solicitud cancelada correctamente.',
        () => this.solicitudSeleccionada.set(null)
      )
    );

  }

  // Consultar cotizaciones recibidas
  verCotizaciones(solicitud: Solicitud): void {

    if (this.cargandoCotizaciones()) {
      return;
    }

    this.limpiarMensajes();

    this.mostrarFormulario.set(false);
    this.solicitudSeleccionada.set(solicitud);
    this.cotizaciones.set([]);
    this.cargandoCotizaciones.set(true);

    this.cotizacionService.listarPorSolicitud(
      solicitud.id
    ).subscribe({

      next: cotizaciones => {

        if (this.solicitudSeleccionada()?.id === solicitud.id) {
          this.cotizaciones.set(cotizaciones);
        }

        this.cargandoCotizaciones.set(false);

      },

      error: respuesta => {

        this.cargandoCotizaciones.set(false);
        this.error.set(this.obtenerMensajeError(respuesta));

      }

    });

  }

  cerrarCotizaciones(): void {

    this.solicitudSeleccionada.set(null);
    this.cotizaciones.set([]);

  }

  // Aceptar una cotización
  contratar(cotizacion: Cotizacion): void {

    this.solicitarConfirmacion(
      `¿Deseas contratar a ${cotizacion.profesionalNombre} por S/ ${cotizacion.monto.toFixed(2)}?`,
      () => this.ejecutarOperacion(
        this.contratacionService.contratar({
          cotizacionId: cotizacion.id
        }),
        'Servicio contratado correctamente.',
        () => {

          this.cerrarCotizaciones();
          this.seccion.set('contrataciones');

        }
      )
    );

  }

  // Finalizar servicio
  finalizarServicio(contratacion: Contratacion): void {

    this.solicitarConfirmacion(
      '¿Confirmas que el profesional ha completado el servicio?',
      () => this.ejecutarOperacion(
        this.contratacionService.finalizar(contratacion.id),
        'Servicio finalizado correctamente.'
      )
    );

  }

  // Cancelar contratación
  cancelarContratacion(contratacion: Contratacion): void {

    this.solicitarConfirmacion(
      '¿Estás seguro de que deseas cancelar esta contratación?',
      () => this.ejecutarOperacion(
        this.contratacionService.cancelar(contratacion.id),
        'Contratación cancelada correctamente.'
      )
    );

  }

  // Abrir formulario de calificación
  abrirCalificacion(contratacion: Contratacion): void {

    this.limpiarMensajes();

    if (contratacion.estado !== 'FINALIZADA') {

      this.error.set(
        'Solo puedes calificar servicios finalizados.'
      );

      return;
    }

    this.contratacionSeleccionada.set(contratacion.id);

    this.formularioCalificacion.reset({
      puntuacion: 5,
      comentario: ''
    });

  }

  guardarCalificacion(): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();

    const contratacionId = this.contratacionSeleccionada();

    if (
      this.formularioCalificacion.invalid ||
      contratacionId === null
    ) {

      this.formularioCalificacion.markAllAsTouched();

      this.error.set(
        'Selecciona una puntuación válida entre 1 y 5.'
      );

      return;
    }

    const datos = this.formularioCalificacion.getRawValue();

    if (!Number.isInteger(datos.puntuacion)) {

      this.error.set('La puntuación debe ser un número entero.');

      return;
    }

    this.ejecutarOperacion(
      this.calificacionService.registrar({
        contratacionId,
        puntuacion: datos.puntuacion,
        comentario: datos.comentario.trim()
      }),
      'Calificación registrada correctamente.',
      () => this.cerrarCalificacion()
    );

  }

  cerrarCalificacion(): void {

    this.contratacionSeleccionada.set(null);
    this.formularioCalificacion.reset();

  }

  // Confirmación de operaciones importantes
  solicitarConfirmacion(
    mensaje: string,
    ejecutar: () => void
  ): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();
    this.confirmacion.set({ mensaje, ejecutar });

  }

  confirmarOperacion(): void {

    const operacion = this.confirmacion();

    if (!operacion || this.procesando()) {
      return;
    }

    this.confirmacion.set(null);
    operacion.ejecutar();

  }

  cancelarConfirmacion(): void {
    this.confirmacion.set(null);
  }

  // Centralizar operaciones HTTP
  private ejecutarOperacion<T>(
    peticion: Observable<T>,
    mensaje: string,
    alCompletar?: () => void
  ): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();
    this.procesando.set(true);

    peticion.subscribe({

      next: () => {

        this.procesando.set(false);
        this.exito.set(mensaje);

        alCompletar?.();

        this.cargarDatos();

      },

      error: respuesta => {

        this.procesando.set(false);
        this.error.set(this.obtenerMensajeError(respuesta));

      }

    });

  }

  limpiarMensajes(): void {

    this.error.set('');
    this.exito.set('');

  }

  private obtenerMensajeError(respuesta: {
    status: number;
    error?: { mensaje?: string };
  }): string {

    switch (respuesta.status) {

      case 0:
        return 'No se pudo conectar con el servidor.';

      case 400:
        return 'Revisa los datos ingresados e inténtalo nuevamente.';

      case 401:
        return 'Tu sesión no es válida. Vuelve a iniciar sesión.';

      case 403:
        return 'No tienes permiso para realizar esta operación.';

      case 404:
        return 'No se encontró el recurso solicitado.';

      case 409:
        return respuesta.error?.mensaje ||
          'La operación no está permitida en el estado actual.';

      default:
        return 'Ocurrió un error. Inténtalo nuevamente.';

    }

  }

}