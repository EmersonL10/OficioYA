import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { CategoriaService } from './categoria';
import { API_URL } from '../api.config';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let http: HttpTestingController;

  const datos = {
    nombre: 'Electricidad',
    descripcion: 'Instalaciones eléctricas'
  };

  const categoria = {
    id: 1,
    ...datos,
    activo: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe listar categorías activas', () => {
    service.listarActivas().subscribe(respuesta => {
      expect(respuesta).toEqual([categoria]);
    });

    const req = http.expectOne(`${API_URL}/publico/categorias`);
    expect(req.request.method).toBe('GET');
    req.flush([categoria]);
  });

  it('debe listar todas las categorías', () => {
    service.listarTodas().subscribe(respuesta => {
      expect(respuesta).toEqual([categoria]);
    });

    const req = http.expectOne(`${API_URL}/admin/categorias`);
    expect(req.request.method).toBe('GET');
    req.flush([categoria]);
  });

  it('debe buscar una categoría por ID', () => {
    service.buscarPorId(1).subscribe(respuesta => {
      expect(respuesta).toEqual(categoria);
    });

    const req = http.expectOne(`${API_URL}/admin/categorias/1`);
    expect(req.request.method).toBe('GET');
    req.flush(categoria);
  });

  it('debe registrar una categoría', () => {
    service.registrar(datos).subscribe(respuesta => {
      expect(respuesta).toEqual(categoria);
    });

    const req = http.expectOne(`${API_URL}/admin/categorias`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);

    req.flush(categoria, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe actualizar una categoría', () => {
    service.actualizar(1, datos).subscribe(respuesta => {
      expect(respuesta).toEqual(categoria);
    });

    const req = http.expectOne(`${API_URL}/admin/categorias/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush(categoria);
  });

  it('debe desactivar una categoría', () => {
    service.desactivar(1).subscribe();

    const req = http.expectOne(`${API_URL}/admin/categorias/1`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null, {
      status: 204,
      statusText: 'No Content'
    });
  });

  it('debe activar una categoría', () => {
    service.activar(1).subscribe();

    const req = http.expectOne(`${API_URL}/admin/categorias/1/activar`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();

    req.flush(null, {
      status: 204,
      statusText: 'No Content'
    });
  });
});