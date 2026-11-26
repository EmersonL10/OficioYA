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
import { ProfesionalService } from '../../core/services/profesional';
import { SolicitudService } from '../../core/services/solicitud';
import { CotizacionService } from '../../core/services/cotizacion';
import { ContratacionService } from '../../core/services/contratacion';
import { CalificacionService } from '../../core/services/calificacion';

import {
  Categoria,
  Profesional as PerfilProfesional,
  Solicitud,
  Cotizacion,
  Contratacion,
  Calificacion
} from '../../core/models/api.models';

type Seccion =
  | 'resumen'
  | 'perfil'
  | 'solicitudes'
  | 'cotizaciones'
  | 'contrataciones'
  | 'reputacion';

@Component({
  selector: 'app-profesional',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profesional.html',
  styleUrl: './profesional.scss',
})
export class Profesional implements OnInit {

  // Inyección de dependencias
  readonly auth = inject(Auth);

  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly cotizacionService = inject(CotizacionService);
  private readonly contratacionService = inject(ContratacionService);
  private readonly calificacionService = inject(CalificacionService);

  // Navegación y datos
  readonly seccion = signal<Seccion>('resumen');

  readonly perfil = signal<PerfilProfesional | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly solicitudes = signal<Solicitud[]>([]);
  readonly cotizaciones = signal<Cotizacion[]>([]);
  readonly contrataciones = signal<Contratacion[]>([]);
  readonly calificaciones = signal<Calificacion[]>([]);

  // Estados de operación
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly solicitudSeleccionada = signal<Solicitud | null>(null);

  readonly confirmacion = signal<{
    mensaje: string;
    ejecutar: () => void;
  } | null>(null);

  // Indicadores del profesional
  readonly totalOportunidades = computed(
    () => this.solicitudes().length
  );

