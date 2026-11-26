import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from '../api.config';
import {
  Usuario,
  RegistroRequest,
  LoginRequest,
  LoginResponse,
  Rol
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/auth`;

  private readonly usuarioActual = signal<Usuario | null>(
    this.recuperarUsuario()
  );

  readonly usuario = this.usuarioActual.asReadonly();

  registrar(datos: RegistroRequest, profesional = false) {
    const ruta = profesional ? 'registro-profesional' : 'registro';

    return this.http.post<Usuario>(
      `${this.url}/${ruta}`, datos
    );
  }

  login(datos: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${this.url}/login`, datos
    ).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  loginAdmin(datos: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${this.url}/login-admin`, datos
    ).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  obtenerPerfil() {
    return this.http.get<Usuario>(`${this.url}/me`).pipe(
      tap(usuario => {
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
        this.usuarioActual.set(usuario);
      })
    );
  }

  obtenerToken(): string | null {
    return sessionStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.usuario();
  }

  tieneRol(rol: Rol): boolean {
    return this.usuario()?.rol === rol;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.usuarioActual.set(null);
  }

  private guardarSesion(respuesta: LoginResponse): void {
    sessionStorage.setItem('token', respuesta.token);
    sessionStorage.setItem(
      'usuario', JSON.stringify(respuesta.usuario)
    );

    this.usuarioActual.set(respuesta.usuario);
  }

  private recuperarUsuario(): Usuario | null {
    try {
      const datos = sessionStorage.getItem('usuario');
      return datos ? JSON.parse(datos) : null;
    } catch {
      return null;
    }
  }
}