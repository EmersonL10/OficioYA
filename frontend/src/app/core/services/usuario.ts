import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';
import { Usuario } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Usuario[]>(
      `${API_URL}/admin/usuarios`
    );
  }

  buscarPorId(id: number) {
    return this.http.get<Usuario>(
      `${API_URL}/admin/usuarios/${id}`
    );
  }
}