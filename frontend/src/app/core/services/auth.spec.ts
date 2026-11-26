import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { Auth } from './auth';
import { API_URL } from '../api.config';
import {
  Usuario,
  LoginResponse,
  RegistroRequest
} from '../models/api.models';

describe('Auth', () => {
  let service: Auth;
  let http: HttpTestingController;

  const credenciales = {
    correo: 'cliente@example.com',
    contrasena: 'Prueba123456'
  };

  const registro: RegistroRequest = {
    nombres: 'Carlos',
    apellidos: 'Ramirez',
    correo: credenciales.correo,
    contrasena: credenciales.contrasena,
    telefono: '999999999'
  };

  const cliente: Usuario = {
    id: 2,
    nombres: 'Carlos',
    apellidos: 'Ramirez',
    correo: credenciales.correo,
    telefono: registro.telefono,
    rol: 'CLIENTE',
    activo: true,
    fechaRegistro: '2026-11-26T14:00:00'
  };

  const respuestaLogin: LoginResponse = {
    token: 'jwt-simulado',
    tipoToken: 'Bearer',
    usuario: cliente
  };

  beforeEach(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    service.cerrarSesion();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe iniciar sin una sesión activa', () => {
    expect(service.estaAutenticado()).toBe(false);
    expect(service.obtenerToken()).toBeNull();
  });

  it('debe registrar un cliente', () => {
    service.registrar(registro).subscribe(respuesta => {
      expect(respuesta.rol).toBe('CLIENTE');
    });

    const req = http.expectOne(`${API_URL}/auth/registro`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registro);

    req.flush(cliente, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe registrar un profesional', () => {
    service.registrar(registro, true).subscribe(respuesta => {
      expect(respuesta.rol).toBe('PROFESIONAL');
    });

    const req = http.expectOne(
      `${API_URL}/auth/registro-profesional`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registro);

    req.flush({
      ...cliente,
      rol: 'PROFESIONAL'
    }, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe iniciar sesión y almacenar el JWT', () => {
    service.login(credenciales).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaLogin);
    });

    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credenciales);
    req.flush(respuestaLogin);

    expect(service.obtenerToken()).toBe('jwt-simulado');
    expect(service.usuario()).toEqual(cliente);
    expect(service.estaAutenticado()).toBe(true);
    expect(service.tieneRol('CLIENTE')).toBe(true);
    expect(service.tieneRol('ADMIN')).toBe(false);
  });

  it('debe utilizar el endpoint administrativo', () => {
    const datosAdmin = {
      correo: 'admin@example.com',
      contrasena: 'PruebaAdmin123'
    };

    service.loginAdmin(datosAdmin).subscribe(respuesta => {
      expect(respuesta.usuario.rol).toBe('ADMIN');
    });

    const req = http.expectOne(`${API_URL}/auth/login-admin`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datosAdmin);

    req.flush({
      ...respuestaLogin,
      usuario: {
        ...cliente,
        id: 1,
        correo: datosAdmin.correo,
        rol: 'ADMIN'
      }
    });

    expect(service.tieneRol('ADMIN')).toBe(true);
    expect(service.estaAutenticado()).toBe(true);
  });

  it('no debe guardar una sesión con credenciales rechazadas', () => {
    service.login(credenciales).subscribe({
      next: () => {
        throw new Error('Se esperaba un error de autenticación');
      },
      error: error => expect(error.status).toBe(401)
    });

    http.expectOne(`${API_URL}/auth/login`).flush(
      null,
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(service.obtenerToken()).toBeNull();
    expect(service.estaAutenticado()).toBe(false);
  });

  it('debe consultar y actualizar el perfil', () => {
    service.obtenerPerfil().subscribe(respuesta => {
      expect(respuesta).toEqual(cliente);
    });

    const req = http.expectOne(`${API_URL}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush(cliente);

    expect(service.usuario()).toEqual(cliente);
  });

  it('debe eliminar la sesión al cerrar sesión', () => {
    service.login(credenciales).subscribe();

    http.expectOne(`${API_URL}/auth/login`).flush(respuestaLogin);

    service.cerrarSesion();

    expect(service.obtenerToken()).toBeNull();
    expect(service.usuario()).toBeNull();
    expect(service.estaAutenticado()).toBe(false);
    expect(sessionStorage.getItem('usuario')).toBeNull();
  });
});