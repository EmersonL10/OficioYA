import { Component, computed, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Contratacion, EstadoContratacion } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-contrataciones',
  imports: [DatePipe, DecimalPipe, Status],
  templateUrl: './contrataciones.html',
  styleUrl: './contrataciones.scss'
})
export class Contrataciones {
  contrataciones = input.required<Contratacion[]>();
  procesando = input(false);

  iniciar = output<Contratacion>();
  navegar = output<string>();

  filtro = signal<EstadoContratacion | 'TODAS'>('TODAS');

  readonly filtros: { valor: EstadoContratacion | 'TODAS'; nombre: string }[] = [
    { valor: 'TODAS', nombre: 'Todas' },
    { valor: 'PENDIENTE', nombre: 'Pendientes' },
    { valor: 'EN_PROCESO', nombre: 'En proceso' },
    { valor: 'FINALIZADA', nombre: 'Finalizadas' },
    { valor: 'CANCELADA', nombre: 'Canceladas' }
  ];

  contratacionesFiltradas = computed(() =>
    this.contrataciones().filter(c =>
      this.filtro() === 'TODAS' || c.estado === this.filtro()
    )
  );

  contar(estado: EstadoContratacion | 'TODAS'): number {
    return estado === 'TODAS'
      ? this.contrataciones().length
      : this.contrataciones().filter(c => c.estado === estado).length;
  }

  iniciarServicio(contratacion: Contratacion): void {
    if (this.procesando() || contratacion.estado !== 'PENDIENTE') return;

    this.iniciar.emit(contratacion);
  }
}