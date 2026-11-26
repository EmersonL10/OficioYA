import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import { Categoria, CategoriaRequest } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly http = inject(HttpClient);

  listarActivas() {
    return this.http.get<Categoria[]>(
      `${API_URL}/publico/categorias`
    );
  }

  listarTodas() {
    return this.http.get<Categoria[]>(
      `${API_URL}/admin/categorias`
    );
  }

  buscarPorId(id: number) {
    return this.http.get<Categoria>(
      `${API_URL}/admin/categorias/${id}`
    );
  }

  registrar(datos: CategoriaRequest) {
    return this.http.post<Categoria>(
      `${API_URL}/admin/categorias`, datos
    );
  }

  actualizar(id: number, datos: CategoriaRequest) {
    return this.http.put<Categoria>(
      `${API_URL}/admin/categorias/${id}`, datos
    );
  }

  desactivar(id: number) {
    return this.http.delete<void>(
      `${API_URL}/admin/categorias/${id}`
    );
  }

  activar(id: number) {
    return this.http.patch<void>(
      `${API_URL}/admin/categorias/${id}/activar`, null
    );
  }
}