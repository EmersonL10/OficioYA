import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import {
  Calificacion,
  CalificacionRequest
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {

  private readonly http = inject(HttpClient);

  registrar(datos: CalificacionRequest) {
    return this.http.post<Calificacion>(
      `${API_URL}/cliente/calificaciones`, datos
    );
  }

  listarPorProfesional(id: number) {
    return this.http.get<Calificacion[]>(
      `${API_URL}/publico/profesionales/${id}/calificaciones`
    );
  }

  obtenerPromedio(id: number) {
    return this.http.get<number>(
      `${API_URL}/publico/profesionales/${id}/promedio`
    );
  }
}