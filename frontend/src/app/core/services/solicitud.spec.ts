import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { SolicitudService } from './solicitud';
import { API_URL } from '../api.config';
import { Solicitud, SolicitudRequest } from '../models/api.models';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let http: HttpTestingController;

  const datos: SolicitudRequest = {
    categoriaId: 1,
    titulo: 'Instalación eléctrica',
    descripcion: 'Instalación de luminarias en una vivienda.',
    direccion: 'Pucallpa',
    presupuesto: 250
  };

  const solicitud: Solicitud = {
    id: 1,
    clienteId: 2,
    clienteNombre: 'Carlos Ramirez',
    categoriaNombre: 'Electricidad',
    ...datos,
    estado: 'ABIERTA',
    fechaCreacion: '2026-11-26T14:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SolicitudService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe registrar una solicitud', () => {
    service.registrar(datos).subscribe(respuesta => {
      expect(respuesta).toEqual(solicitud);
    });

    const req = http.expectOne(`${API_URL}/cliente/solicitudes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);

    req.flush(solicitud, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe listar las solicitudes del cliente', () => {
    service.listarMisSolicitudes().subscribe(respuesta => {
      expect(respuesta).toEqual([solicitud]);
    });

    const req = http.expectOne(`${API_URL}/cliente/solicitudes`);
    expect(req.request.method).toBe('GET');
    req.flush([solicitud]);
  });

  it('debe buscar una solicitud por ID', () => {
    service.buscarPorId(1).subscribe(respuesta => {
      expect(respuesta).toEqual(solicitud);
    });

    const req = http.expectOne(`${API_URL}/cliente/solicitudes/1`);
    expect(req.request.method).toBe('GET');
    req.flush(solicitud);
  });

  it('debe actualizar una solicitud', () => {
    service.actualizar(1, datos).subscribe(respuesta => {
      expect(respuesta).toEqual(solicitud);
    });

    const req = http.expectOne(`${API_URL}/cliente/solicitudes/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush(solicitud);
  });

  it('debe cancelar una solicitud', () => {
    service.cancelar(1).subscribe();

    const req = http.expectOne(`${API_URL}/cliente/solicitudes/1`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null, {
      status: 204,
      statusText: 'No Content'
    });
  });

  it('debe consultar solicitudes disponibles', () => {
    service.listarDisponibles().subscribe(respuesta => {
      expect(respuesta.length).toBe(1);
    });

    const req = http.expectOne(`${API_URL}/profesional/solicitudes`);
    expect(req.request.method).toBe('GET');

    req.flush([{
      ...solicitud,
      clienteId: null,
      clienteNombre: 'Cliente',
      direccion: null
    }]);
  });

  it('debe propagar un conflicto de negocio', () => {
    service.cancelar(1).subscribe({
      next: () => {
        throw new Error('Se esperaba un conflicto');
      },
      error: error => expect(error.status).toBe(409)
    });

    http.expectOne(`${API_URL}/cliente/solicitudes/1`).flush(
      { mensaje: 'La solicitud no puede cancelarse' },
      { status: 409, statusText: 'Conflict' }
    );
  });
});