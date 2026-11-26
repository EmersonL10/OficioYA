import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import {
  Cotizacion,
  CotizacionRequest
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  private readonly http = inject(HttpClient);

  registrar(datos: CotizacionRequest) {
    return this.http.post<Cotizacion>(
      `${API_URL}/profesional/cotizaciones`, datos
    );
  }

  listarMisCotizaciones() {
    return this.http.get<Cotizacion[]>(
      `${API_URL}/profesional/cotizaciones`
    );
  }

  listarPorSolicitud(id: number) {
    return this.http.get<Cotizacion[]>(
      `${API_URL}/cliente/solicitudes/${id}/cotizaciones`
    );
  }
}