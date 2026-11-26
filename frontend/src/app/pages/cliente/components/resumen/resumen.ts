import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Solicitud, Contratacion } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-resumen',
  imports: [DecimalPipe, Status],
  templateUrl: './resumen.html',
  styleUrl: './resumen.scss'
})
export class Resumen {
  nombre = input.required<string>();
  solicitudes = input.required<Solicitud[]>();
  contrataciones = input.required<Contratacion[]>();

  verSolicitudes = output<void>();
  nuevaSolicitud = output<void>();

  indicadores = computed(() => [
    { nombre: 'Total de solicitudes', valor: this.solicitudes().length },
    { nombre: 'Solicitudes abiertas', valor: this.solicitudes().filter(s => s.estado === 'ABIERTA').length },
    { nombre: 'Servicios activos', valor: this.contrataciones().filter(c => c.estado === 'PENDIENTE' || c.estado === 'EN_PROCESO').length },
    { nombre: 'Servicios finalizados', valor: this.contrataciones().filter(c => c.estado === 'FINALIZADA').length }
  ]);

  recientes = computed(() => this.solicitudes().slice(0, 5));
}