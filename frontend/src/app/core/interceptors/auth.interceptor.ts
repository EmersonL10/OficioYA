import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { API_URL } from '../api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(Auth);
  const token = auth.obtenerToken();

  if (token && req.url.startsWith(`${API_URL}/`)) {

    const peticion = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(peticion);
  }

  return next(req);
};