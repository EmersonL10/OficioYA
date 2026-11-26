import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {

  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/publico`;

  obtenerSaludo() {
    return this.http.get(`${this.url}/saludo`, {
      responseType: 'text'
    });
  }
}