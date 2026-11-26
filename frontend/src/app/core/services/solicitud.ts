import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import { Solicitud, SolicitudRequest } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private readonly http = inject(HttpClient);

  registrar(datos: SolicitudRequest) {
    return this.http.post<Solicitud>(
      `${API_URL}/cliente/solicitudes`, datos
    );
  }

  listarMisSolicitudes() {
    return this.http.get<Solicitud[]>(
      `${API_URL}/cliente/solicitudes`
    );
  }

  buscarPorId(id: number) {
    return this.http.get<Solicitud>(
      `${API_URL}/cliente/solicitudes/${id}`
    );
  }

  actualizar(id: number, datos: SolicitudRequest) {
    return this.http.put<Solicitud>(
      `${API_URL}/cliente/solicitudes/${id}`, datos
    );
  }

  cancelar(id: number) {
    return this.http.delete<void>(
      `${API_URL}/cliente/solicitudes/${id}`
    );
  }

  listarDisponibles() {
    return this.http.get<Solicitud[]>(
      `${API_URL}/profesional/solicitudes`
    );
  }
}