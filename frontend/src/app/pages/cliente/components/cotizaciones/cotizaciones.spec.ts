import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cotizaciones } from './cotizaciones';

describe('Cotizaciones', () => {
  let component: Cotizaciones;
  let fixture: ComponentFixture<Cotizaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cotizaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Cotizaciones);
    component = fixture.componentInstance;
        fixture.componentRef.setInput('cotizaciones', []);
    fixture.componentRef.setInput('solicitud', {
  id: 1,
  clienteId: 2,
  clienteNombre: 'Carlos Ramirez',
  categoriaId: 1,
  categoriaNombre: 'Electricidad',
  titulo: 'Instalacion electrica',
  descripcion: 'Instalacion de luminarias',
  direccion: 'Pucallpa',
  presupuesto: 250,
  estado: 'ABIERTA',
  fechaCreacion: '2026-11-26T14:00:00'
});
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

