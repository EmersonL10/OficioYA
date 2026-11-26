import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { PublicoService } from './publico';
import { API_URL } from '../api.config';

describe('PublicoService', () => {
  let service: PublicoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PublicoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener el saludo del backend', () => {
    const mensaje = '¡Bienvenido a OficioYA!';

    service.obtenerSaludo().subscribe(respuesta => {
      expect(respuesta).toBe(mensaje);
    });

    const req = http.expectOne(`${API_URL}/publico/saludo`);

    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');

    req.flush(mensaje);
  });

  it('debe propagar un error del servidor', () => {
    service.obtenerSaludo().subscribe({
      next: () => {
        throw new Error('Se esperaba un error HTTP');
      },
      error: error => expect(error.status).toBe(500)
    });

    http.expectOne(`${API_URL}/publico/saludo`).flush(
      'Error interno',
      { status: 500, statusText: 'Internal Server Error' }
    );
  });
});