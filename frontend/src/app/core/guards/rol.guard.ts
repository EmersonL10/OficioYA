import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Rol } from '../models/api.models';

export const rolGuard: CanActivateFn = (route) => {

  const auth = inject(Auth);
  const router = inject(Router);

  const rolPermitido = route.data['rol'] as Rol;

  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.tieneRol(rolPermitido)) {
    return true;
  }

  return router.createUrlTree(['/']);
};