import { Component, computed, input, output } from '@angular/core';
import { Profesional, Solicitud, Cotizacion, Contratacion } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-resumen',
  imports: [Status],
  templateUrl: './resumen.html',
  styleUrl: './resumen.scss'
})
export class Resumen {
  nombre = input.required<string>();
  perfil = input.required<Profesional | null>();
  solicitudes = input.required<Solicitud[]>();
  cotizaciones = input.required<Cotizacion[]>();
  contrataciones = input.required<Contratacion[]>();

  navegar = output<string>();

  indicadores = computed(() => [
    {
      nombre: 'Oportunidades disponibles',
      valor: this.solicitudes().length
    },
    {
      nombre: 'Cotizaciones enviadas',
      valor: this.cotizaciones().length
    },
    {
      nombre: 'Servicios activos',
      valor: this.contrataciones().filter(c =>
        c.estado === 'PENDIENTE' || c.estado === 'EN_PROCESO'
      ).length
    },
    {
      nombre: 'Servicios finalizados',
      valor: this.contrataciones().filter(c =>
        c.estado === 'FINALIZADA'
      ).length
    }
  ]);

  recientes = computed(() => this.contrataciones().slice(0, 5));
}