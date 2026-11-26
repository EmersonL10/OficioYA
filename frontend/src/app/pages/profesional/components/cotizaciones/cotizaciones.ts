import { Component, computed, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Cotizacion, EstadoCotizacion } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-cotizaciones',
  imports: [DatePipe, DecimalPipe, Status],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.scss'
})
export class Cotizaciones {
  cotizaciones = input.required<Cotizacion[]>();

  navegar = output<string>();

  filtro = signal<EstadoCotizacion | 'TODAS'>('TODAS');

  readonly filtros: { valor: EstadoCotizacion | 'TODAS'; nombre: string }[] = [
    { valor: 'TODAS', nombre: 'Todas' },
    { valor: 'PENDIENTE', nombre: 'Pendientes' },
    { valor: 'ACEPTADA', nombre: 'Aceptadas' },
    { valor: 'RECHAZADA', nombre: 'Rechazadas' }
  ];

  cotizacionesFiltradas = computed(() =>
    this.cotizaciones().filter(c =>
      this.filtro() === 'TODAS' || c.estado === this.filtro()
    )
  );

  contar(estado: EstadoCotizacion | 'TODAS'): number {
    return estado === 'TODAS'
      ? this.cotizaciones().length
      : this.cotizaciones().filter(c => c.estado === estado).length;
  }
}