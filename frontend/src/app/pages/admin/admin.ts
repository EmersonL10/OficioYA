import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, Observable } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { UsuarioService } from '../../core/services/usuario';
import { CategoriaService } from '../../core/services/categoria';
import { Usuario, Categoria, CategoriaRequest } from '../../core/models/api.models';

import { DashboardLayout, MenuItem } from '../../shared/components/dashboard-layout/dashboard-layout';
import { Notification } from '../../shared/components/notification/notification';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

import { Resumen } from './components/resumen/resumen';
import { Usuarios } from './components/usuarios/usuarios';
import { Categorias } from './components/categorias/categorias';

@Component({
  selector: 'app-admin',
  imports: [
    DashboardLayout, Notification, ConfirmDialog,
    Resumen, Usuarios, Categorias
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  readonly auth = inject(Auth);

  private usuarioService = inject(UsuarioService);
  private categoriaService = inject(CategoriaService);

  private dialogo = viewChild.required(ConfirmDialog);
  private panelCategorias = viewChild(Categorias);

  readonly menu: MenuItem[] = [
    { id: 'resumen', nombre: 'Resumen' },
    { id: 'usuarios', nombre: 'Gestión de usuarios' },
    { id: 'categorias', nombre: 'Gestión de categorías' }
  ];

  seccion = signal('resumen');
  usuarios = signal<Usuario[]>([]);
  categorias = signal<Categoria[]>([]);

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
      usuarios: this.usuarioService.listar(),
      categorias: this.categoriaService.listarTodas()
    }).pipe(
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: datos => {
        this.usuarios.set(datos.usuarios);
        this.categorias.set(datos.categorias);
      },
      error: error => this.mostrarError(error)
    });
  }

  cambiarSeccion(seccion: string): void {
    if (this.menu.some(item => item.id === seccion)) {
      this.seccion.set(seccion);
    }
  }

  guardarCategoria(evento: {
    id: number | null;
    datos: CategoriaRequest;
  }): void {
    const { id, datos } = evento;

    const operacion = id === null
      ? this.categoriaService.registrar(datos)
      : this.categoriaService.actualizar(id, datos);

    this.ejecutar(
      operacion,
      id === null
        ? 'Categoría registrada correctamente.'
        : 'Categoría actualizada correctamente.',
      () => this.panelCategorias()?.cerrarFormulario()
    );
  }

  cambiarEstadoCategoria(categoria: Categoria): void {
    const accion = categoria.activo ? 'desactivar' : 'activar';

    this.confirmar(
      `¿Deseas ${accion} la categoría "${categoria.nombre}"?`,
      () => {
        const operacion = categoria.activo
          ? this.categoriaService.desactivar(categoria.id)
          : this.categoriaService.activar(categoria.id);

        this.ejecutar(
          operacion,
          categoria.activo
            ? 'Categoría desactivada correctamente.'
            : 'Categoría activada correctamente.'
        );
      }
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
      403: 'No tienes permisos administrativos.',
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