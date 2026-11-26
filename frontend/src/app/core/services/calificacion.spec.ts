import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { CalificacionService } from './calificacion';
import { API_URL } from '../api.config';
import { Calificacion, CalificacionRequest } from '../models/api.models';

describe('CalificacionService', () => {
  let service: CalificacionService;
  let http: HttpTestingController;

  const datos: CalificacionRequest = {
    contratacionId: 1,
    puntuacion: 5,
    comentario: 'Excelente servicio.'
  };

  const calificacion: Calificacion = {
    id: 1,
    ...datos,
    profesionalId: 1,
    profesionalNombre: 'Miguel Torres',
    clienteNombre: 'Carlos',
    fechaCalificacion: '2026-11-26T16:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CalificacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe registrar una calificación', () => {
    service.registrar(datos).subscribe(respuesta => {
      expect(respuesta).toEqual(calificacion);
    });

    const req = http.expectOne(`${API_URL}/cliente/calificaciones`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);

    req.flush(calificacion, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe consultar las calificaciones del profesional', () => {
    service.listarPorProfesional(1).subscribe(respuesta => {
      expect(respuesta).toEqual([calificacion]);
    });

    const req = http.expectOne(
      `${API_URL}/publico/profesionales/1/calificaciones`
    );

    expect(req.request.method).toBe('GET');
    req.flush([calificacion]);
  });

  it('debe consultar el promedio de calificaciones', () => {
    service.obtenerPromedio(1).subscribe(respuesta => {
      expect(respuesta).toBe(5);
    });

    const req = http.expectOne(
      `${API_URL}/publico/profesionales/1/promedio`
    );

    expect(req.request.method).toBe('GET');
    req.flush(5);
  });
});