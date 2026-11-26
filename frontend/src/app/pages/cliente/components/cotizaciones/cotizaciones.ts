import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Cotizacion, Solicitud } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-cotizaciones',
  imports: [DatePipe, DecimalPipe, Status],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.scss'
})
export class Cotizaciones {
  solicitud = input.required<Solicitud>();
  cotizaciones = input.required<Cotizacion[]>();
  cargando = input(false);

  contratar = output<Cotizacion>();
  cerrar = output<void>();
}