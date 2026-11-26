import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contratacion, CalificacionRequest } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';
import { Notification } from '../../../../shared/components/notification/notification';

@Component({
  selector: 'app-contrataciones',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, Status, Notification],
  templateUrl: './contrataciones.html',
  styleUrl: './contrataciones.scss'
})
export class Contrataciones {
  private fb = inject(FormBuilder);

  contrataciones = input.required<Contratacion[]>();
  procesando = input(false);

  finalizar = output<Contratacion>();
  cancelar = output<Contratacion>();
  calificar = output<CalificacionRequest>();

  seleccionada = signal<number | null>(null);
  error = signal('');

  formulario = this.fb.nonNullable.group({
    puntuacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comentario: ['', Validators.maxLength(1000)]
  });

  abrirCalificacion(contratacion: Contratacion): void {
    this.error.set('');

    if (contratacion.estado !== 'FINALIZADA') {
      this.error.set('Solo puedes calificar servicios finalizados.');
      return;
    }

    this.seleccionada.set(contratacion.id);
    this.formulario.reset({ puntuacion: 5, comentario: '' });
  }

  enviarCalificacion(): void {
    if (this.procesando()) return;

    this.error.set('');
    const contratacionId = this.seleccionada();

    if (this.formulario.invalid || contratacionId === null) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa correctamente la calificación.');
      return;
    }

    const { puntuacion, comentario } = this.formulario.getRawValue();

    if (!Number.isInteger(puntuacion)) {
      this.error.set('Selecciona una puntuación entera entre 1 y 5.');
      return;
    }

    this.calificar.emit({
      contratacionId,
      puntuacion,
      comentario: comentario.trim()
    });
  }

  cerrarCalificacion(): void {
    this.seleccionada.set(null);
    this.formulario.reset();
    this.error.set('');
  }
}