import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ContratacionService } from './contratacion';
import { API_URL } from '../api.config';
import { Contratacion } from '../models/api.models';

describe('ContratacionService', () => {
  let service: ContratacionService;
  let http: HttpTestingController;

  const contrato: Contratacion = {
    id: 1,
    cotizacionId: 1,
    solicitudId: 1,
    solicitudTitulo: 'Instalación eléctrica',
    clienteId: 2,
    clienteNombre: 'Carlos Ramirez',
    profesionalId: 1,
    profesionalNombre: 'Miguel Torres',
    monto: 200,
    estado: 'PENDIENTE',
    fechaContratacion: '2026-11-26T14:00:00',
    fechaInicio: null,
    fechaFinalizacion: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ContratacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe contratar un servicio', () => {
    service.contratar({ cotizacionId: 1 }).subscribe(respuesta => {
      expect(respuesta).toEqual(contrato);
    });

    const req = http.expectOne(`${API_URL}/cliente/contrataciones`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ cotizacionId: 1 });

    req.flush(contrato, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe listar contrataciones del cliente', () => {
    service.listarCliente().subscribe(respuesta => {
      expect(respuesta).toEqual([contrato]);
    });

    const req = http.expectOne(`${API_URL}/cliente/contrataciones`);
    expect(req.request.method).toBe('GET');
    req.flush([contrato]);
  });

  it('debe listar contrataciones del profesional', () => {
    service.listarProfesional().subscribe(respuesta => {
      expect(respuesta).toEqual([contrato]);
    });

    const req = http.expectOne(`${API_URL}/profesional/contrataciones`);
    expect(req.request.method).toBe('GET');
    req.flush([contrato]);
  });

  it('debe solicitar el inicio del servicio', () => {
    service.iniciar(1).subscribe(respuesta => {
      expect(respuesta.estado).toBe('EN_PROCESO');
    });

    const req = http.expectOne(
      `${API_URL}/profesional/contrataciones/1/iniciar`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();

    req.flush({
      ...contrato,
      estado: 'EN_PROCESO',
      fechaInicio: '2026-11-26T15:00:00'
    });
  });

  it('debe solicitar la finalización del servicio', () => {
    service.finalizar(1).subscribe(respuesta => {
      expect(respuesta.estado).toBe('FINALIZADA');
    });

    const req = http.expectOne(
      `${API_URL}/cliente/contrataciones/1/finalizar`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();

    req.flush({
      ...contrato,
      estado: 'FINALIZADA',
      fechaInicio: '2026-11-26T15:00:00',
      fechaFinalizacion: '2026-11-26T16:00:00'
    });
  });

  it('debe solicitar la cancelación del servicio', () => {
    service.cancelar(1).subscribe(respuesta => {
      expect(respuesta.estado).toBe('CANCELADA');
    });

    const req = http.expectOne(
      `${API_URL}/cliente/contrataciones/1/cancelar`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();

    req.flush({
      ...contrato,
      estado: 'CANCELADA'
    });
  });
});