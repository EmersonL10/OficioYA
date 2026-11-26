import { Component, computed, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Calificacion, Profesional } from '../../../../core/models/api.models';

@Component({
  selector: 'app-reputacion',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './reputacion.html',
  styleUrl: './reputacion.scss'
})
export class Reputacion {
  perfil = input.required<Profesional | null>();
  calificaciones = input.required<Calificacion[]>();

  navegar = output<string>();

  total = computed(() => this.calificaciones().length);

  promedio = computed(() => {
    const registros = this.calificaciones();

    return registros.length
      ? registros.reduce((suma, c) => suma + c.puntuacion, 0) / registros.length
      : 0;
  });

  distribucion = computed(() =>
    [5, 4, 3, 2, 1].map(puntuacion => {
      const cantidad = this.calificaciones().filter(
        c => c.puntuacion === puntuacion
      ).length;

      return {
        puntuacion,
        cantidad,
        porcentaje: this.total() ? cantidad * 100 / this.total() : 0
      };
    })
  );

  recientes = computed(() =>
    [...this.calificaciones()].sort(
      (a, b) => b.fechaCalificacion.localeCompare(a.fechaCalificacion)
    )
  );
}