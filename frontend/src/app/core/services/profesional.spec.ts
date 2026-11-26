import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ProfesionalService } from './profesional';
import { API_URL } from '../api.config';
import { Profesional, ProfesionalRequest } from '../models/api.models';

describe('ProfesionalService', () => {
  let service: ProfesionalService;
  let http: HttpTestingController;

  const datos: ProfesionalRequest = {
    categoriaId: 1,
    descripcion: 'Especialista en instalaciones eléctricas.',
    experienciaAnios: 5
  };

  const perfil: Profesional = {
    id: 1,
    usuarioId: 3,
    nombres: 'Miguel',
    apellidos: 'Torres',
    categoriaNombre: 'Electricidad',
    ...datos,
    disponible: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProfesionalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe listar profesionales disponibles', () => {
    service.listarDisponibles().subscribe(respuesta => {
      expect(respuesta).toEqual([perfil]);
    });

    const req = http.expectOne(`${API_URL}/publico/profesionales`);
    expect(req.request.method).toBe('GET');
    req.flush([perfil]);
  });

  it('debe buscar profesionales por categoría', () => {
    service.buscarPorCategoria(1).subscribe(respuesta => {
      expect(respuesta).toEqual([perfil]);
    });

    const req = http.expectOne(
      `${API_URL}/publico/profesionales/categoria/1`
    );

    expect(req.request.method).toBe('GET');
    req.flush([perfil]);
  });

  it('debe registrar el perfil profesional', () => {
    service.registrarPerfil(datos).subscribe(respuesta => {
      expect(respuesta).toEqual(perfil);
    });

    const req = http.expectOne(`${API_URL}/profesional/perfil`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);

    req.flush(perfil, {
      status: 201,
      statusText: 'Created'
    });
  });

  it('debe obtener el perfil profesional', () => {
    service.obtenerPerfil().subscribe(respuesta => {
      expect(respuesta).toEqual(perfil);
    });

    const req = http.expectOne(`${API_URL}/profesional/perfil`);
    expect(req.request.method).toBe('GET');
    req.flush(perfil);
  });

  it('debe actualizar el perfil profesional', () => {
    service.actualizarPerfil(datos).subscribe(respuesta => {
      expect(respuesta).toEqual(perfil);
    });

    const req = http.expectOne(`${API_URL}/profesional/perfil`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush(perfil);
  });

  it('debe cambiar la disponibilidad', () => {
    service.cambiarDisponibilidad(false).subscribe(respuesta => {
      expect(respuesta.disponible).toBe(false);
    });

    const req = http.expectOne(
      `${API_URL}/profesional/perfil/disponibilidad?disponible=false`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('disponible')).toBe('false');

    req.flush({
      ...perfil,
      disponible: false
    });
  });
});