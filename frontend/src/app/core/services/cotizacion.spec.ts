import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { CotizacionService } from './cotizacion';
import { API_URL } from '../api.config';
import { Cotizacion, CotizacionRequest } from '../models/api.models';

describe('CotizacionService', () => {
  let service: CotizacionService;
  let http: HttpTestingController;

  const datos: CotizacionRequest = {
    solicitudId: 1,
    monto: 200,
    descripcion: 'Instalación y revisión eléctrica.',
    plazoDias: 2
  };

  const cotizacion: Cotizacion = {
    id: 1,
    ...datos,
    solicitudTitulo: 'Instalación eléctrica',
    profesionalId: 1,
    profesionalNombre: 'Miguel Torres',
    estado: 'PENDIENTE',
    fechaEnvio: '2026-11-26T14:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CotizacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe registrar una cotización', () => {
    service.registrar(datos).subscribe(respuesta => {
      expect(respuesta).toEqual(cotizacion);
    });

    const req = http.expectOne(`${API_URL}/profesional/cotizaciones`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);

    req.flush(cotizacion, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe listar las cotizaciones del profesional', () => {
    service.listarMisCotizaciones().subscribe(respuesta => {
      expect(respuesta).toEqual([cotizacion]);
    });

    const req = http.expectOne(`${API_URL}/profesional/cotizaciones`);
    expect(req.request.method).toBe('GET');
    req.flush([cotizacion]);
  });

  it('debe listar cotizaciones por solicitud', () => {
    service.listarPorSolicitud(1).subscribe(respuesta => {
      expect(respuesta).toEqual([cotizacion]);
    });

    const req = http.expectOne(
      `${API_URL}/cliente/solicitudes/1/cotizaciones`
    );

    expect(req.request.method).toBe('GET');
    req.flush([cotizacion]);
  });
});