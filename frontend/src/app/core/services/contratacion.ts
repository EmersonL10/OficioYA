import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import {
  Contratacion,
  ContratacionRequest
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ContratacionService {

  private readonly http = inject(HttpClient);

  contratar(datos: ContratacionRequest) {
    return this.http.post<Contratacion>(
      `${API_URL}/cliente/contrataciones`, datos
    );
  }

  listarCliente() {
    return this.http.get<Contratacion[]>(
      `${API_URL}/cliente/contrataciones`
    );
  }

  listarProfesional() {
    return this.http.get<Contratacion[]>(
      `${API_URL}/profesional/contrataciones`
    );
  }

  iniciar(id: number) {
    return this.http.patch<Contratacion>(
      `${API_URL}/profesional/contrataciones/${id}/iniciar`,
      null
    );
  }

  finalizar(id: number) {
    return this.http.patch<Contratacion>(
      `${API_URL}/cliente/contrataciones/${id}/finalizar`,
      null
    );
  }

  cancelar(id: number) {
    return this.http.patch<Contratacion>(
      `${API_URL}/cliente/contrataciones/${id}/cancelar`,
      null
    );
  }
}