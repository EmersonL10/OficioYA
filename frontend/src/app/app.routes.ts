import { Routes } from '@angular/router';

import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Cliente } from './pages/cliente/cliente';
import { Profesional } from './pages/profesional/profesional';
import { Admin } from './pages/admin/admin';
import { AdminLogin } from './pages/admin-login/admin-login';

import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [

  {
    path: '',
    component: Inicio
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'registro',
    component: Registro
  },
  {
    path: 'cliente',
    component: Cliente,
    canActivate: [authGuard, rolGuard],
    data: { rol: 'CLIENTE' }
  },
  {
    path: 'profesional',
    component: Profesional,
    canActivate: [authGuard, rolGuard],
    data: { rol: 'PROFESIONAL' }
  },
  {
    path: 'admin/login',
    component: AdminLogin
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }

];