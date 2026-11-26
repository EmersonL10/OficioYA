import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import {
  Profesional,
  ProfesionalRequest
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalService {

  private readonly http = inject(HttpClient);

  listarDisponibles() {
    return this.http.get<Profesional[]>(
      `${API_URL}/publico/profesionales`
    );
  }

  buscarPorCategoria(categoriaId: number) {
    return this.http.get<Profesional[]>(
      `${API_URL}/publico/profesionales/categoria/${categoriaId}`
    );
  }

  registrarPerfil(datos: ProfesionalRequest) {
    return this.http.post<Profesional>(
      `${API_URL}/profesional/perfil`, datos
    );
  }

  obtenerPerfil() {
    return this.http.get<Profesional>(
      `${API_URL}/profesional/perfil`
    );
  }

  actualizarPerfil(datos: ProfesionalRequest) {
    return this.http.put<Profesional>(
      `${API_URL}/profesional/perfil`, datos
    );
  }

  cambiarDisponibilidad(disponible: boolean) {
    return this.http.patch<Profesional>(
      `${API_URL}/profesional/perfil/disponibilidad`,
      null,
      { params: { disponible } }
    );
  }
}