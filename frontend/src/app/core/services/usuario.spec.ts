import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { UsuarioService } from './usuario';
import { API_URL } from '../api.config';
import { Usuario } from '../models/api.models';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let http: HttpTestingController;

  const usuario: Usuario = {
    id: 2,
    nombres: 'Carlos',
    apellidos: 'Ramirez',
    correo: 'cliente@example.com',
    telefono: '999999999',
    rol: 'CLIENTE',
    activo: true,
    fechaRegistro: '2026-11-26T14:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe listar los usuarios', () => {
    service.listar().subscribe(respuesta => {
      expect(respuesta).toEqual([usuario]);
    });

    const req = http.expectOne(`${API_URL}/admin/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush([usuario]);
  });

  it('debe buscar un usuario por ID', () => {
    service.buscarPorId(2).subscribe(respuesta => {
      expect(respuesta).toEqual(usuario);
    });

    const req = http.expectOne(`${API_URL}/admin/usuarios/2`);
    expect(req.request.method).toBe('GET');
    req.flush(usuario);
  });

  it('debe propagar un acceso denegado', () => {
    service.listar().subscribe({
      next: () => {
        throw new Error('Se esperaba un acceso denegado');
      },
      error: error => expect(error.status).toBe(403)
    });

    http.expectOne(`${API_URL}/admin/usuarios`).flush(
      null,
      { status: 403, statusText: 'Forbidden' }
    );
  });
});