  readonly cotizacionesPendientes = computed(
    () => this.cotizaciones().filter(
      cotizacion => cotizacion.estado === 'PENDIENTE'
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

  readonly promedio = computed(() => {

    const evaluaciones = this.calificaciones();

    if (evaluaciones.length === 0) {
      return 0;
    }

    const total = evaluaciones.reduce(
      (suma, evaluacion) => suma + evaluacion.puntuacion,
      0
    );

    return total / evaluaciones.length;

  });

  readonly ingresosGenerados = computed(
    () => this.contrataciones()
      .filter(contratacion => contratacion.estado === 'FINALIZADA')
      .reduce((total, contratacion) => total + contratacion.monto, 0)
  );

  // Formulario del perfil profesional
  readonly formularioPerfil = this.fb.group({

    categoriaId: this.fb.control<number | null>(
      null,
      [Validators.required, Validators.min(1)]
    ),

    descripcion: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000),
      Validators.pattern(/\S/)
    ]),

    experienciaAnios: this.fb.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(70)
      ]
    )

  });

  // Formulario de cotizaciones
  readonly formularioCotizacion = this.fb.group({

    monto: this.fb.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(99999999.99)
      ]
    ),

    descripcion: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(2000),
      Validators.pattern(/\S/)
    ]),

    plazoDias: this.fb.control<number | null>(
      null,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(365)
      ]
    )

  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar perfil y categorías
  cargarDatos(): void {

    this.cargando.set(true);

    this.categoriaService.listarActivas().subscribe({

      next: categorias => {

        this.categorias.set(categorias);
        this.cargarPerfil();

      },

      error: respuesta => {

        this.cargando.set(false);
        this.error.set(this.obtenerMensajeError(respuesta));

      }

    });

  }

  private cargarPerfil(): void {

    this.profesionalService.obtenerPerfil().subscribe({

      next: perfil => {

        this.perfil.set(perfil);

        this.formularioPerfil.reset({
          categoriaId: perfil.categoriaId,
          descripcion: perfil.descripcion,
          experienciaAnios: perfil.experienciaAnios
        });

        this.cargarActividad(perfil.id);

      },

      error: respuesta => {

        this.cargando.set(false);

        if (respuesta.status === 404) {

          this.perfil.set(null);
          this.solicitudes.set([]);
          this.cotizaciones.set([]);
          this.contrataciones.set([]);
          this.calificaciones.set([]);

          this.seccion.set('perfil');

          return;
        }

        this.error.set(this.obtenerMensajeError(respuesta));

      }

    });

  }

  // Consultar actividad profesional
  private cargarActividad(profesionalId: number): void {

    forkJoin({

      solicitudes: this.solicitudService.listarDisponibles(),

      cotizaciones: this.cotizacionService.listarMisCotizaciones(),

      contrataciones: this.contratacionService.listarProfesional(),

      calificaciones: this.calificacionService.listarPorProfesional(
        profesionalId
      )

    }).subscribe({

      next: datos => {

        this.solicitudes.set(datos.solicitudes);
        this.cotizaciones.set(datos.cotizaciones);
        this.contrataciones.set(datos.contrataciones);
        this.calificaciones.set(datos.calificaciones);

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

    this.limpiarMensajes();

    if (!this.perfil() && seccion !== 'perfil') {

      this.seccion.set('perfil');

      this.error.set(
        'Primero debes completar tu perfil profesional.'
      );

      return;
    }

    this.seccion.set(seccion);
    this.cerrarCotizacion();

  }

  // Registrar o actualizar perfil
  guardarPerfil(): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();

    if (this.formularioPerfil.invalid) {

      this.formularioPerfil.markAllAsTouched();

      this.error.set(
        'Completa correctamente los datos de tu perfil profesional.'
      );

      return;
    }

    const valores = this.formularioPerfil.getRawValue();

    const datos = {
      categoriaId: valores.categoriaId!,
      descripcion: valores.descripcion.trim(),
      experienciaAnios: valores.experienciaAnios!
    };

    if (datos.descripcion.length < 10) {

      this.error.set(
        'La descripción debe tener al menos 10 caracteres.'
      );

      return;
    }

    if (!Number.isInteger(datos.experienciaAnios)) {

      this.error.set(
        'Los años de experiencia deben ser un número entero.'
      );

      return;
    }

    const existePerfil = this.perfil() !== null;

    const peticion = existePerfil
      ? this.profesionalService.actualizarPerfil(datos)
      : this.profesionalService.registrarPerfil(datos);

    this.ejecutarOperacion(
      peticion,
      existePerfil
        ? 'Perfil actualizado correctamente.'
        : 'Perfil profesional creado correctamente.',
      () => this.seccion.set('resumen')
    );

  }

  // Cambiar disponibilidad profesional
  cambiarDisponibilidad(): void {

    const perfil = this.perfil();

    if (!perfil) {

      this.error.set(
        'Debes completar tu perfil profesional.'
      );

      return;
    }

    const disponible = !perfil.disponible;

    this.solicitarConfirmacion(

      disponible
        ? '¿Deseas activar tu disponibilidad para ofrecer servicios?'
        : '¿Deseas desactivar temporalmente tu disponibilidad?',

      () => this.ejecutarOperacion(

        this.profesionalService.cambiarDisponibilidad(disponible),

        disponible
          ? 'Disponibilidad activada correctamente.'
          : 'Disponibilidad desactivada correctamente.'

      )

    );

  }

  // Verificar si ya existe una cotización
  yaCotizada(solicitudId: number): boolean {

    return this.cotizaciones().some(
      cotizacion => cotizacion.solicitudId === solicitudId
    );

  }

  // Abrir formulario de propuesta económica
  abrirCotizacion(solicitud: Solicitud): void {

    this.limpiarMensajes();

    if (!this.perfil()?.disponible) {

      this.error.set(
        'Activa tu disponibilidad antes de enviar una cotización.'
      );

      return;
    }

    if (this.yaCotizada(solicitud.id)) {

      this.error.set(
        'Ya enviaste una cotización para esta solicitud.'
      );

      return;
    }

    if (solicitud.estado !== 'ABIERTA') {

      this.error.set(
        'Esta solicitud ya no está disponible.'
      );

      return;
    }

    this.solicitudSeleccionada.set(solicitud);

    this.formularioCotizacion.reset({
      monto: solicitud.presupuesto,
      descripcion: '',
      plazoDias: null
    });

  }

  // Registrar cotización
  guardarCotizacion(): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();

    const solicitud = this.solicitudSeleccionada();

    if (!solicitud) {

      this.error.set('Selecciona una solicitud.');

      return;
    }

    if (this.formularioCotizacion.invalid) {

      this.formularioCotizacion.markAllAsTouched();

      this.error.set(
        'Completa correctamente los datos de la cotización.'
      );

      return;
    }

    const valores = this.formularioCotizacion.getRawValue();

    const datos = {
      solicitudId: solicitud.id,
      monto: valores.monto!,
      descripcion: valores.descripcion.trim(),
      plazoDias: valores.plazoDias!
    };

    if (datos.descripcion.length < 10) {

      this.error.set(
        'La propuesta debe tener al menos 10 caracteres.'
      );

      return;
    }

    if (!Number.isInteger(datos.plazoDias)) {

      this.error.set(
        'El plazo de ejecución debe expresarse en días enteros.'
      );

      return;
    }

    if (
      Math.abs(
        datos.monto * 100 - Math.round(datos.monto * 100)
      ) > 0.000001
    ) {

      this.error.set(
        'El monto debe tener como máximo dos decimales.'
      );

      return;
    }

    this.ejecutarOperacion(

      this.cotizacionService.registrar(datos),

      'Cotización enviada correctamente.',

      () => {

        this.cerrarCotizacion();
        this.seccion.set('cotizaciones');

      }

    );

  }

  cerrarCotizacion(): void {

    this.solicitudSeleccionada.set(null);
    this.formularioCotizacion.reset();

  }

  // Iniciar servicio contratado
  iniciarServicio(contratacion: Contratacion): void {

    if (contratacion.estado !== 'PENDIENTE') {

      this.error.set(
        'Solo puedes iniciar contrataciones pendientes.'
      );

      return;
    }

    this.solicitarConfirmacion(

      '¿Confirmas que comenzarás a realizar este servicio?',

      () => this.ejecutarOperacion(

        this.contratacionService.iniciar(contratacion.id),

        'El servicio se ha iniciado correctamente.'

      )

    );

  }

  // Confirmación de operaciones
  solicitarConfirmacion(
    mensaje: string,
    ejecutar: () => void
  ): void {

    if (this.procesando()) {
      return;
    }

    this.limpiarMensajes();

    this.confirmacion.set({
      mensaje,
      ejecutar
    });

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

        this.error.set(
          this.obtenerMensajeError(respuesta)
        );

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
        return 'Revisa los datos ingresados.';

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