import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria, Solicitud, SolicitudRequest } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';
import { Notification } from '../../../../shared/components/notification/notification';

@Component({
  selector: 'app-solicitudes',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, Status, Notification],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss'
})
export class Solicitudes {
  private fb = inject(FormBuilder);

  categorias = input.required<Categoria[]>();
  solicitudes = input.required<Solicitud[]>();
  procesando = input(false);

  guardar = output<{ id: number | null; datos: SolicitudRequest }>();
  cancelar = output<Solicitud>();
  verCotizaciones = output<Solicitud>();

  mostrarFormulario = signal(false);
  solicitudEditada = signal<number | null>(null);
  error = signal('');

  formulario = this.fb.group({
    categoriaId: this.fb.control<number | null>(null, Validators.required),
    titulo: this.fb.nonNullable.control('', [
      Validators.required, Validators.minLength(5), Validators.maxLength(150)
    ]),
    descripcion: this.fb.nonNullable.control('', [
      Validators.required, Validators.minLength(10), Validators.maxLength(2000)
    ]),
    direccion: this.fb.nonNullable.control('', [
      Validators.required, Validators.maxLength(255), Validators.pattern(/\S/)
    ]),
    presupuesto: this.fb.control<number | null>(null, [
      Validators.required, Validators.min(0.01), Validators.max(99999999.99)
    ])
  });

  nuevaSolicitud(): void {
    this.error.set('');
    this.solicitudEditada.set(null);
    this.formulario.reset();
    this.mostrarFormulario.set(true);
  }

  editar(solicitud: Solicitud): void {
    this.error.set('');
    this.solicitudEditada.set(solicitud.id);

    this.formulario.reset({
      categoriaId: solicitud.categoriaId,
      titulo: solicitud.titulo,
      descripcion: solicitud.descripcion,
      direccion: solicitud.direccion ?? '',
      presupuesto: solicitud.presupuesto
    });

    this.mostrarFormulario.set(true);
  }

  enviar(): void {
    if (this.procesando()) return;

    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa correctamente los campos de la solicitud.');
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos: SolicitudRequest = {
      categoriaId: valores.categoriaId!,
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      direccion: valores.direccion.trim(),
      presupuesto: valores.presupuesto!
    };

    if (datos.titulo.length < 5 || datos.descripcion.length < 10) {
      this.error.set('Revisa la longitud del título y la descripción.');
      return;
    }

    if (Math.abs(datos.presupuesto * 100 - Math.round(datos.presupuesto * 100)) > 0.000001) {
      this.error.set('El presupuesto debe tener como máximo dos decimales.');
      return;
    }

    this.guardar.emit({ id: this.solicitudEditada(), datos });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.solicitudEditada.set(null);
    this.formulario.reset();
    this.error.set('');
  }
}