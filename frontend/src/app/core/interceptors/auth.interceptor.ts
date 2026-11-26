import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { API_URL } from '../api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(Auth);

  const rutasPublicas = [
    `${API_URL}/auth/login`,
    `${API_URL}/auth/login-admin`,
    `${API_URL}/auth/registro`,
    `${API_URL}/auth/registro-profesional`
  ];

  const esRutaPublica =
    rutasPublicas.includes(req.url) ||
    req.url.startsWith(`${API_URL}/publico/`);

  if (esRutaPublica || !req.url.startsWith(`${API_URL}/`)) {
    return next(req);
  }

  const token = auth.obtenerToken();

  if (!token) {
    return next(req);
  }

  const peticion = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(peticion);
};